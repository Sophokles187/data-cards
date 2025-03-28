---
layout: default
title: Property Customization
parent: Features
nav_order: 3
---

# Property Customization
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

DataCards allows you to customize which properties are displayed and how they appear on your cards.

## Property Selection

### Including Properties

You must explicitly include all properties you want to display in your Dataview query:

```markdown
```datacards
TABLE title, author, rating, genre, cover FROM #books
```
```

### Filtering Properties

You can filter which properties appear using the `properties` setting:

```markdown
```datacards
TABLE title, author, rating, genre, cover FROM #books

// Settings
properties: [title, author, rating]
```
```

This will only show title, author, and rating on the cards, even though genre is in the query.

### Excluding Specific Properties

You can also exclude specific properties:

```markdown
```datacards
TABLE title, author, rating, genre, cover FROM #books

// Settings
exclude: [genre]
```
```

### Showing All Properties

To show all properties from your query:

```markdown
```datacards
TABLE title, author, rating, genre, cover FROM #books

// Settings
properties: all
```
```

## Property Display

### Labels

Control whether property labels (names) are displayed:

```markdown
```datacards
TABLE title, author, rating FROM #books

// Settings
showLabels: false
```
```

### Text Alignment

Set the alignment for properties and their labels:

```markdown
```datacards
TABLE title, author, rating FROM #books

// Settings
propertiesAlign: center
```
```

Options: `left`, `center`, `right`

### Title Alignment

Set the alignment for just the title (file property):

```markdown
```datacards
TABLE file.link as "Title", author, rating FROM #books

// Settings
titleAlign: center
```
```

Options: `left`, `center`, `right`

## Scrollable Properties

For cards with many properties, you can enable scrolling:

```markdown
```datacards
TABLE title, author, rating, genre, published, summary, notes FROM #books

// Settings
scrollableProperties: true
contentHeight: 250px
```
```

The `contentHeight` setting determines the height of the scrollable area.

## Font Size

Adjust the text size for all card elements:

```markdown
```datacards
TABLE title, author, rating FROM #books

// Settings
fontSize: small
```
```

Available options:
- `larger` (120% of default)
- `large` (110% of default)
- `default`
- `small` (90% of default)
- `smaller` (80% of default)

## Date Formatting

DataCards automatically detects and formats date properties:

```markdown
```datacards
TABLE title, author, published FROM #books

// Settings
defaultDateFormat: DD.MM.YYYY
```
```

## Boolean Values

Control how boolean properties are displayed:

```markdown
```datacards
TABLE task, completed FROM #tasks

// Settings
booleanDisplayMode: checkbox
```
```

Options:
- `both` (checkbox and text)
- `checkbox` (checkbox only)
- `text` (text only)

You can also customize the text shown for true/false values:

```markdown
booleanTrueText: "Yes"
booleanFalseText: "No"
```
