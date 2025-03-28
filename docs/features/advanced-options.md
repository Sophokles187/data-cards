# Advanced Options

DataCards offers a range of advanced options for customizing your card displays beyond the basic settings.

## Performance Optimization

### Lazy Loading

Enable lazy loading to improve performance with many images:

```
lazyLoad: true
```

This will only load images as they come into view, reducing initial load time.

### Pagination

Break large collections into pages:

```
pagination: true
cardsPerPage: 12
```

### Virtual Scrolling

For very large collections, enable virtual scrolling:

```
virtualScroll: true
```

This renders only the visible cards, greatly improving performance.

## Visual Customization

### Custom CSS Classes

Add custom CSS classes to your cards:

```
cssClasses: ["my-custom-cards", "dark-theme"]
```

### Custom Styles

Apply inline styles directly:

```
styles: {
  "card": "border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);",
  "image": "filter: grayscale(100%);",
  "title": "font-family: 'Georgia', serif; color: #333;"
}
```

### Animation Effects

Add animations to your cards:

```
animations: {
  "type": "fade",
  "duration": 300,
  "stagger": 50
}
```

Available animation types: `fade`, `slide`, `zoom`, `flip`

## Interaction Options

### Click Actions

Define what happens when a card is clicked:

```
clickAction: "open"  // Open the note
```

```
clickAction: "expand"  // Expand the card to show more details
```

```
clickAction: "modal"  // Open a modal with the full note content
```

### Hover Effects

Add effects when hovering over cards:

```
hoverEffect: "lift"
```

Available effects: `lift`, `glow`, `zoom`, `none`

### Sorting Controls

Allow users to sort cards:

```
sortControls: true
sortOptions: ["title", "rating", "date"]
```

### Filter Controls

Add interactive filters:

```
filterControls: true
filterOptions: {
  "genre": ["Fiction", "Non-Fiction", "Science Fiction", "Biography"],
  "rating": ["5 Stars", "4+ Stars", "3+ Stars"]
}
```

## Data Manipulation

### Calculated Properties

Create new properties based on existing ones:

```
calculatedProperties: {
  "displayName": "file.name + ' (' + year + ')'",
  "isRecent": "file.mtime > (date.now() - (7 * 24 * 60 * 60 * 1000))"
}
```

### Data Transformation

Transform property values before display:

```
transformations: {
  "rating": "value + '⭐'",
  "tags": "value.join(', ')",
  "date": "moment(value).format('MMM D, YYYY')"
}
```

### Default Values

Set default values for missing properties:

```
defaultValues: {
  "rating": "Not rated",
  "status": "Unspecified",
  "cover": "assets/default-cover.jpg"
}
```

## Integration Options

### Dataview Integration

Pass options directly to Dataview:

```
dataviewOptions: {
  "cache": false,
  "refreshInterval": 5000
}
```

### External API Integration

Connect to external APIs (requires DataviewJS):

```javascript
```dataviewjs
// Fetch data from an API
const response = await fetch('https://api.example.com/books');
const books = await response.json();

// Convert to Dataview format
const dv = this.dataview;
const pages = books.map(book => {
  return {
    "file": { "link": book.title },
    "author": book.author,
    "rating": book.rating,
    "cover": book.coverUrl
  };
});

// Generate DataCards block
dv.paragraph(`\`\`\`datacards
TABLE file.link as "Title", author, rating, cover FROM ${JSON.stringify(pages)}
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
\`\`\``);
```
```

## Examples

### Advanced Visual Customization

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
cssClasses: ["premium-cards"]
styles: {
  "card": "border-radius: 16px; overflow: hidden;",
  "image": "filter: brightness(1.1);",
  "title": "font-weight: 700; font-size: 1.2em;"
}
hoverEffect: "lift"
```

### Interactive Dashboard

```datacards
TABLE file.link, status, priority, dueDate, assignee FROM #tasks
SORT dueDate ASC

// Settings
preset: grid
sortControls: true
filterControls: true
filterOptions: {
  "status": ["Not Started", "In Progress", "Completed"],
  "priority": ["High", "Medium", "Low"]
}
conditionalFormatting: {
  "priority": [
    { "condition": "= 'High'", "color": "#F44336" },
    { "condition": "= 'Medium'", "color": "#FFC107" },
    { "condition": "= 'Low'", "color": "#4CAF50" }
  ]
}
```

### High-Performance Gallery

```datacards
TABLE file.link, location, date, image FROM #photos
SORT date DESC

// Settings
preset: square
imageProperty: image
columns: 5
lazyLoad: true
pagination: true
cardsPerPage: 20