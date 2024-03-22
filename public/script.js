// Жанры по дефолту
const defaultGenres = ['Рассказ', 'Приключения', 'Сказка'];

// Отображение первого меню
const setupWelcomeScreen = (name) => {
  window.electronAPI.getWelcomeMessage().then(message => {
    document.getElementById('welcomeMessage').textContent = `${name}, ${message}`;
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'block';
  });
};

document.getElementById('welcomeButton').addEventListener('click', () => {
  const name = document.getElementById('welcomeInput').value;
  if (name) {
    window.electronAPI.addUser(name);
    setupWelcomeScreen(name);
  }
});

document.getElementById('addBook').addEventListener('click', () => {
  document.getElementById('mainScreen').style.display = 'none';
  document.getElementById('addBookScreen').style.display = 'block';
});

// Уведомление шаблон
const showNotification = (message) => {
  const notification = document.createElement('div');
  notification.id = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  notification.style.display = 'block';
  notification.style.opacity = 0;
  let opacity = 0;
  const fadeIn = setInterval(() => {
    if (opacity < 1) {
      opacity += 0.1;
      notification.style.opacity = opacity;
    } else {
      clearInterval(fadeIn);
    }
  }, 30);

  setTimeout(() => {
    const fadeOut = setInterval(() => {
      if (opacity > 0) {
        opacity -= 0.1;
        notification.style.opacity = opacity;
      } else {
        clearInterval(fadeOut);
        notification.remove();
      }
    }, 30);
  }, 3000);
};

document.getElementById('createBookButton').addEventListener('click', () => {
  const title = document.getElementById('bookTitleInput').value.trim();
  const author = document.getElementById('bookAuthorInput').value.trim();
  const description = document.getElementById('bookDescriptionInput').value.trim();
  const genre = document.getElementById('bookGenreInput').value.trim();

  if (!title || !author || !description || !genre) {
    showNotification('Заполните все поля!');
    return; 
  }

  const genreExists = defaultGenres.includes(genre);
  if (!genreExists) {
    window.electronAPI.addGenre(genre);
  }

  window.electronAPI.addBook({ title, author, description, genre });

  window.electronAPI.onBookAdded((response) => {
    if (response.success) {
      showNotification('Книга успешно добавлена!');
      if (!genreExists) {
        showGenresList();
      }
      document.getElementById('addBookScreen').style.display = 'none';
      document.getElementById('mainScreen').style.display = 'block';
    } else {
      showNotification('Нельзя добавить одинаковые книги!');
    }
  });
});

document.getElementById('backButton').addEventListener('click', () => {
  document.getElementById('addBookScreen').style.display = 'none';
  document.getElementById('mainScreen').style.display = 'block';
  document.getElementById('bookTitleInput').value = '';
  document.getElementById('bookAuthorInput').value = '';
  document.getElementById('bookDescriptionInput').value = '';
  document.getElementById('bookGenreInput').value = '';
});

document.getElementById('deleteBook').addEventListener('click', () => {
  document.getElementById('mainScreen').style.display = 'none';
  document.getElementById('deleteBookScreen').style.display = 'block';
  loadBooks();
});

document.querySelectorAll('#backButton').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('deleteBookScreen').style.display = 'none';
    document.getElementById('addBookScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'block';
  });
});

let existingBooks = [];

// Получение всех книг
function loadBooks() {
    window.electronAPI.getAllBooks();
}

window.electronAPI.onAllBooksReceived((books) => {
  existingBooks = books;
  const booksList = document.getElementById('booksList');
  booksList.innerHTML = ''; 
  if (books.length === 0) {
    booksList.innerHTML = '<p>Книги отсутствуют.</p>';
  } else {
    books.forEach((book) => {
      const bookButton = document.createElement('button');
      bookButton.textContent = book.title;
      bookButton.onclick = () => toggleBookDetails(book);
      booksList.appendChild(bookButton);
    });
  }
});

// Удаление книги
function deleteBook(title) {
    window.electronAPI.deleteBook(title);
}

window.electronAPI.onBookDeleted((response) => {
  if (response.success) {
    showNotification('Книга успешно удалена!');
    loadBooks();
  } else {
    console.error(response.message);
  }
});

// Отображение меню с данными о книге
function toggleBookDetails(book) {
  document.getElementById('deleteBookScreen').style.display = 'none';
  const bookDetails = document.getElementById('bookDetails');
  bookDetails.innerHTML = `
    <p>Название книги: ${book.title}</p>
    <p>Автор книги: ${book.author}</p>
    <p>Описание книги: ${book.description}</p>
    <p>Жанр книги: ${book.genre}</p>
  `;
  document.getElementById('bookDetailsScreen').style.display = 'block';
  document.getElementById('deleteThisBook').onclick = () => {
    deleteBook(book.title);
    document.getElementById('bookDetailsScreen').style.display = 'none';
    document.getElementById('deleteBookScreen').style.display = 'block';
  };
}

document.getElementById('backToDeletionScreen').addEventListener('click', () => {
  document.getElementById('bookDetailsScreen').style.display = 'none';
  document.getElementById('deleteBookScreen').style.display = 'block';
});

window.electronAPI.onBookDeleted((response) => {
  if (response.success) {
    showNotification('Вы успешно удалили книгу!');
    document.getElementById('bookDetailsScreen').style.display = 'none';
    document.getElementById('deleteBookScreen').style.display = 'block';
    loadBooks();
  } else {
    console.error(response.message);
  }
});

