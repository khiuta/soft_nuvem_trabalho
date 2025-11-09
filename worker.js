import 'dotenv/config'; 
import db from './models';
import axios from 'axios';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { logAction } from './services/LoggerService'; 

const { Book } = db;

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});

const S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const SQS_QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;
const DEFAULT_IMAGE_URL = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/logo-png.png`;

// Lógica trazida do bookController.js para processar cada mensagem
const processImageMessage = async (bookId, title, author) => {
  let imagePath = DEFAULT_IMAGE_URL; 
  let foundBookId = 'default';

  try {
    // 1. Busca no Google
    const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}`;
    const response = await axios.get(googleBooksApiUrl);
    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Livro não encontrado no Google.');
    }

    let book = response.data.items.find(b =>
      b.volumeInfo.authors && b.volumeInfo.authors.some(a => a.toLowerCase().includes(author.toLowerCase()))
    );
    if (!book || !book.volumeInfo.imageLinks || !book.volumeInfo.imageLinks.thumbnail) {
      throw new Error('Livro encontrado, mas sem imagem.');
    }
    foundBookId = book.id;

    // Baixa a imagem
    let imageUrl = book.volumeInfo.imageLinks.thumbnail.replace('zoom=1', 'zoom=0');
    const imageResponse = await axios({ url: imageUrl, responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageResponse.data, 'binary');

    // Processa com Sharp
    const resizedImageBuffer = await sharp(buffer)
      .resize({ width: 100, height: 350, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 100, progressive: true })
      .toBuffer();

    // Envia para o S3
    const imageKey = `capas/livro-${foundBookId}-${Date.now()}.jpg`;
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME, Key: imageKey, Body: resizedImageBuffer, ContentType: 'image/jpeg'
    });
    await s3Client.send(uploadCommand);
    imagePath = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
    
    console.log(`[Worker] Imagem processada com sucesso para: ${title}`);

  } catch (error) {
    console.warn(`[Worker] Falha ao processar imagem para ${title}: ${error.message}. Usando imagem padrão.`);
    await logAction('PROCESS_IMAGE_FAILED', { bookId, title, error: error.message });
  }

  // Atualiza o caminho da imagem no banco
  await Book.update({ image_path: imagePath }, { where: { id: bookId } });
  await logAction('PROCESS_IMAGE_SUCCESS', { bookId, imagePath });
};

// Loop principal do worker
const startWorker = async () => {
  console.log('[Worker] Iniciando... Buscando mensagens na fila.');
  
  while (true) {
    try {
      // Pede mensagens (Long Polling de 20 segundos)
      const receiveCommand = new ReceiveMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20
      });
      const { Messages } = await sqsClient.send(receiveCommand);

      if (Messages && Messages.length > 0) {
        const message = Messages[0];
        const body = JSON.parse(message.Body);
        
        console.log(`[Worker] Mensagem recebida. Processando livro: ${body.title}`);

        // Processa a imagem
        await processImageMessage(body.bookId, body.title, body.author);

        // Deleta a mensagem da fila após o processamento
        const deleteCommand = new DeleteMessageCommand({
          QueueUrl: SQS_QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle
        });
        await sqsClient.send(deleteCommand);
        
        console.log(`[Worker] Mensagem processada e deletada. Aguardando a próxima...`);
      }
      // Caso n haja mensagens, o loop reinicia
    } catch (error) {
      console.error('[Worker] Erro no loop principal:', error);
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s de espera antes de tentar novamente
    }
  }
};

startWorker();