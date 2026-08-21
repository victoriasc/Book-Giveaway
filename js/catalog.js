/*
  CATALOG.JS
  Builds the grid of book cards on the index page.
*/

function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  const countEl = document.getElementById("catalog-count");
  const books = Array.isArray(window.BOOKS) ? window.BOOKS : [];

  if (books.length === 0) {
    grid.innerHTML = "";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No books catalogued yet — add some in js/books-data.js.";
    grid.after(empty);
    countEl.textContent = "0 titles";
    return;
  }

  const availableCount = books.filter(b => b.available).length;
  countEl.textContent = `${books.length} title${books.length === 1 ? "" : "s"} · ${availableCount} available`;

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

document.addEventListener("DOMContentLoaded", renderCatalog);
