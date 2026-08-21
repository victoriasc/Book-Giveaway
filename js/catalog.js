/*
  CATALOG.JS
  Builds the grid of book cards on the index page, and re-sorts it
  when the visitor picks a different sort order.
*/

let allBooks = [];

function sortBooks(books, mode) {
  const copy = [...books];
  const byTitle = (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  const byAuthor = (a, b) => a.author.localeCompare(b.author, undefined, { sensitivity: "base" });

  switch (mode) {
    case "author":
      copy.sort(byAuthor);
      break;
    case "availability":
      // Available books first, given-away books after; alphabetical by title within each group.
      copy.sort((a, b) => (b.available === a.available ? byTitle(a, b) : (b.available ? 1 : -1)));
      break;
    case "title":
    default:
      copy.sort(byTitle);
  }
  return copy;
}

function renderCards(books) {
  const grid = document.getElementById("catalog-grid");
  grid.innerHTML = "";

  books.forEach(book => {
    const card = document.createElement("a");
    card.className = `book-card ${book.available ? "is-available" : "is-taken"}`;
    card.href = `book.html?id=${encodeURIComponent(book.id)}`;

    card.innerHTML = `
      <span class="call-number">${escapeHtml(callNumber(book))}</span>
      <div class="cover-frame">
        <img src="${escapeHtml(book.frontImage)}" alt="Cover of ${escapeHtml(book.title)}">
        <span class="stamp ${book.available ? "is-available" : "is-taken"}">
          ${book.available ? "Available" : "Given away"}
        </span>
      </div>
      <h2>${escapeHtml(book.title)} <span class="author-inline">— ${escapeHtml(book.author)}</span></h2>
    `;

    attachImageFallback(card.querySelector("img"));
    grid.appendChild(card);
  });
}

function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  const countEl = document.getElementById("catalog-count");
  const sortSelect = document.getElementById("sort-select");
  allBooks = Array.isArray(window.BOOKS) ? window.BOOKS : [];

  if (allBooks.length === 0) {
    grid.innerHTML = "";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No books catalogued yet — add some in js/books-data.js.";
    grid.after(empty);
    countEl.textContent = "0 titles";
    sortSelect.closest(".sort-control").hidden = true;
    return;
  }

  const availableCount = allBooks.filter(b => b.available).length;
  countEl.textContent = `${allBooks.length} title${allBooks.length === 1 ? "" : "s"} · ${availableCount} available`;

  renderCards(sortBooks(allBooks, sortSelect.value));

  sortSelect.addEventListener("change", () => {
    renderCards(sortBooks(allBooks, sortSelect.value));
  });
}

document.addEventListener("DOMContentLoaded", renderCatalog);