document.getElementById('backToShowBooks').addEventListener('click', () => {
  document.getElementById('showBooksScreen').style.display = 'none';
  document.getElementById('mainScreen').style.display = 'block';
});

// Еще одно отображение но без кнопки Назад, привязано к другому меню
function showBookDetails(book) {
  document.getElementById('showBooksScreen').style.display = 'none';
  const bookDetails = document.getElementById('bookDetailsdel');
  bookDetails.innerHTML = `
    <h3>${book.title}</h3>
    <p>Автор: ${book.author}</p>
    <p>Описание: ${book.description}</p>
    <p>Жанр: ${book.genre}</p>
  `;
  document.getElementById('bookDetailsScreendel').style.display = 'block';
}

// Функция для возврата в главное меню
function backToMainScreen() {
  document.getElementById('bookDetailsScreendel').style.display = 'none';
  document.getElementById('mainScreen').style.display = 'block';
}

// Получение списка книг
function showBooksList() {
  window.electronAPI.getAllBooks();
}

window.electronAPI.onAllBooksReceived((books) => {
  const booksListView = document.getElementById('booksListView');
  booksListView.innerHTML = ''; 
  if (books.length === 0) {
    booksListView.innerHTML = '<p>Книги отсутствуют.</p>';
  } else {
    books.forEach((book) => {
      const bookButton = document.createElement('button');
      bookButton.textContent = book.title;
      bookButton.addEventListener('click', () => showBookDetails(book));
      booksListView.appendChild(bookButton);
    });
  }
});

document.getElementById('viewBooks').addEventListener('click', () => {
  document.getElementById('mainScreen').style.display = 'none';
  document.getElementById('showBooksScreen').style.display = 'block';
  showBooksList();
});

document.getElementById('backFromDetailsButton').addEventListener('click', backToMainScreen);

function backToMainScreen() {
  document.getElementById('bookDetailsScreendel').style.display = 'none';
  document.getElementById('showBooksScreen').style.display = 'block';
}

document.getElementById('showGenres').addEventListener('click', () => {
  document.getElementById('showBooksScreen').style.display = 'none';
  document.getElementById('GenreScreen').style.display = 'block';
  showGenresList();
});

document.getElementById('backFromGenreScreen').addEventListener('click', () => {
  document.getElementById('GenreScreen').style.display = 'none';
  document.getElementById('showBooksScreen').style.display = 'block';
});

// Получение и отображение всех жанров
function showGenresList() {
  const genresListView = document.getElementById('genresListView');
  genresListView.innerHTML = '';

  defaultGenres.forEach((genreName) => {
    const genreButton = document.createElement('button');
    genreButton.textContent = genreName;
    genreButton.addEventListener('click', () => {
      window.electronAPI.getBooksByGenre(genreName);
    });
    genresListView.appendChild(genreButton);
  });

  window.electronAPI.getAllGenres();
}

window.electronAPI.onAllGenresReceived((genres) => {
  const genresListView = document.getElementById('genresListView');
  genres.forEach((genre) => {
    if (!defaultGenres.includes(genre.name)) {
      const genreButton = document.createElement('button');
      genreButton.textContent = genre.name;
      genreButton.addEventListener('click', () => {
        window.electronAPI.getBooksByGenre(genre.name);
      });
      genresListView.appendChild(genreButton);
    }
  });
});

window.electronAPI.onBooksByGenreReceived((books) => {
  const booksListView = document.getElementById('booksListView');
  booksListView.innerHTML = '';
  books.forEach((book) => {
    const bookButton = document.createElement('button');
    bookButton.textContent = book.title;
    bookButton.addEventListener('click', () => showBookDetails(book));
    booksListView.appendChild(bookButton);
  });
  document.getElementById('GenreScreen').style.display = 'none';
  document.getElementById('showBooksScreen').style.display = 'block';
});

document.getElementById('findBook').addEventListener('click', () => {
  document.getElementById('mainScreen').style.display = 'none';
  document.getElementById('searchBookScreen').style.display = 'block';
});

document.getElementById('backToMainScreen').addEventListener('click', () => {
  document.getElementById('searchBookScreen').style.display = 'none';
  document.getElementById('mainScreen').style.display = 'block';
  document.getElementById('bookDetailsScreenWin').style.display = 'none';
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchText = e.target.value;
  if (searchText.length > 0) {
    window.electronAPI.searchBooks(searchText);
  } else {
    document.getElementById('searchResults').innerHTML = '';
  }
});

window.electronAPI.onSearchResultsReceived((books) => {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = '';
  books.forEach((book) => {
    const bookButton = document.createElement('button');
    bookButton.textContent = book.title;
    bookButton.addEventListener('click', () => {
      showBookDetailsSearch(book);
    });
    searchResults.appendChild(bookButton);
  });
});

// Функция для поиска
function showBookDetailsSearch(book) {
  document.getElementById('showBooksScreen').style.display = 'none';
  const bookDetails = document.getElementById('bookDetailsWin');
  bookDetails.innerHTML = `
    <h3>${book.title}</h3>
    <p>Автор: ${book.author}</p>
    <p>Описание: ${book.description}</p>
    <p>Жанр: ${book.genre}</p>
  `;
  document.getElementById('bookDetailsScreenWin').style.display = 'block';
}

// Работа с пользователем
window.electronAPI.onUserExists((event, name) => setupWelcomeScreen(name));
