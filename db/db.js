const sqlite3 = require('sqlite3').verbose();
const path = require('path'); 
const os = require('os');
const welcomeMessages = require('../messages/welcome');

// Пути к базам данных
const dbPath = path.join(__dirname, './db/users.db');
const booksDbPath = path.join(__dirname, './db/books.db');

// Создание базы данных
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
  if (err) console.error(err.message);
  db.run('CREATE TABLE IF NOT EXISTS users(name text, device_id text UNIQUE)');
});

const dbooks = new sqlite3.Database(booksDbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
  if (err) console.error(err.message);
  dbooks.run('CREATE TABLE IF NOT EXISTS books(title TEXT, author TEXT, description TEXT, genre TEXT)');
});

// Работа с функциями базы данных
const addBook = (bookData, callback) => {
  dbooks.get('SELECT title FROM books WHERE title = ?', [bookData.title], (err, row) => {
    if (!row) {
      dbooks.run('INSERT INTO books(title, author, description, genre) VALUES(?, ?, ?, ?)', [bookData.title, bookData.author, bookData.description, bookData.genre], callback);
    } else {
      callback(new Error('Книга уже существует'));
    }
  });
};

const getUserByDeviceId = (deviceId, callback) => db.get('SELECT name FROM users WHERE device_id = ?', [deviceId], callback);
const addUser = (name, callback) => db.run('INSERT INTO users(name, device_id) VALUES(?, ?)', [name, os.hostname()], callback);
const getWelcomeMessage = () => welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

const getAllBooks = callback => dbooks.all('SELECT * FROM books', [], callback);
const deleteBook = (title, callback) => dbooks.run('DELETE FROM books WHERE title = ?', [title], callback);
const getAllGenres = callback => dbooks.all('SELECT DISTINCT genre AS name FROM books', [], callback);
const getBooksByGenre = (genre, callback) => dbooks.all('SELECT * FROM books WHERE genre = ?', [genre], callback);
const searchBooks = (searchText, callback) => dbooks.all('SELECT * FROM books WHERE title LIKE ? OR description LIKE ?', [`%${searchText}%`, `%${searchText}%`], callback);
const addGenre = (genreName, callback) => dbooks.run('INSERT INTO genres(name) VALUES(?)', [genreName], callback);

module.exports = { getUserByDeviceId, addUser, getWelcomeMessage, addBook, getAllBooks, deleteBook, getAllGenres, getBooksByGenre, searchBooks, addGenre };
