const { contextBridge, ipcRenderer } = require('electron');

// Рендеринг
contextBridge.exposeInMainWorld('electronAPI', {
  addUser: name => ipcRenderer.send('add-user', name),
  getWelcomeMessage: () => ipcRenderer.invoke('get-welcome-message'), 
  onUserExists: callback => ipcRenderer.on('user-exists', callback),
  addBook: (bookData) => ipcRenderer.send('add-book', bookData),
  onBookAdded: (callback) => ipcRenderer.on('add-book-response', (event, response) => callback(response)),
  deleteBook: (title) => ipcRenderer.send('delete-book', title),
  onBookDeleted: (callback) => ipcRenderer.on('delete-book-response', (event, response) => callback(response)),
  getAllBooks: () => ipcRenderer.send('get-all-books'),
  onAllBooksReceived: (callback) => ipcRenderer.on('get-all-books-response', (event, response) => {
    if (response.success) {
      callback(response.books);
    } else {
      console.error(response.message);
    }
  }),
  getAllGenres: () => ipcRenderer.send('get-all-genres'),
  onAllGenresReceived: (callback) => ipcRenderer.on('get-all-genres-response', (event, response) => {
    if (response.success) {
      callback(response.genres);
    } else {
      console.error(response.message);
    }
  }),
  getBooksByGenre: (genre) => ipcRenderer.send('get-books-by-genre', genre),
  onBooksByGenreReceived: (callback) => ipcRenderer.on('get-books-by-genre-response', (event, response) => {
    if (response.success) {
      callback(response.books);
    } else {
      console.error(response.message);
    }
  }),
  searchBooks: (searchText) => ipcRenderer.send('search-books', searchText),
  onSearchResultsReceived: (callback) => ipcRenderer.on('search-books-response', (event, response) => {
    if (response.success) {
      callback(response.books);
    } else {
      console.error(response.message);
    }
  }),
  addGenre: (genreName) => ipcRenderer.send('add-genre', genreName),
  onGenreAdded: (callback) => ipcRenderer.on('genre-added', (event, ...args) => callback(...args)),

  // Чистка
  cleanup: () => {
    ipcRenderer.removeAllListeners([
      'user-exists', 'add-book-response', 'delete-book-response',
      'get-all-books-response', 'get-all-genres-response',
      'get-books-by-genre-response', 'search-books-response', 'genre-added'
    ]);
  }
});
