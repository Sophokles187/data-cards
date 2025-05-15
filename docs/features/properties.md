# Property Customization

This page explains how to customize the properties displayed on your DataCards.

## Controlling Which Properties Appear

By default, DataCards displays all properties included in your Dataview query. However, you can control which properties appear and in what order using the `properties` setting.

### Including Specific Properties

To display only specific properties:

```
properties: [file.link, author, rating, genre]
```

This will display only the file link (as a clickable title), author, rating, and genre, in that order.

### Excluding Properties

To display all properties except certain ones:

```
exclude: [cover, file.size, file.ctime]
```

This will display all properties from your query except the cover image, file size, and creation time.

## Property Display Options

### Property Labels

You can customize how property labels appear by using Dataview's "as" syntax in your query:

```
TABLE file.link as "Title", rating as "My Rating" FROM #books
```

This will display "Title" instead of "File Link" and "My Rating" instead of "Rating".

### Value Formatting

#### Date Formatting

Format date properties with:

```
defaultDateFormat: "YYYY-MM-DD"
```

Or specify formats for specific properties:

```
dateFormat: {
  "dateRead": "MMM D, YYYY",
  "published": "YYYY"
}
```

#### Number Formatting

Format number properties with:

```
numberFormat: {
  "rating": "0.0",
  "price": "$0.00"
}
```

## Advanced Property Configuration

### Conditional Formatting

Apply conditional formatting based on property values:

```
conditionalFormatting: {
  "rating": [
    { "condition": ">= 4.5", "color": "#4CAF50" },
    { "condition": ">= 3", "color": "#FFC107" },
    { "condition": "< 3", "color": "#F44336" }
  ]
}
```

### Property Grouping

Group related properties together:

```
propertyGroups: {
  "Publication": ["author", "publisher", "published"],
  "My Notes": ["rating", "dateRead", "notes"]
}
```

## Examples

### Basic Property Selection

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
properties: [file.link, author, rating, genre]
```

### Custom Property Labels

```datacards
TABLE file.link as "Title", author as "Written By", rating as "My Score", genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```

### Formatted Properties

```datacards
TABLE file.link, author, rating, dateRead, cover FROM #books
SORT dateRead DESC

// Settings
preset: portrait
imageProperty: cover
dateFormat: {
  "dateRead": "MMMM D, YYYY"
}
numberFormat: {
  "rating": "0.0 ⭐"
}