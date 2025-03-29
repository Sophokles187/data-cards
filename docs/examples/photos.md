# Photo Gallery Example

This example shows how to create a photo gallery with DataCards.

## Basic Photo Gallery

A simple gallery display for your photos:


```datacards
TABLE file.link as "Photo", location, date, image FROM #photos
SORT date DESC

// Settings
preset: square
imageProperty: image
columns: 4
```


![Photo Gallery Example](../assets/images/screenshot-8.png)

## Properties to Include in Your Photo Notes

For this example to work, make sure your photo notes have:

```yaml
---
tags: photos
location: "Paris, France"
date: 2023-06-15
image: "attachments/paris-photo.jpg"
---
```

## Advanced Photo Gallery

More detailed version with additional properties:


```datacards
TABLE 
  file.link as "Title", 
  location, 
  date,
  camera,
  "![]("+image+")" as Photo
FROM #photos
SORT date DESC

// Settings
preset: square
imageProperty: image
columns: 4
defaultDateFormat: YYYY-MM-DD
```


## Filter by Location

Display photos from a specific location:


```datacards
TABLE file.link as "Photo", date, image FROM #photos
WHERE contains(location, "Italy")
SORT date DESC

// Settings
preset: square
imageProperty: image
columns: 4
```


## Recent Photos

Display your most recent photos:


```datacards
TABLE file.link as "Photo", location, date, image FROM #photos
SORT date DESC
LIMIT 12

// Settings
preset: square
imageProperty: image
columns: 3
```


## Photo Albums

If you use sub-tags for organizing photos:


```datacards
TABLE file.link as "Photo", location, date, image FROM #photos/vacation
SORT date DESC

// Settings
preset: square
imageProperty: image
columns: 4
```


## Compact Photo List

A more detailed display with photo information:


```datacards
TABLE file.link as "Photo", location, date, camera, settings, image FROM #photos
SORT date DESC

// Settings
preset: compact
imageProperty: image
```

