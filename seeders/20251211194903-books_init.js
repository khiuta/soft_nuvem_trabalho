'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await queryInterface.bulkInsert('books', [{
    title: 'O Senhor dos Anéis: A Sociedade do Anel',
    author: 'J.R.R. Tolkien',
    publisher: 'HarperCollins Brasil',
    edition: 1,
    release_year: 2019,
    quantity: 20,
    available: true
   }, {
    title: 'O Senhor dos Anéis: As duas torres',
    author: 'J.R.R. Tolkien',
    publisher: 'HarperCollins Brasil',
    edition: 1,
    release_year: 2019,
    quantity: 20,
    available: true
   }, {
    title: 'O Senhor dos Anéis: O retorno do rei',
    author: 'J.R.R. Tolkien',
    publisher: 'HarperCollins Brasil',
    edition: 1,
    release_year: 2019,
    quantity: 20,
    available: true
   }, {
    title: 'Locke & Key/The Sandman Universe: Hell & Gone (2021-) #2',
    author: 'Joe Hill',
    publisher: 'DC Comics',
    edition: null,
    release_year: 2021,
    quantity: 20,
    available: true
   }, {
    title: 'Locke & Key: The Guide to Known Keys',
    author: 'Joe Hill',
    publisher: 'IDW Publishing',
    edition: null,
    release_year: 2021,
    quantity: 20,
    available: true
   }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
