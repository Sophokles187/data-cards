# Movie Collection Example

This example shows how to create a movie collection display with DataCards.

## Basic Movie Collection

A simple card display for your movie collection:

```markdown
```datacards
TABLE file.link as "Title", director, rating, genre, poster FROM #movies
SORT rating DESC

// Settings
preset: portrait
imageProperty: poster
```
```

![Movie Collection Example](../assets/images/screenshot-7.png)

## Properties to Include in Your Movie Notes

For this example to work, make sure your movie notes have:

```yaml
---
tags: movies
director: Director Name
rating: 4.5
genre: Action
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
  year,
  rating, 
  genre, 
  "![]("+poster+")" as Poster,
  watched,
  watchDate 
FROM #movies
SORT rating DESC

// Settings
preset: portrait
imageProperty: poster
defaultDateFormat: YYYY-MM-DD
properties: [file.link, director, year, rating, genre, watched, watchDate]
```
```

## Filter by Genre

Display only movies from a specific genre:

```markdown
```datacards
TABLE file.link as "Title", director, rating, genre, poster FROM #movies
WHERE contains(genre, "Sci-Fi")
SORT rating DESC

// Settings
preset: portrait
imageProperty: poster
```
```

## Recently Watched

Display movies you've watched recently:

```markdown
```datacards
TABLE file.link as "Title", director, rating, genre, poster, watchDate FROM #movies
WHERE watched = true
SORT watchDate DESC
LIMIT 10

// Settings
preset: portrait
imageProperty: poster
columns: 2
```
```

## Watchlist

Display movies you want to watch:

```markdown
```datacards
TABLE file.link as "Title", director, genre, poster FROM #movies
WHERE watched = false
SORT file.ctime DESC

// Settings
preset: portrait
imageProperty: poster
```
```

## Compact Movie List

A more compact display for many movies:

```markdown
```datacards
TABLE file.link as "Title", director, year, genre, rating, poster FROM #movies
SORT year DESC

// Settings
preset: compact
imageProperty: poster
```
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

```markdown
```datacards
TABLE file.link as "Title", year, rating, poster FROM #movies AND [[Christopher Nolan]]
SORT year DESC

// Settings
preset: portrait
imageProperty: poster
```