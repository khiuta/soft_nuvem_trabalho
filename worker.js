import axios from 'axios';
import sharp from 'sharp';
import db from './models/index.js';
import { s3Client } from './lib/s3Client.js';
import { sqsClient } from './lib/sqsClient.js';
import { ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
const BUCKET_NAME = 'bibliotech-amzn-storage';

const startWorker = async () => {
  console.log('Worker started. Listening the queue...');

  // loop infinito para sempre buscar novas mensagens
  while (true) {
    try {
      // pede mensagens da fila
      const data = await sqsClient.send(new ReceiveMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20 // Long Polling: espera até 20s por uma mensagem
      }));

      if (data.Messages && data.Messages.length > 0) {
        const message = data.Messages[0];
        const body = JSON.parse(message.Body);
        const { bookId, title, author, publisher } = body;

        console.log(`Processing job for book: ${title}`);

        try {
          // busca o livro no google books
          const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`;
          const response = await axios.get(googleBooksApiUrl);

          if (!response.data.items || response.data.items.length === 0) {
            console.error('Book not found in Google Books. No book cover provided.')
          }

          let book = response.data.items;
          book = book.filter(book =>
            book.volumeInfo.authors && book.volumeInfo.authors.some(bookAuthor =>
              bookAuthor.toLowerCase().includes(author.toLowerCase())
            )
          );
         
          if (!book || book.length === 0) {
            console.error('Book not found in Google Books with this author. No book cover provided.')
          }
          
          if (!book[0].volumeInfo.imageLinks || !book[0].volumeInfo.imageLinks.thumbnail) {
            console.error('Book found in Google Books, but no book cover provided.')
          }
         
          let imageUrl = book[0].volumeInfo.imageLinks.thumbnail;
          imageUrl = imageUrl.replace('zoom=1', 'zoom=0');
            
          const imageResponse = await axios({
            url: imageUrl,
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' }
          });

          const buffer = Buffer.from(imageResponse.data, 'binary');
          // rescaling the image
          const resizedImageBuffer = await sharp(buffer)
            .resize({ width: 100, height: 350, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 100, progressive: true })
            .toBuffer();
            
          const s3Key = `covers/${bookId}-${Date.now()}.jpg`; // chave única

          await s3Client.send(
            new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: s3Key,
              Body: resizedImageBuffer,
              ContentType: 'image/jpeg'
            }),
          );

          // atualiza o livro no db
          await db.Book.update(
            { image_key: s3Key }, 
            { where: { id: bookId } }
          );
              
          console.log(`Job finished successfully for book: ${title}`);
          
          // deleta a mensagem da fila
          await sqsClient.send(new DeleteMessageCommand({
            QueueUrl: SQS_QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle
          }));
         
        } catch (jobError) {
          console.error(`Error while processing job for book: [${title}]: ${jobError.message}`);
          // a mensagem não é deletada, mas só colocada de volta para tentar de novo depois
        }
      }     
    } catch (error) {
      console.error('Error while searching for SQS messages: ', error);
      // espera um pouco antes de tentar de novo
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

startWorker();

