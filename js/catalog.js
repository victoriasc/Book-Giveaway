/*
  CATALOG.JS
  Builds the grid of book cards on the index page, and re-sorts / filters it
  as the visitor picks a sort order, searches, or clicks a filter.
*/

let allBooks = [];
let activeTags = new Set();
let availabilityFilter = "all"; // "all" | "available" | "taken"
let searchQuery = "";

function sortBooks(books, mode) {
  const copy = [...books];
  const byTitle = (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  const byAuthor = (a, b) => authorSortKey(a.author).localeCompare(authorSortKey(b.author), undefined, { sensitivity: "base" });

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

function filterBooksByTags(books, tags) {
  if (tags.size === 0) return books;
  const wanted = [...tags].map(t => t.toLowerCase());
  return books.filter(book =>
    normalizeTags(book.tags).some(t => wanted.includes(t.toLowerCase()))
  );
}

function filterBooksByAvailability(books, filter) {
  if (filter === "available") return books.filter(b => b.available);
  if (filter === "taken") return books.filter(b => !b.available);
  return books;
}

function filterBooksBySearch(books, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return books;
  return books.filter(book =>
    (book.title || "").toLowerCase().includes(q) ||
    (book.author || "").toLowerCase().includes(q)
  );
}

function renderTagFilters() {
  const bar = document.getElementById("tag-filters");
  if (!bar) return;

  const seen = new Map(); // lowercase -> original casing, first seen
  allBooks.forEach(book => {
    normalizeTags(book.tags).forEach(tag => {
      const key = tag.toLowerCase();
      if (!seen.has(key)) seen.set(key, tag);
    });
  });

  if (seen.size === 0) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  bar.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "tag-chip" + (activeTags.size === 0 ? " is-active" : "");
  allBtn.textContent = "All";
  allBtn.addEventListener("click", () => {
    activeTags.clear();
    renderTagFilters();
    applyAndRender();
  });
  bar.appendChild(allBtn);

  [...seen.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: "base" }))
    .forEach(([key, label]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-chip" + (activeTags.has(key) ? " is-active" : "");
      btn.textContent = label;
      btn.addEventListener("click", () => {
        if (activeTags.has(key)) activeTags.delete(key); else activeTags.add(key);
        renderTagFilters();
        applyAndRender();
      });
      bar.appendChild(btn);
    });
}

function wireAvailabilityFilter() {
  const group = document.getElementById("availability-filters");
  if (!group) return;
  const buttons = [...group.querySelectorAll("[data-availability]")];
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      availabilityFilter = btn.dataset.availability;
      buttons.forEach(b => b.classList.toggle("is-active", b === btn));
      applyAndRender();
    });
  });
}

function wireSearch() {
  const input = document.getElementById("search-input");
  if (!input) return;
  input.addEventListener("input", () => {
    searchQuery = input.value;
    applyAndRender();
  });
}

function renderCards(books) {
  const grid = document.getElementById("catalog-grid");
  grid.innerHTML = "";

  if (books.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No books match that search or filter.";
    grid.appendChild(empty);
    return;
  }

  books.forEach(book => {
    const card = document.createElement("a");
    card.className = `book-card ${book.available ? "is-available" : "is-taken"}`;
    card.href = `book.html?id=${encodeURIComponent(book.id)}`;

    const tags = normalizeTags(book.tags);
    const tagsHtml = tags.length
      ? `<p class="card-tags">${tags.map(t => `<span class="tag-chip-static">${escapeHtml(t)}</span>`).join("")}</p>`
      : "";

    card.innerHTML = `
      <span class="call-number">${escapeHtml(callNumber(book))}</span>
      <div class="cover-frame">
        <img src="${escapeHtml(book.frontImage)}" alt="Cover of ${escapeHtml(book.title)}">
        <span class="stamp ${book.available ? "is-available" : "is-taken"}">
          ${book.available ? "Available" : "Given away"}
        </span>
      </div>
      <h2>${escapeHtml(book.title)} <span class="author-inline">— ${escapeHtml(book.author)}</span></h2>
      ${tagsHtml}
    `;

    attachImageFallback(card.querySelector("img"));
    grid.appendChild(card);
  });
}

function applyAndRender() {
  const sortSelect = document.getElementById("sort-select");
  let filtered = filterBooksByTags(allBooks, activeTags);
  filtered = filterBooksByAvailability(filtered, availabilityFilter);
  filtered = filterBooksBySearch(filtered, searchQuery);
  renderCards(sortBooks(filtered, sortSelect.value));
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
    const toolbar = document.querySelector(".catalog-toolbar");
    if (toolbar) toolbar.hidden = true;
    const bar = document.getElementById("tag-filters");
    if (bar) bar.hidden = true;
    return;
  }

  const availableCount = allBooks.filter(b => b.available).length;
  countEl.textContent = `${allBooks.length} title${allBooks.length === 1 ? "" : "s"} · ${availableCount} available`;

  renderTagFilters();
  wireAvailabilityFilter();
  wireSearch();
  applyAndRender();

  sortSelect.addEventListener("change", applyAndRender);
}

document.addEventListener("DOMContentLoaded", renderCatalog);
