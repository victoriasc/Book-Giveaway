# Free to a good home — book giveaway site

A tiny static site for listing books you're giving away: an index page with
every book, and a linked detail page per book showing front/back photos,
title, author, condition, and availability.

## File structure

```
index.html            the catalog / homepage
book.html             the template used for every individual book page
css/style.css         all styling
js/books-data.js      <-- the only file you normally need to edit
js/common.js          small shared helpers
js/catalog.js         builds the index page grid
js/book.js            builds a single book's page
images/<book-id>/     front.jpg + back.jpg for each book
```

Book detail pages aren't separate HTML files — `book.html` is a single
template that reads which book to show from the URL, e.g.
`book.html?id=the-great-gatsby`. That link is generated automatically from
`js/books-data.js`, so you never have to hand-write a new page.

## Easiest way to manage books: admin.html

Open `admin.html` in your browser for a form-based editor — no code editing
required. It isn't linked from the public site, so bookmark it for yourself.

- **In Chrome or Edge:** click "Connect project folder" and pick the folder
  that contains `index.html`. From then on, adding, editing, or deleting a
  book — and the photos you pick in the form — save straight to disk
  automatically. Just commit and push the changes afterwards.
- **In other browsers** (or if you'd rather not connect a folder): edit
  books in the page as normal, then click "Download books-data.js" and
  replace the file in your project with the one you downloaded. You'll need
  to move photo files into the right `images/<book-id>/` folder by hand —
  the form shows you the exact path to use.

Editing `js/books-data.js` directly (below) still works too, any time.

## Adding a book by hand

1. Create a folder in `images/` named after the book, e.g.
   `images/the-great-gatsby/`.
2. Add two photos there: `front.jpg` and `back.jpg` (png/webp work too —
   just update the file names in the entry below to match).
3. Open `js/books-data.js` and add an entry to the `BOOKS` array:

   ```js
   {
     id: "the-great-gatsby",        // unique, URL-safe (letters/numbers/hyphens)
     title: "The Great Gatsby",
     author: "F. Scott Fitzgerald",
     condition: "Good — light shelf wear",
     available: true,
     frontImage: "images/the-great-gatsby/front.jpg",
     backImage: "images/the-great-gatsby/back.jpg",
     notes: "Optional extra line, e.g. pickup details."
   }
   ```

4. Save. That's it — the new book shows up on the index page automatically,
   and its page is live at `book.html?id=the-great-gatsby`.

## Marking a book as given away

Change that book's `available` field in `js/books-data.js` from `true` to
`false`. The stamp on both the index card and the book's page switches from
"Available" to "Given away" automatically.

## Removing a book entirely

Delete its entry from the `BOOKS` array (and optionally its `images/` folder).

## Previewing locally

Because the pages load `books-data.js` as a script (not `fetch`), you can
just open `index.html` directly in a browser — no local server required.

## Publishing on GitHub Pages

1. Create a new GitHub repository and push this folder's contents to it.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch",
   pick the `main` branch and the `/ (root)` folder, then save.
4. GitHub will give you a URL like `https://yourusername.github.io/your-repo/`
   — that's your site. It can take a minute or two to go live after the
   first push.
5. Any time you edit `books-data.js` (or add photos) and push again, the
   site updates automatically.
