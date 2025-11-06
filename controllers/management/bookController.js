import db from '../../models';
import axios from 'axios';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logAction } from '../../services/LoggerService.js';

import upload from '../../config/multer';
import excel from 'node-xlsx';

const { Book } = db;
//Conexão com o S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

class BookController {
  async store(req, res) {
    const {
      title, author, publisher, edition, release_year, quantity
    } = req.body;

    try {
      // procura se o livro já existe no banco de dados
      const existingBook = await Book.findOne({
        where: {
          title: title,
          author: author,
          publisher: publisher
        }
      });
      if (existingBook != null){
        // se o livro já existe, apenas atualiza sua quantidade
        const quantityToAdd = Number(quantity);
        
        existingBook.quantity += quantityToAdd;
        
        const updatedBook = await existingBook.save();

        await logAction('UPDATE_BOOK_QUANTITY', { id: updatedBook.id, new_quantity: updatedBook.quantity });
        return res.status(200).json(updatedBook);
      }

      // procurando o livro na api do google pra puxar a imagem
      const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}`;
      const response = await axios.get(googleBooksApiUrl);

      if (!response.data.items || response.data.items.length === 0) {
        return res.status(404).json({ error: 'Livro não encontrado na API do Google.' });
      }

      let book = response.data.items;

      book = book.filter(book =>
        book.volumeInfo.authors && book.volumeInfo.authors.some(bookAuthor =>
          bookAuthor.toLowerCase().includes(author.toLowerCase())
        )
      );

      if (!book || book.length === 0) {
        return res.status(404).json({ error: 'Livro não encontrado com esse autor.' });
      }

      if (!book[0].volumeInfo.imageLinks || !book[0].volumeInfo.imageLinks.thumbnail) {
        return res.status(404).json({ error: 'Livro encontrado, mas não possui imagem de capa.' });
      }

      let imageUrl = book[0].volumeInfo.imageLinks.thumbnail;
      imageUrl = imageUrl.replace('zoom=1', 'zoom=0');

      const imageResponse = await axios({
        url: imageUrl,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
      });

      const buffer = Buffer.from(imageResponse.data, 'binary');

      const resizedImageBuffer = await sharp(buffer)
        .resize({ width: 100, height: 350, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 100, progressive: true })
        .toBuffer();

      /*const imagePath = path.join('./', 'public', '/images', `${book[0].id}.jpg`);
      fs.writeFileSync(imagePath, resizedImageBuffer);*/
      
      // UPLOAD PARA O S3 (STORE)
      const imageKey = `capas/livro-${book[0].id}-${Date.now()}.jpg`;
      const uploadCommand = new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: imageKey,
          Body: resizedImageBuffer,
          ContentType: 'image/jpeg'
      });
      await s3Client.send(uploadCommand);
      const imagePath = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;

      const newBook = await Book.create({ title, author, publisher, edition, release_year, image_path: imagePath, quantity });

      await logAction('CREATE_BOOK', { id: newBook.id, title: newBook.title });
      return res.status(200).json(newBook);
    } catch (error) {
      console.error(error); 
      return res.status(500).json({ 
        error: 'Ocorreu um erro no servidor.',
        details: error.message 
      });
    }
  }

  async bulkStore(req, res) {
    // essa parte de buscar a imagem do livro pode ser feita como uma função desacoplada via SQS
    const uploader = upload.single('file'); // 'file' é o nome do campo no form-data

    uploader(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ errors: [err.code] });
      }

      if (!req.file) {
        return res.status(400).json({ errors: ['Nenhum arquivo enviado.'] });
      }

      try {
        const { filename } = req.file;
        // arquivo temporário
        const filePath = path.join('uploads', 'files', filename); // onde o arquivo vai ser armazenado

        // parse do arquivo xlsx
        const obj = excel.parse(fs.readFileSync(filePath));
        const rows = obj[0].data.slice(1); // pula o cabeçalho

        // agrupando livros duplicados no arquivo e somando suas quantidades
        const bookMap = new Map();
        for (const row of rows) {
          if (!row || row.length === 0) continue; // pula linhas vazias

          // pega os campos de acordo com as colunas do excel
          const title = row[0];
          const author = row[1];
          const publisher = row[5];
          
          // chave única pro livro
          const key = `${title}|${author}|${publisher}`; 
          
          if (bookMap.has(key)) {
            // atualiza apenas a quantidade se o livro já tá no map
            bookMap.get(key).quantity += 1;
          } else {
            // adiciona no map se é um novo livro
            bookMap.set(key, {
              title: title,
              author: author,
              publisher: publisher,
              release_year: row[3],
              edition: row[4],
              quantity: 1,
            });
          }
        }

        const processedBooks = [];
        for (const [key, bookData] of bookMap.entries()) {
          const { title, author, publisher, edition, release_year, quantity } = bookData;

          try {
            // procura se o livro já existe no banco de dados
            const existingBook = await Book.findOne({
              where: { title, author, publisher }
            });

            // só atualiza a quantidade caso exista
            if (existingBook) {
              existingBook.quantity += quantity;
              const updatedBook = await existingBook.save();
              await logAction('UPDATE_BOOK_QUANTITY_BULK', { id: updatedBook.id, new_quantity: updatedBook.quantity });
              processedBooks.push(updatedBook);
            } 
            else {
              const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}`;
              const response = await axios.get(googleBooksApiUrl);

              if (!response.data.items || response.data.items.length === 0) {
                throw new Error('Livro não encontrado na API do Google.');
              }
              
              const books = response.data.items;
              // filtra pelo autor
              const foundBook = books.find(book =>
                book.volumeInfo.authors && book.volumeInfo.authors.some(bookAuthor =>
                  bookAuthor.toLowerCase().includes(author.toLowerCase().split('/')[0])
                )
              );

              if (!foundBook) {
                throw new Error('Livro encontrado, mas o autor não corresponde.');
              }

              let imagePath = path.join('./', 'public', '/images', 'logo-png.png'); // imagem padrão
              //let imagePath = `https://SEU-BUCKET-NAME.s3.SEU-REGION.amazonaws.com/logo-png.png`; (SUBSTITUIR PELO LINK DA IMAGEM PADRÃO NO S3 !!)

              // tenta baixar a imagem
              try {
                let imageUrl = foundBook.volumeInfo.imageLinks.thumbnail;
                imageUrl = imageUrl.replace('zoom=1', 'zoom=0');

                const imageResponse = await axios({
                  url: imageUrl,
                  responseType: 'arraybuffer',
                  headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' 
                  }
                });

                const buffer = Buffer.from(imageResponse.data, 'binary');
                const resizedImageBuffer = await sharp(buffer)
                  .resize({ width: 100, height: 350, fit: 'inside', withoutEnlargement: true })
                  .jpeg({ quality: 100, progressive: true })
                  .toBuffer();

                /*imagePath = path.join('./', 'public', '/images', `${foundBook.id}.jpg`);
                fs.writeFileSync(imagePath, resizedImageBuffer);*/

                // UPLOAD PARA O S3 (BULKSTORE)
                const imageKey = `capas/livro-${foundBook.id}-${Date.now()}.jpg`;
                const uploadCommand = new PutObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: imageKey,
                    Body: resizedImageBuffer,
                    ContentType: 'image/jpeg'
                });
                await s3Client.send(uploadCommand);
                imagePath = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;

              } catch (imageError) {
                console.warn(`Falha ao baixar imagem para ${title}. Usando imagem padrão.`);
              }
              
              const newBook = await Book.create({
                title,
                author,
                publisher,
                edition,
                release_year,
                image_path: imagePath,
                quantity,
              });
              await logAction('CREATE_BOOK_BULK', { id: newBook.id, title: newBook.title });
              processedBooks.push(newBook);
            }
          } catch (bookError) {
            console.error(`Falha ao processar o livro: ${title}. Erro: ${bookError.message}`);
          }
        }

        // deleta o arquivo temporário
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Falha ao deletar arquivo temporário:", unlinkErr);
        });

        // retorna os livros criados/atualizados
        return res.status(200).json(processedBooks);

      } catch (e) {
        console.error(e);
        return res.status(500).json({ errors: ['Erro ao processar o arquivo.', e.message] });
      }
    });
  }

  async index(req, res) {
    try {
      const books = await Book.findAll();

      if(books){
        await logAction('READ_ALL_BOOKS', { count: books.length });
        return res.status(200).json(books);
      } else {
        return res.status(200).json({message: 'Nenhum livro cadastrado.'});
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor.',
        details: error.message
      })
    }
  }

  async update(req, res){
    const { id, title, author, publisher, edition, release_year, quantity, available } = req.body;

    try {
      const bookToUpdate = await Book.findOne({
        where: {
          id,
        }
      });

      if(bookToUpdate){
        // se um novo dado foi passado, atualiza o dado, se não, permanece o mesmo de antes
        bookToUpdate.title = title ? title : bookToUpdate.title;
        bookToUpdate.author = author ? author : bookToUpdate.author;
        bookToUpdate.publisher = publisher ? publisher : bookToUpdate.publisher;
        bookToUpdate.edition = edition ? edition : bookToUpdate.edition;
        bookToUpdate.release_year = release_year ? release_year : bookToUpdate.release_year;
        bookToUpdate.quantity = quantity ? quantity : bookToUpdate.quantity;
        bookToUpdate.available = available ? available : bookToUpdate.available;

        const updatedBook = await bookToUpdate.save();

        await logAction('UPDATE_BOOK', { id: updatedBook.id });
        return res.status(200).json(updatedBook);
      } else {
        return res.status(404).json({message: 'Esse livro não existe no acervo.'});
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor.',
        details: error.message
      })
    }
  }


}

export default new BookController();