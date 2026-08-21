/*
  BOOK.JS
  Reads ?id=<book-id> from the URL and renders that book's detail page.
*/

function renderBook() {
  const main = document.getElementById("book-main");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const books = Array.isArray(window.BOOKS) ? window.BOOKS : [];
  const book = books.find(b => b.id === id);

  document.title = book ? `${book.title} — Free to a good home` : "Book not found";

  if (!book) {
    main.innerHTML = `
      <div class="not-found">
        <p class="call-number">404</p>
        <h1>Couldn't find that book</h1>
        <p><a href="index.html">Back to the full list</a></p>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <p class="call-number">${escapeHtml(callNumber(book))}</p>
    <h1>${escapeHtml(book.title)}</h1>
    <p class="byline">${escapeHtml(book.author)}</p>
    ${normalizeTags(book.tags).length
      ? `<p class="card-tags detail-tags">${normalizeTags(book.tags).map(t => `<span class="tag-chip-static">${escapeHtml(t)}</span>`).join("")}</p>`
      : ""}

    <div class="photo-spread">
      <figure>
        <div class="photo-frame"><img id="img-front" alt="Front cover of ${escapeHtml(book.title)}"></div>
        <figcaption>Front</figcaption>
      </figure>
      <figure>
        <div class="photo-frame"><img id="img-back" alt="Back cover of ${escapeHtml(book.title)}"></div>
        <figcaption>Back</figcaption>
      </figure>
    </div>

    <dl class="detail-facts">
      <div class="fact">
        <dt>Condition</dt>
        <dd>${escapeHtml(book.condition || "Not specified")}</dd>
      </div>
      <div class="fact">
        <dt>Status</dt>
        <dd class="status-line">
          ${book.available ? "Up for grabs" : "No longer available"}
          <span class="stamp ${book.available ? "is-available" : "is-taken"}">
            ${book.available ? "Available" : "Given away"}
          </span>
        </dd>
      </div>
    </dl>

    ${book.notes ? `<p class="notes">${escapeHtml(book.notes)}</p>` : ""}
  `;

  const frontImg = document.getElementById("img-front");
  const backImg = document.getElementById("img-back");
  frontImg.src = book.frontImage;
  backImg.src = book.backImage;
  attachImageFallback(frontImg);
  attachImageFallback(backImg);
}

document.addEventListener("DOMContentLoaded", renderBook);
