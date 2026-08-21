/*
  BOOKS-DATA.JS
  -------------
  This is the only file you need to edit to add, remove, or update books.

  To add a new book:
    1. Make a new folder inside /images with a short name for the book,
       e.g. images/the-great-gatsby/
    2. Put two photos in it named front.jpg and back.jpg
       (jpg, png, or webp all work — just keep the file names "front" and "back",
       or update frontImage/backImage below to match whatever you named them)
    3. Copy one of the entries below, paste it above the closing "];",
       and fill in your book's details.
    4. "id" must be unique and URL-safe (letters, numbers, hyphens only) —
       it's what links the index page to the book's own page.

  Set "available" to true while the book is still up for grabs,
  and switch it to false the moment someone claims it.
*/

const BOOKS = [
  {
    id: "sample-book",
    title: "The Sample Book",
    author: "Jane Author",
    condition: "Good — light shelf wear, no marks inside",
    available: true,
    frontImage: "images/sample-book/front.jpg",
    backImage: "images/sample-book/back.jpg",
    notes: "Pickup only, inner-north Melbourne. Message me if you'd like it."
  }
];

// Make BOOKS reachable as window.BOOKS for the other scripts on the page.
// (A top-level "const" in a plain <script> doesn't attach to window on its own.)
window.BOOKS = BOOKS;
