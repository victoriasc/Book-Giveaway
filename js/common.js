/*
  COMMON.JS
  Small shared helpers. You shouldn't need to touch this file.
*/

// A simple placeholder shown if a photo file is missing or hasn't been
// added yet, so the page never shows a broken-image icon.
const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
      <rect width="300" height="400" fill="#e4dcc7"/>
      <g stroke="#9C7B3D" stroke-width="2" fill="none">
        <rect x="60" y="60" width="180" height="240" rx="2"/>
        <line x1="60" y1="100" x2="240" y2="100"/>
        <line x1="90" y1="150" x2="210" y2="150"/>
        <line x1="90" y1="175" x2="210" y2="175"/>
        <line x1="90" y1="200" x2="210" y2="200"/>
      </g>
      <text x="150" y="335" font-family="monospace" font-size="13"
        fill="#6b6552" text-anchor="middle" letter-spacing="1">
        PHOTO NOT ADDED YET
      </text>
    </svg>
  `);

function attachImageFallback(imgEl) {
  imgEl.addEventListener("error", () => {
    imgEl.src = PLACEHOLDER_IMG;
    imgEl.alt = imgEl.alt ? imgEl.alt + " (photo not added yet)" : "Photo not added yet";
  }, { once: true });
}

// Builds a short library-style "call number" from the author and title,
// e.g. "F. Scott Fitzgerald" / "The Great Gatsby" -> "F · GAT"
function callNumber(book) {
  const authorInitial = (book.author || "?").trim().charAt(0).toUpperCase();
  const titleWords = (book.title || "")
    .replace(/^(the|a|an)\s+/i, "")
    .trim();
  const titleCode = titleWords.slice(0, 3).toUpperCase() || "???";
  return `${authorInitial} · ${titleCode}`;
}

// Best-effort "last name" for sorting authors by surname, e.g.
// "F. Scott Fitzgerald" -> "Fitzgerald". Just takes the final word, so
// suffixes like "Jr." or multi-word surnames won't be perfect — good
// enough for a personal book list.
function authorSortKey(author) {
  const trimmed = (author || "").trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

// Normalizes a book's tags into a clean array of trimmed, non-empty strings.
function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map(t => String(t).trim()).filter(Boolean);
}

// Turns a comma-separated string (as typed in the admin form) into a tags array.
function parseTagsInput(str) {
  return normalizeTags((str || "").split(","));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
