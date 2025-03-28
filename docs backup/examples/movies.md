---
layout: default
title: Movie Collection
parent: Examples
nav_order: 4
---

# Movie Collection Example
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

This example shows how to create a movie collection display with DataCards.

## Basic Movie Collection

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

![Movie Collection Example](../assets/screenshots/example-movies.png)

## Properties to Include in Your Movie Notes

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

## Advanced Movie Collection

More detailed version with additional properties:

```markdown
```datacards
TABLE 
  file.link as "Title", 
  director, 
  starring,
  releaseYear, 
  rating, 
  genre, 
  watchDate,
  poster 
FROM #movies
SORT rating DESC

// Settings
preset: compact
imageProperty: poster
properties: [file.link, director, starring, releaseYear, rating, genre, watchDate]
defaultDateFormat: YYYY-MM-DD
```
```

## Filter by Genre

Display only movies from a specific genre:

```markdown
```datacards
TABLE file.link as "Title", director, releaseYear, rating, poster FROM #movies
WHERE contains(genre, "Sci-Fi")
SORT rating DESC

// Settings
preset: portrait
imageProperty: poster
```
```

## Recently Added Movies

Display movies you recently added to your collection:

```markdown
```datacards
TABLE file.link as "Title", director, releaseYear, rating, genre, poster FROM #movies
SORT file.ctime DESC
LIMIT 6

// Settings
preset: portrait
imageProperty: poster
columns: 3
```
```

## Movies by Director

Filter movies by a specific director:

```markdown
```datacards
TABLE file.link as "Title", releaseYear, rating, genre, poster FROM #movies
WHERE director = "Christopher Nolan"
SORT releaseYear DESC

// Settings
preset: portrait
imageProperty: poster
```
```

## Watchlist

Display movies you want to watch:

```markdown
```datacards
TABLE file.link as "Title", director, releaseYear, genre, poster FROM #movies
WHERE status = "To Watch"
SORT priority DESC

// Settings
preset: portrait
imageProperty: poster
```
```

## Movie Ratings Dashboard

Group movies by rating:

```markdown
# Movie Ratings

## ⭐⭐⭐⭐⭐ (9-10)
```datacards
TABLE file.link as "Title", director, releaseYear, poster FROM #movies
WHERE rating >= 9
SORT rating DESC

// Settings
preset: compact
imageProperty: poster
```
```

## ⭐⭐⭐⭐ (7-8.9)
```datacards
TABLE file.link as "Title", director, releaseYear, poster FROM #movies
WHERE rating >= 7 AND rating < 9
SORT rating DESC

// Settings
preset: compact
imageProperty: poster
```
```

## ⭐⭐⭐ (5-6.9)
```datacards
TABLE file.link as "Title", director, releaseYear, poster FROM #movies
WHERE rating >= 5 AND rating < 7
SORT rating DESC

// Settings
preset: compact
imageProperty: poster
```
```
```

## Integration with DataviewJS (Advanced)

Combine statistics with your movie collection:

```javascript
```dataviewjs
// Get all movies
const movies = dv.pages("#movies")
    .sort(m => m.rating, 'desc');

// Display some stats
const totalMovies = movies.length;
const avgRating = movies.map(m => m.rating).reduce((sum, val) => sum + val, 0) / totalMovies;
const genres = {};

movies.forEach(movie => {
    if (movie.genre) {
        const genreList = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
        genreList.forEach(g => {
            genres[g] = (genres[g] || 0) + 1;
        });
    }
});

// Output stats
dv.paragraph(`🎬 **Total Movies**: ${totalMovies}`);
dv.paragraph(`⭐ **Average Rating**: ${avgRating.toFixed(1)}`);

// Top genres
dv.paragraph("### Top Genres");
Object.entries(genres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([genre, count]) => {
        dv.paragraph(`- ${genre}: ${count} movies`);
    });

// Generate DataCards block for top-rated movies
dv.paragraph("### Top-Rated Movies\n");
dv.paragraph(`\`\`\`datacards
TABLE file.link as "Title", director, releaseYear, rating, genre, poster FROM #movies
SORT rating DESC
LIMIT 6

// Settings
preset: portrait
columns: 3
imageProperty: poster
\`\`\``);
```
```
