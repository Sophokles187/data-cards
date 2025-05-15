# Image Support

DataCards allows you to display images in your cards, making your data more visual and engaging.

## Basic Image Display

To display images in your cards, you need to:

1. Have an image property in your notes (URL, file path, or wiki link)
2. Include that property in your Dataview query
3. Specify which property contains the image using the `imageProperty` setting

```datacards
TABLE file.link, author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```

## Image Property Types

DataCards supports several types of image references:

### URLs

```yaml
---
cover: https://example.com/book-cover.jpg
---
```

### File Paths

```yaml
---
cover: "attachments/book-cover.jpg"
---
```

### Wiki Links

```yaml
---
cover: "[[attachments/book-cover.jpg]]"
---
```

### Markdown Image Links

```yaml
---
cover: "![Book Cover](attachments/book-cover.jpg)"
---
```

## Image Display Options

### Image Fit

Control how images fit within the card:

```
imageFit: cover    // Fill the space (may crop)
```

```
imageFit: contain  // Show the entire image (may leave space)
```

### Image Position

Control how images are positioned within the card:

```
imagePosition: center
```

Options include: `top`, `bottom`, `left`, `right`, `center`

### Image Size

Control the size of the image area:

```
imageSize: large
```

Options include: `small`, `medium`, `large`, `xlarge`

Or specify a custom height:

```
imageHeight: 300px
```

## Note About Arrays in Frontmatter

If you have an array of images in your frontmatter, DataCards will only display the first image in the array as the card's cover image:

```yaml
---
images:
  - "attachments/image1.jpg"  # Only this first image will be displayed
  - "attachments/image2.jpg"  # These additional images won't be displayed
  - "attachments/image3.jpg"  # in the card's image area
---
```

Then use the `imageProperty` setting as usual:

```
imageProperty: images
```

## Lazy Loading

For better performance with many images, enable lazy loading:

```
lazyLoad: true
```

This will only load images as they come into view.

## Examples

### Book Covers

```datacards
TABLE file.link as "Title", author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
imageFit: contain
```

### Photo Gallery

```datacards
TABLE file.link as "Photo", location, date, image FROM #photos
SORT date DESC

// Settings
preset: square
imageProperty: image
imageFit: cover
columns: 4
```

### Product Catalog

```datacards
TABLE file.link as "Product", price, category, cover FROM #products
SORT price ASC

// Settings
preset: grid
imageProperty: cover
imageSize: large