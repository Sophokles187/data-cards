---
layout: home
# Index page
---

# DataCards for Obsidian

Transform Dataview query results into visually appealing, customizable card layouts.

## Overview

DataCards is a plugin for [Obsidian](https://obsidian.md) that transforms [Dataview](https://github.com/blacksmithgu/obsidian-dataview) query results into beautiful card layouts. Whether you're organizing books, movies, projects, or any other collection of notes, DataCards helps you visualize your data in an elegant and customizable way.

## Quick Start

1. **Install**: Download the plugin from the releases page or use BRAT
2. **Enable**: Activate the plugin in Obsidian's Community Plugins settings
3. **Use**: Create a code block with the `datacards` language and write a Dataview query:

```markdown
```datacards
TABLE author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```
```

That's it! Your Dataview results will now display as beautiful cards.

## Features

DataCards offers a range of features to help you visualize your data:

| Feature | Description |
|---------|-------------|
| Flexible Presets | Multiple card layouts optimized for different content types |
| Image Support | Display images from frontmatter properties |
| Property Customization | Control which properties appear and how they're displayed |
| Mobile Optimization | Responsive design with mobile-specific settings |

> **Note:** DataCards requires the Dataview plugin to be installed and enabled.

## Presets

Choose from multiple presets to display your data:

### Grid Preset (Default)

Balanced layout for most use cases with 3 columns by default.

### Portrait Preset

Optimized for book covers and portrait images. Features taller cards with "contain" fit to show full images without cropping.

### Square Preset

Perfect for photo collections and visual content. Features 1:1 square cards with images as the focus.

### Compact Preset

Side-by-side image and content layout. Features image on the left with scrollable content on the right.

### Dense Preset 

Maximum information density with minimal spacing. Features 6 columns by default and smaller text.
