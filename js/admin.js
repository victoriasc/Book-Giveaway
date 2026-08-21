/*
  ADMIN.JS
  Powers admin.html — a form-based editor for js/books-data.js.

  Two modes:
  - CONNECTED (Chrome/Edge, after clicking "Connect project folder"):
    reads and writes js/books-data.js directly, and can copy your picked
    photo files straight into the right images/<id>/ folder.
  - FALLBACK (Safari/Firefox, or before connecting): edits happen in memory
    and you download the updated books-data.js yourself; photo pickers just
    help you preview and rename the files to move into place by hand.
*/

let books = [];
let projectDirHandle = null;   // set once the user connects a folder
let editingIndex = null;       // null = not editing, "new" = adding, number = editing that index
let pendingFrontFile = null;
let pendingBackFile = null;

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheEls();
  wireStaticEvents();
  tryFallbackLoad();
  renderList();
});

function cacheEls() {
  els.connectPanel = document.getElementById("connect-panel");
  els.connectBtn = document.getElementById("connect-btn");
  els.statusText = document.getElementById("status-text");
  els.list = document.getElementById("admin-list");
  els.addBtn = document.getElementById("add-btn");
  els.formSection = document.getElementById("form-section");
  els.form = document.getElementById("book-form");
  els.formTitle = document.getElementById("form-title");
  els.cancelBtn = document.getElementById("cancel-btn");
  els.deleteBtn = document.getElementById("delete-btn");
  els.toast = document.getElementById("toast");
  els.rawTextarea = document.getElementById("raw-textarea");
  els.downloadBtn = document.getElementById("download-btn");

  els.fId = document.getElementById("f-id");
  els.fTitle = document.getElementById("f-title");
  els.fAuthor = document.getElementById("f-author");
  els.fCondition = document.getElementById("f-condition");
  els.fAvailable = document.getElementById("f-available");
  els.fNotes = document.getElementById("f-notes");
  els.fFrontPath = document.getElementById("f-front-path");
  els.fBackPath = document.getElementById("f-back-path");
  els.fFrontFile = document.getElementById("f-front-file");
  els.fBackFile = document.getElementById("f-back-file");
  els.frontPreview = document.getElementById("front-preview");
  els.backPreview = document.getElementById("back-preview");
  els.frontDownload = document.getElementById("front-download");
  els.backDownload = document.getElementById("back-download");
}

function wireStaticEvents() {
  if ("showDirectoryPicker" in window) {
    els.connectBtn.addEventListener("click", connectFolder);
  } else {
    els.connectBtn.disabled = true;
    els.connectBtn.textContent = "Not supported in this browser";
    setStatus("This browser can't save straight to disk — edit here, then use " +
      "\u201cDownload books-data.js\u201d below and move photos into place by hand.");
  }

  els.addBtn.addEventListener("click", () => openForm("new"));
  els.cancelBtn.addEventListener("click", closeForm);
  els.deleteBtn.addEventListener("click", handleDelete);
  els.form.addEventListener("submit", handleSave);

  els.fTitle.addEventListener("input", () => {
    if (editingIndex === "new" && !els.fId.dataset.touched) {
      els.fId.value = slugify(els.fTitle.value);
    }
  });
  els.fId.addEventListener("input", () => { els.fId.dataset.touched = "1"; });

  els.fFrontFile.addEventListener("change", (e) => handleFileChosen(e, "front"));
  els.fBackFile.addEventListener("change", (e) => handleFileChosen(e, "back"));

  els.downloadBtn.addEventListener("click", downloadFile);
}

/* ---------------- loading ---------------- */

// Best-effort load when no folder is connected yet: works when admin.html
// is served over http(s) from the same folder as js/books-data.js.
async function tryFallbackLoad() {
  if (projectDirHandle) return;
  try {
    const res = await fetch("js/books-data.js");
    if (!res.ok) return;
    const text = await res.text();
    if (projectDirHandle) return; // a folder was connected while this fetch was in flight — don't clobber it
    const parsed = parseBooksFile(text);
    if (parsed && !projectDirHandle) {
      books = parsed;
      renderList();
    }
  } catch (e) {
    // fine — likely opened as a local file:// page; user can connect a folder instead
  }
}

