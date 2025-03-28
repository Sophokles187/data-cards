---
title: Examples
icon: fas fa-list
order: 3
---

# Examples

This section provides practical examples of DataCards in action. Each example includes a complete code block that you can copy and adapt for your own use.

## Book Library Example

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

### Properties to Include in Your Book Notes

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

## Task Management Example

Create a visual task dashboard:

```markdown
```datacards
TABLE file.link as "Task", priority, status, dueDate, assigned FROM #tasks
WHERE status != "completed"
SORT dueDate ASC

// Settings
preset: grid
columns: 4
properties: [file.link, priority, status, dueDate, assigned]
defaultDateFormat: YYYY-MM-DD
```
```

### Properties to Include in Your Task Notes

For this example to work, make sure your task notes have:

```yaml
---
tags: tasks
priority: High
status: In Progress
dueDate: 2023-09-30
assigned: John Doe
---
```

## Photo Gallery Example

Create a simple photo gallery using the square preset:

```markdown
```datacards
TABLE file.link as "Title", location, date, image FROM #photos
SORT date DESC

// Settings
preset: square
imageProperty: image
```
```

### Properties to Include in Your Photo Notes

For this example to work, make sure your photo notes have:

```yaml
---
tags: photos
location: Paris, France
date: 2023-06-15
image: [[photos/paris_eiffel.jpg]]
---
```

## Movie Collection Example

A simple card display for your movie collection:

```markdown
```datacards
TABLE file.link as "Title", director, releaseYear, rating, genre, poster FROM #movies
SORT rating DESC

// Settings
preset: portrait
imageProperty: poster
```
```

### Properties to Include in Your Movie Notes

For this example to work, make sure your movie notes have:

```yaml
---
tags: movies
director: Christopher Nolan
releaseYear: 2010
rating: 9.2
genre: Sci-Fi
poster: https://example.com/movie-poster.jpg
---
```
