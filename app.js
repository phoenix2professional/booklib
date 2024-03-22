const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const dbFunctions = require('./db/db.js');

// Интерфейс
const createWindow = () => {
  const win = new BrowserWindow({
    width: 550,
    height: 500,
    backgroundColor: '#2a2e2a',
    resizable: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });

  win.loadFile('public/index.html').then(() => {
    dbFunctions.getUserByDeviceId(os.hostname(), (err, row) => {
      if (row) win.webContents.send('user-exists', row.name);
    });
  });
};

app.on('ready', createWindow);
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Обработка событий
ipcMain.on('add-user', (event, name) => {
  dbFunctions.addUser(name, (err) => {
    event.reply('add-user-response', err ? { success: false, message: 'Ошибка при добавлении пользователя:' } : { success: true, message: 'Пользователь добавлен' });
  });
});

ipcMain.handle('get-welcome-message', async () => dbFunctions.getWelcomeMessage());

ipcMain.on('add-book', (event, bookData) => {
  dbFunctions.addBook(bookData, (err) => {
    event.reply('add-book-response', err ? { success: false, message: err.message } : { success: true, message: 'Книга успешно добавлена' });
  });
});

ipcMain.on('get-all-books', (event) => {
  dbFunctions.getAllBooks((err, books) => {
    event.reply('get-all-books-response', err ? { success: false, message: 'Ошибка при получении списка книг: ' + err.message } : { success: true, books: books });
  });
});

ipcMain.on('delete-book', (event, title) => {
  dbFunctions.deleteBook(title, (err) => {
    event.reply('delete-book-response', err ? { success: false, message: 'Ошибка при удалении книги:' + err.message } : { success: true, message: 'Книга успешно удалена' });
  });
});

ipcMain.on('get-all-genres', (event) => {
  dbFunctions.getAllGenres((err, genres) => {
    event.reply('get-all-genres-response', err ? { success: false, message: 'Ошибка при получении списка жанров: ' + err.message } : { success: true, genres: genres });
  });
});

ipcMain.on('get-books-by-genre', (event, genre) => {
  dbFunctions.getBooksByGenre(genre, (err, books) => {
    event.reply('get-books-by-genre-response', err ? { success: false, message: 'Ошибка при получении книг по жанру: ' + err.message } : { success: true, books: books });
  });
});

ipcMain.on('search-books', (event, searchText) => {
  dbFunctions.searchBooks(searchText, (err, books) => {
    event.reply('search-books-response', err ? { success: false, message: 'Ошибка при поиске книг: ' + err.message } : { success: true, books: books });
  });
});

ipcMain.on('addGenre', (event, genreName) => {
  dbFunctions.addGenre(genreName, (error) => {
    if (!error) event.sender.send('genreAdded');
  });
});