async function connectFolder() {
  try {
    projectDirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
  } catch (e) {
    return; // user cancelled the picker
  }

  try {
    const jsDir = await projectDirHandle.getDirectoryHandle("js");
    const fileHandle = await jsDir.getFileHandle("books-data.js");
    const file = await fileHandle.getFile();
    const text = await file.text();
    const parsed = parseBooksFile(text);
    if (parsed) books = parsed;
    els.connectPanel.classList.add("connected");
    setStatus(`Connected to "${projectDirHandle.name}" — changes save automatically.`);
    els.connectBtn.textContent = "Reconnect";
    renderList();
  } catch (e) {
    setStatus(`Connected to "${projectDirHandle.name}", but couldn't find js/books-data.js there — ` +
      `make sure you picked the folder that contains index.html.`, true);
    projectDirHandle = null; // don't keep writing to a folder we couldn't confirm is right
    els.connectPanel.classList.remove("connected");
  }
}

// Turns the text of books-data.js into a JS array, without trusting eval
// on arbitrary content — we only ever run files this same admin tool wrote,
// or the one originally shipped with the site.
function parseBooksFile(text) {
  try {
    const fn = new Function(text + "\nreturn typeof BOOKS !== 'undefined' ? BOOKS : null;");
    const result = fn();
    return Array.isArray(result) ? result : null;
  } catch (e) {
    console.error("Could not parse books-data.js", e);
    return null;
  }
}

/* ---------------- rendering ---------------- */

