---
layout: default
title: Image Support
parent: Features
nav_order: 2
---

# Image Support
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

DataCards can display images from your notes' frontmatter. This guide explains how to use images with DataCards.

## Specifying Image Properties

To display images, you need to:

1. Have an image property in your notes' frontmatter
2. Include that property in your Dataview query
3. Specify the image property in your DataCards settings

### Example

```markdown
```datacards
TABLE title, author, rating, cover FROM #books
SORT rating DESC

// Settings
imageProperty: cover
```
```

## Supported Image Formats

DataCards supports several ways to specify images:

### 1. External URLs

Use a full URL in your frontmatter:

```yaml
---
cover: https://example.com/image.jpg
---
```

### 2. Vault Images (Path)

For images in your vault, use a relative path:

```yaml
---
cover: path/to/image.jpg
---
```

### 3. Vault Images (Wiki Link)

Use Obsidian's wiki link format:

```yaml
---
cover: "[[path/to/image.jpg]]"
---
```

## Image Settings

You can customize how images are displayed with these settings:

### Image Property

Specify which frontmatter property contains the image:

```
imageProperty: cover
```

### Image Height

Set a custom height for images (default is preset-specific):

```
imageHeight: 300px
```

### Image Fit

Control how images fit within their container:

- `cover`: Fill the container (may crop)
- `contain`: Show the entire image (may leave space)

```
imageFit: contain
```

## Lazy Loading

For large collections with many images, you can enable lazy loading:

```
enableLazyLoading: true
```

This only loads images when they become visible, improving performance.

## Mobile Image Settings

Set different image heights for mobile devices:

```
mobileImageHeight: 150px
```

## Troubleshooting Images

If images aren't displaying correctly:

- Verify the image path is correct
- Check that you included the image property in your Dataview query
- For external images, ensure the URL is accessible
- Try using a different image format (URL vs. path vs. wiki link)
