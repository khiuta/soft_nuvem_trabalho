import axios from 'axios'

const API_URL = 'http://localhost:8000/book';

const booksToSeed = [
  {
    title: "O Senhor dos Anéis: A Sociedade do Anel",
    author: "J.R.R. Tolkien",
    volume: 1,
    edition: 1,
    publisher: "HarperCollins",
    release_year: 1954,
    quantity: 5,
    available: true
  },
  {
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    volume: 1,
    edition: 1,
    publisher: "Rocco",
    release_year: 1997,
    quantity: 3,
    available: true
  },
  {
    title: "O Código Da Vinci",
    author: "Dan Brown",
    volume: 1,
    edition: 1,
    publisher: "Arqueiro",
    release_year: 2003,
    quantity: 4,
    available: true
  },
  {
    title: 'O Senhor dos Anéis: As duas torres',
    author: 'J.R.R. Tolkien',
    publisher: 'HarperCollins Brasil',
    edition: 1,
    release_year: 2019,
    quantity: 20,
    available: true
  },
  {
    title: 'O Senhor dos Anéis: O retorno do rei',
    author: 'J.R.R. Tolkien',
    publisher: 'HarperCollins Brasil',
    edition: 1,
    release_year: 2019,
    quantity: 20,
    available: true
  },
  {
    title: 'Locke & Key/The Sandman Universe: Hell & Gone (2021-) #2',
    author: 'Joe Hill',
    publisher: 'DC Comics',
    edition: null,
    release_year: 2021,
    quantity: 20,
    available: true
  },
  {
    title: 'Locke & Key: The Guide to Known Keys',
    author: 'Joe Hill',
    publisher: 'IDW Publishing',
    edition: null,
    release_year: 2021,
    quantity: 20,
    available: true
  }
];

const seedBooks = async () => {
  console.log(`Starting seed process for ${booksToSeed.length} books...`);
  console.log(`Target API: ${API_URL}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const book of booksToSeed) {
    try {
      const response = await axios.post(API_URL, book);
      
      console.log(`✅ Success: "${book.title}"`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: "${book.title}"`);
      if (error.response) {
        console.error(`   Reason: ${JSON.stringify(error.response.data)}`);
      } else {
        console.error(`   Reason: ${error.message}`);
      }
      errorCount++;
    }
    
    await new Promise(r => setTimeout(r, 500)); 
  }

  console.log(`\nSeeding complete!`);
  console.log(`Success: ${successCount} | Failed: ${errorCount}`);
};

seedBooks();