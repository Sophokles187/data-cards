---
layout: page
title: Card Presets
---

DataCards offers several presets to display your data in different layouts. Each preset is optimized for specific use cases and has its own default settings.

## Available Presets

### Grid Preset

The default preset with a balanced layout for most use cases.

```
preset: grid
```

**Characteristics:**
- Default columns: 3
- Image fit: cover
- Standard card sizing
- Ideal for general collections

![Grid Preset Example](../assets/screenshots/preset-grid.png)

### Portrait Preset

Optimized for book covers and portrait images.

```
preset: portrait
```

**Characteristics:**
- Default columns: 3
- Image fit: contain (shows full image without cropping)
- Taller image area
- Ideal for books, movies, and other media with cover art

![Portrait Preset Example](../assets/screenshots/preset-portrait.png)

### Square Preset

Perfect for photo collections with a focus on images.

```
preset: square
```

**Characteristics:**
- Default columns: 4
- Image fit: cover
- 1:1 aspect ratio cards
- Shows title at the bottom and reveals all properties on hover
- Ideal for photo collections and visual-first content

![Square Preset Example](../assets/screenshots/preset-square.png)

### Compact Preset

Side-by-side image and content layout.

```
preset: compact
```

**Characteristics:**
- Default columns: 4
- Image fit: cover
- Image on the left, scrollable content on the right
- Ideal when you need to see image and details at a glance

![Compact Preset Example](../assets/screenshots/preset-compact.png)

### Dense Preset

Maximum information density with minimal spacing.

```
preset: dense
```

**Characteristics:**
- Default columns: 6
- Image fit: cover
- Smaller text and reduced spacing
- Ideal for dashboards and when you need to see many items at once

![Dense Preset Example](../assets/screenshots/preset-dense.png)

## Setting a Preset

You can set a preset in your code block:

{% include code.html title="Setting a Preset" code="```datacards
TABLE title, author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
```" %}

## Overriding Columns

Each preset has a default number of columns, but you can override this:

{% include code.html title="Overriding Columns" code="```datacards
TABLE title, author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: dense
columns: 4  // Override the default 6 columns for dense preset
```" %}

## Mixing Preset Features

You can mix features from different presets using other settings. For example, use the portrait preset with small text:

{% include code.html title="Mixing Features" code="```datacards
TABLE title, author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
fontSize: small
```" %}

{% include note.html content="The preset setting must be specified first, as it sets the base defaults for all other display options." %}