function renderList() {
  els.list.innerHTML = "";

  if (books.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-note";
    p.textContent = "No books yet — click \u201c+ Add a book\u201d to create the first one.";
    els.list.appendChild(p);
  }

  books.forEach((book, i) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <img class="thumb" src="${escapeHtml(book.frontImage || "")}" alt="">
      <div class="info">
        <div class="t">${escapeHtml(book.title || "Untitled")}</div>
        <div class="a">${escapeHtml(book.author || "Unknown author")}</div>
      </div>
      <div class="row-actions">
        <button type="button" class="pill-toggle ${book.available ? "is-available" : "is-taken"}" data-action="toggle" data-index="${i}">
          ${book.available ? "Available" : "Given away"}
        </button>
        <button type="button" class="btn secondary" data-action="edit" data-index="${i}">Edit</button>
      </div>
    `;
    row.querySelector('[data-action="toggle"]').addEventListener("click", () => toggleAvailable(i));
    row.querySelector('[data-action="edit"]').addEventListener("click", () => openForm(i));
    const thumb = row.querySelector("img");
    thumb.addEventListener("error", () => { thumb.style.visibility = "hidden"; }, { once: true });
    els.list.appendChild(row);
  });

  updateRawPreview();
}

function updateRawPreview() {
  els.rawTextarea.value = generateFileText(books);
}

/* ---------------- form ---------------- */

function openForm(target) {
  editingIndex = target;
  els.form.reset();
  delete els.fId.dataset.touched;
  pendingFrontFile = null;
  pendingBackFile = null;
  els.frontPreview.src = PLACEHOLDER_IMG;
  els.backPreview.src = PLACEHOLDER_IMG;
  delete els.frontPreview.dataset.objectUrl;
  delete els.backPreview.dataset.objectUrl;
  els.frontDownload.hidden = true;
  els.backDownload.hidden = true;
  els.deleteBtn.hidden = target === "new";

  if (target === "new") {
    els.formTitle.textContent = "Add a book";
  } else {
    const book = books[target];
    els.formTitle.textContent = "Edit book";
    els.fId.value = book.id || "";
    els.fId.dataset.touched = "1";
    els.fTitle.value = book.title || "";
    els.fAuthor.value = book.author || "";
    els.fCondition.value = book.condition || "";
    els.fAvailable.checked = !!book.available;
    els.fNotes.value = book.notes || "";
    els.fFrontPath.value = book.frontImage || "";
    els.fBackPath.value = book.backImage || "";
    if (book.frontImage) els.frontPreview.src = book.frontImage;
    if (book.backImage) els.backPreview.src = book.backImage;
    attachImageFallback(els.frontPreview);
    attachImageFallback(els.backPreview);
  }

  els.formSection.hidden = false;
  els.formSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeForm() {
  editingIndex = null;
  els.formSection.hidden = true;
}

function handleFileChosen(evt, which) {
  const file = evt.target.files[0];
  if (!file) return;

  if (which === "front") pendingFrontFile = file; else pendingBackFile = file;

  const previewImg = which === "front" ? els.frontPreview : els.backPreview;
  const pathField = which === "front" ? els.fFrontPath : els.fBackPath;
  const downloadLink = which === "front" ? els.frontDownload : els.backDownload;

  if (previewImg.dataset.objectUrl) URL.revokeObjectURL(previewImg.dataset.objectUrl);
  const objectUrl = URL.createObjectURL(file);
  previewImg.src = objectUrl;
  previewImg.dataset.objectUrl = objectUrl;

  const id = els.fId.value.trim() || slugify(els.fTitle.value) || "book";
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  pathField.value = `images/${id}/${which}.${ext}`;

  if (downloadLink) {
    downloadLink.href = objectUrl;
    downloadLink.download = `${which}.${ext}`;
    downloadLink.hidden = false;
  }
}

async function handleSave(evt) {
  evt.preventDefault();
  const id = els.fId.value.trim();

  if (!id || !/^[a-z0-9-]+$/.test(id)) {
    showToast("Give the book an id using only lowercase letters, numbers, and hyphens.", true);
    return;
  }
  const duplicate = books.some((b, i) => b.id === id && i !== editingIndex);
  if (duplicate) {
    showToast("That id is already used by another book — pick a unique one.", true);
    return;
  }

  const entry = {
    id,
    title: els.fTitle.value.trim(),
    author: els.fAuthor.value.trim(),
    condition: els.fCondition.value.trim(),
    available: els.fAvailable.checked,
    frontImage: els.fFrontPath.value.trim() || `images/${id}/front.jpg`,
    backImage: els.fBackPath.value.trim() || `images/${id}/back.jpg`,
    notes: els.fNotes.value.trim()
  };

  // Copy any newly picked photos into place if we have disk access.
  if (projectDirHandle && (pendingFrontFile || pendingBackFile)) {
    try {
      const imagesDir = await projectDirHandle.getDirectoryHandle("images", { create: true });
      const bookDir = await imagesDir.getDirectoryHandle(id, { create: true });
      if (pendingFrontFile) await writeFileToDir(bookDir, filenameFromPath(entry.frontImage), pendingFrontFile);
      if (pendingBackFile) await writeFileToDir(bookDir, filenameFromPath(entry.backImage), pendingBackFile);
    } catch (e) {
      showToast("Saved the book's details, but couldn't copy the photos automatically: " + e.message, true);
    }
  }

  if (editingIndex === "new") {
    books.push(entry);
  } else {
    books[editingIndex] = entry;
  }

  closeForm();
  renderList();
  await persist();

  if (!projectDirHandle && (pendingFrontFile || pendingBackFile)) {
    showToast("Saved in the editor. Use the \u201cdownload photo\u201d link next to each picture to save it, " +
      `move it into images/${id}/, then download books-data.js below.`);
  }
}

function handleDelete() {
  if (editingIndex === "new" || editingIndex === null) return;
  const book = books[editingIndex];
  if (!confirm(`Remove "${book.title}" from the list? This won't delete its photos.`)) return;
  books.splice(editingIndex, 1);
  closeForm();
  renderList();
  persist();
}

function toggleAvailable(i) {
  books[i].available = !books[i].available;
  renderList();
  persist();
}

/* ---------------- persistence ---------------- */

async function persist() {
  if (projectDirHandle) {
    try {
      const jsDir = await projectDirHandle.getDirectoryHandle("js", { create: true });
      await writeFileToDir(jsDir, "books-data.js", generateFileText(books));
      const time = new Date().toLocaleTimeString();
      setStatus(`Connected to "${projectDirHandle.name}" — saved ${time}.`);
    } catch (e) {
      showToast("Couldn't save to disk: " + e.message, true);
    }
  } else {
    updateRawPreview();
  }
}

async function writeFileToDir(dirHandle, filename, contents) {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
}

function downloadFile() {
  const text = generateFileText(books);
  const blob = new Blob([text], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "books-data.js";
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- helpers ---------------- */

function generateFileText(list) {
  return `/*
  BOOKS-DATA.JS
  Generated by admin.html. You can still hand-edit this file if you'd like —
  it's just a plain array of book objects.
*/

const BOOKS = ${JSON.stringify(list, null, 2)};

window.BOOKS = BOOKS;
`;
}

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function filenameFromPath(path) {
  const parts = (path || "").split("/");
  return parts[parts.length - 1] || "front.jpg";
}

function setStatus(msg, isError) {
  els.statusText.textContent = msg;
  els.statusText.style.color = isError ? "var(--brick)" : "";
}

let toastTimer = null;
function showToast(msg, isError) {
  els.toast.textContent = msg;
  els.toast.className = "toast" + (isError ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { els.toast.textContent = ""; }, 5000);
}
