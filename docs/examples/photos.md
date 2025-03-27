---
layout: default
title: Photo Gallery
parent: Examples
nav_order: 3
---

# Photo Gallery Example
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

This example shows how to create a photo gallery with DataCards.

## Basic Photo Gallery

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

![Photo Gallery Example](../assets/screenshots/example-photos.png)

## Properties to Include in Your Photo Notes

For this example to work, make sure your photo notes have:

```yaml
---
tags: photos
location: Paris, France
date: 2023-06-15
image: [[photos/paris_eiffel.jpg]]
---
```

## Advanced Photo Gallery

A more detailed photo gallery with additional metadata:

```markdown
```datacards
TABLE 
  file.link as "Title", 
  photographer,
  camera, 
  location, 
  date, 
  tags,
  image 
FROM #photos
SORT date DESC

// Settings
preset: square
imageProperty: image
defaultDateFormat: YYYY-MM-DD
```
```

## Filtered by Location

Show photos from a specific location:

```markdown
```datacards
TABLE file.link as "Title", photographer, date, image FROM #photos
WHERE contains(location, "Paris")
SORT date DESC

// Settings
preset: square
imageProperty: image
defaultDateFormat: YYYY-MM-DD
```
```

## Recent Photos

Display only the most recent photos:

```markdown
```datacards
TABLE file.link as "Title", location, date, image FROM #photos
SORT date DESC
LIMIT 12

// Settings
preset: square
imageProperty: image
defaultDateFormat: YYYY-MM-DD
```
```

## Alternative Layout: Compact

Show photos with more visible metadata using the compact layout:

```markdown
```datacards
TABLE file.link as "Title", photographer, location, date, camera, image FROM #photos
SORT date DESC

// Settings
preset: compact
imageProperty: image
defaultDateFormat: YYYY-MM-DD
```
```

## Photos by Tag

If you use sub-tags for organizing photos:

```markdown
```datacards
TABLE file.link as "Title", location, date, image FROM #photos/landscape
SORT date DESC

// Settings
preset: square
imageProperty: image
defaultDateFormat: YYYY-MM-DD
```
```

## Photos by Year

Group photos by year:

```markdown
# Photo Archive

## 2023
```datacards
TABLE file.link as "Title", location, image FROM #photos
WHERE date.year = 2023
SORT date DESC

// Settings
preset: square
imageProperty: image
```
```

## 2022
```datacards
TABLE file.link as "Title", location, image FROM #photos
WHERE date.year = 2022
SORT date DESC

// Settings
preset: square
imageProperty: image
```
```
```

## Lazy Loading for Large Collections

Enable lazy loading for better performance with many photos:

```markdown
```datacards
TABLE file.link as "Title", location, date, image FROM #photos
SORT date DESC

// Settings
preset: square
imageProperty: image
enableLazyLoading: true
```
```
