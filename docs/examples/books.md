---
layout: default
title: Book Library
parent: Examples
nav_order: 1
---

# Book Library Example
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

This example shows how to create a book library display with DataCards.

## Basic Book Display

A simple card display for your book collection:

```markdown
```datacards
TABLE file.link as "Title", author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```
```

![Book Library Example](../assets/screenshots/example-books.png)

## Properties to Include in Your Book Notes

For this example to work, make sure your book notes have:

```yaml
---
tags: books
author: Author Name
rating: 4.5
genre: Fiction
cover: https://example.com/book-cover.jpg
---
```

## Advanced Book Library

More detailed version with additional properties:

```markdown
```datacards
TABLE 
  file.link as "Title", 
  author, 
  rating, 
  genre, 
  "![]("+cover+")" as Cover,
  status,
  dateRead 
FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
defaultDateFormat: YYYY-MM-DD
properties: [file.link, author, rating, genre, status, dateRead]
```
```

## Filter by Genre

Display only books from a specific genre:

```markdown
```datacards
TABLE file.link as "Title", author, rating, genre, cover FROM #books
WHERE contains(genre, "Fantasy")
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```
```

## Currently Reading Shelf

Display books you're currently reading:

```markdown
```datacards
TABLE file.link as "Title", author, rating, genre, cover, progress FROM #books
WHERE status = "Reading"
SORT file.ctime DESC

// Settings
preset: portrait
imageProperty: cover
columns: 2
```
```

## Tag-Based Organization

If you use sub-tags for organizing books:

```markdown
```datacards
TABLE file.link as "Title", author, rating, cover FROM #books/fiction
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```
```

## Compact Book List

A more compact display for many books:

```markdown
```datacards
TABLE file.link as "Title", author, genre, rating, cover FROM #books
SORT file.ctime DESC

// Settings
preset: compact
imageProperty: cover
```
```

## Integration with DataviewJS (Advanced)

Combine statistics with your book display:

```javascript
```dataviewjs
// Get all books
const books = dv.pages("#books")
    .sort(b => b.rating, 'desc');

// Display some stats
const totalBooks = books.length;
const avgRating = books.map(b => b.rating).reduce((sum, val) => sum + val, 0) / totalBooks;
const genres = {};

books.forEach(book => {
    if (book.genre) {
        const genreName = Array.isArray(book.genre) ? book.genre[0] : book.genre;
        genres[genreName] = (genres[genreName] || 0) + 1;
    }
});

// Output stats
dv.paragraph(`📚 **Total Books**: ${totalBooks}`);
dv.paragraph(`⭐ **Average Rating**: ${avgRating.toFixed(1)}`);
dv.paragraph(`🏆 **Top Genres**:`);
Object.entries(genres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([genre, count]) => {
        dv.paragraph(`- ${genre}: ${count} books`);
    });

// Generate a DataCards block for the top-rated books
dv.paragraph("### Top-Rated Books\n");
dv.paragraph(`\`\`\`datacards
TABLE file.link as "Title", author, rating, genre, cover FROM #books
SORT rating DESC
LIMIT 6

// Settings
preset: portrait
columns: 3
imageProperty: cover
properties: [file.link, author, rating, genre]
\`\`\``);
```
```
