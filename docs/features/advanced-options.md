---
layout: default
title: Advanced Options
parent: Features
nav_order: 6
---

# Advanced Options
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

DataCards offers several advanced options for further customization and optimization.

## Performance Settings

### Lazy Loading

Enable lazy loading to improve performance with many images:

```
enableLazyLoading: true
```

When enabled:
- Images only load when they become visible in the viewport
- Reduces initial load time and saves bandwidth
- Shows a placeholder until the image is loaded
- Provides a smooth fade-in animation when images appear

## Card Appearance

### Card Spacing

Control the space between cards:

```
cardSpacing: 16
```

Value is in pixels, with a range of 0-32.

### Card Shadows

Enable or disable subtle shadows on cards:

```
enableShadows: false
```

### Clickable Cards

Make the entire card clickable to open the note:

```
enableClickableCards: true
```

When enabled, clicking anywhere on the card will open the note, not just the title.

## Creating Custom Card Types (Advanced)

You can create custom card types by combining settings. For example, to create a "magazine" style:

```markdown
```datacards
TABLE title, excerpt, author, cover FROM #articles
SORT date DESC

// Settings
preset: compact
imageHeight: 250px
fontSize: large
propertiesAlign: left
scrollableProperties: true
contentHeight: 300px
```
```

## Using with DataviewJS (Experimental)

While DataCards is designed for standard Dataview queries, not DataviewJS, you can use them together with this approach:

```javascript
```dataviewjs
// Create a datacards block as a string
dv.paragraph("```datacards\nTABLE file.link as \"Title\", author, genre, cover FROM #book\nSORT file.ctime DESC\n\n// Settings\npreset: grid\ncolumns: 3\nimageProperty: cover\n```");
```
```

This uses DataviewJS to generate a DataCards block in the output.

### Advanced DataviewJS Integration Example

For more complex integration, you can combine statistics with visual displays:

```javascript
```dataviewjs
// Get all books
const books = dv.pages("#book")
    .sort(b => b.publication, 'desc');

// Display some stats
const totalBooks = books.length;
const uniqueAuthors = new Set(books.map(b => b.author)).size;

// Output stats
dv.paragraph(`📚 **Total Books**: ${totalBooks}`);
dv.paragraph(`👥 **Unique Authors**: ${uniqueAuthors}`);

// Generate a DataCards block for the most recent books
dv.paragraph("### Recent Books\n");
dv.paragraph(`\`\`\`datacards
TABLE file.link as "Title", author, publication, genre, cover FROM #book
SORT publication DESC
LIMIT 6

// Settings
preset: portrait
columns: 3
imageProperty: cover
properties: [file.link, author, publication, genre]
\`\`\``);
```
```

## Debug Mode

If you encounter issues, you can enable debug mode in the plugin settings to help troubleshoot:

1. Open Obsidian Settings
2. Go to DataCards plugin settings
3. Enable "Debug Mode" under Developer Settings

This will output detailed logging information to the developer console (Help → Developer → Toggle Developer Tools).
