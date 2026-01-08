import { consumeQueue } from "./lib/rabbitmqClient.js";
import axios from "axios";
import sharp from "sharp";
import db from "./models/index.js";
import { s3Client } from "./lib/s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = "bibliotech-minio-storage";

const processMessage = async (data) => {
  const { bookId, title, author } = data;
  console.log(`Processing job for book: ${title}`);

  try {
    const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`;

    console.log(`Searching Google Books for title: ${title}`);
    const response = await axios.get(googleBooksApiUrl);

    let foundBook = null;
    let foundCover = true;

    if (response.data.items && response.data.items.length > 0) {
      const items = response.data.items;

      // gets the first result with the author
      foundBook = items.find((item) => {
        const authors = item.volumeInfo.authors || [];
        return authors.some((apiAuthor) =>
          apiAuthor.toLowerCase().includes(author.toLowerCase()),
        );
      });
    }

    if (!foundBook) {
      console.error(
        `Book found by title, but author "${author}" did not match any results. No cover.`,
      );
      foundCover = false;
    }

    const imageLinks = foundBook.volumeInfo.imageLinks;
    if (!imageLinks || !imageLinks.thumbnail) {
      console.error("Book matches title and author, but has no cover image.");
      foundCover = false;
    }

    let imageUrl = imageLinks.thumbnail;
    imageUrl = imageUrl.replace("zoom=1", "zoom=0");
    imageUrl = imageUrl.replace(/^http:\/\//i, "https://");

    const imageResponse = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      },
    });

    const buffer = Buffer.from(imageResponse.data, "binary");

    const resizedImageBuffer = await sharp(buffer)
      .resize({
        width: 400,
        height: 600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    const s3Key = foundCover
      ? `covers/${bookId}-${Date.now()}.jpg`
      : "covers/Logo.png";

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: resizedImageBuffer,
        ContentType: "image/jpeg",
      }),
    );

    // 7. Update DB
    await db.Book.update({ image_key: s3Key }, { where: { id: bookId } });

    console.log(`Job finished successfully for book: ${title}`);
  } catch (jobError) {
    console.error(`Error processing book [${title}]: ${jobError.message}`);
    // throw jobError;
  }
};

const startWorker = async () => {
  console.log("Worker Service Starting...");
  try {
    await consumeQueue(processMessage);
  } catch (error) {
    console.error("Worker failed to start:", error);
    setTimeout(startWorker, 5000);
  }
};

startWorker();
