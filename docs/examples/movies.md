# Movie Collection Example

This example shows how to create a movie collection display with DataCards.

## Basic Movie Collection

A simple card display for your movie collection:

```dataview
TABLE file.link as "Title", director, year, rating, poster as "Poster" FROM #movies
SORT rating DESC

// Settings
preset: movie
imageProperty: poster
```

![Movie Collection Example](../assets/images/screenshot-7.png)

## Properties to Include in Your Movie Notes

For this example to work, make sure your movie notes have:

```yaml
---
tags: movies
director: Director Name
year: 2022
rating: 4.5
genre: [Action, Sci-Fi]
poster: https://example.com/movie-poster.jpg
watched: 2022-03-15
---
```

## Full Movie Database

More detailed version with additional properties:

```dataview
TABLE
  file.link as "Title",
  director,
  year,
  rating,
  genre,
  watched,
  runtime,
  poster
FROM #movies
SORT rating DESC

// Settings
preset: movie
imageProperty: poster
defaultDateFormat: YYYY-MM-DD
properties: [file.link, director, year, rating, genre, watched, runtime]
```

## Filter by Genre

Display only movies from a specific genre:

```dataview
TABLE file.link as "Title", director, year, rating, poster FROM #movies
WHERE contains(genre, "Sci-Fi")
SORT rating DESC

// Settings
preset: movie
imageProperty: poster
```

## Recently Watched Movies

Display your recently watched movies:

```dataview
TABLE file.link as "Title", director, year, rating, poster, watched FROM #movies
WHERE watched
SORT watched DESC
LIMIT 10

// Settings
preset: movie
imageProperty: poster
```

## Compact Movie List

A more compact display for many movies:

```dataview
TABLE
  file.link as "Title",
  director,
  year,
  rating,
  genre,
  watched,
  poster
FROM #movies
SORT year DESC

// Settings
preset: compact
imageProperty: poster
showImageOnHover: true
```

## Movie Statistics Dashboard

Combine statistics with your movie display:

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
        const genreName = Array.isArray(movie.genre) ? movie.genre[0] : movie.genre;
        genres[genreName] = (genres[genreName] || 0) + 1;
    }
});

// Output stats
dv.paragraph(`🎬 **Total Movies**: ${totalMovies}`);
dv.paragraph(`⭐ **Average Rating**: ${avgRating.toFixed(1)}`);
dv.paragraph(`🏆 **Top Genres**:`);
Object.entries(genres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([genre, count]) => {
        dv.paragraph(`- ${genre}: ${count} movies`);
    });

// Generate a DataCards block for the top-rated movies
dv.paragraph("### Top-Rated Movies\n");
dv.paragraph(`\`\`\`datacards
TABLE file.link as "Title", director, rating, genre, poster FROM #movies
SORT rating DESC
LIMIT 6

// Settings
preset: portrait
columns: 3
imageProperty: poster
properties: [file.link, director, rating, genre]
\`\`\``);
```
```

## Directors Showcase

Group movies by director:

```dataview
TABLE file.link as "Title", year, rating, poster FROM #movies AND [[Christopher Nolan]]
SORT year DESC

// Settings
preset: movie
imageProperty: poster
```

## Integration with DataviewJS (Advanced)

Combine statistics with your movie display:

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
        const genreName = Array.isArray(movie.genre) ? movie.genre[0] : movie.genre;
        genres[genreName] = (genres[genreName] || 0) + 1;
    }
});

// Output stats
dv.paragraph(`🎬 **Total Movies**: ${totalMovies}`);
dv.paragraph(`⭐ **Average Rating**: ${avgRating.toFixed(1)}`);
dv.paragraph(`🏆 **Top Genres**:`);
Object.entries(genres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([genre, count]) => {
        dv.paragraph(`- ${genre}: ${count} movies`);
    });

// Generate a DataCards block for the top-rated movies
dv.paragraph("### Top-Rated Movies\n");
dv.paragraph(`\`\`\`datacards
TABLE file.link as "Title", director, rating, genre, poster FROM #movies
SORT rating DESC
LIMIT 6

// Settings
preset: portrait
columns: 3
imageProperty: poster
properties: [file.link, director, rating, genre]
\`\`\``);
```