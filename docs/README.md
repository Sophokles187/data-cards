# DataCards for Obsidian

Transform Dataview query results into visually appealing, customizable card layouts.

## Overview

DataCards is a plugin for [Obsidian](https://obsidian.md) that transforms [Dataview](https://github.com/blacksmithgu/obsidian-dataview) query results into beautiful card layouts. Whether you're organizing books, movies, projects, or any other collection of notes, DataCards helps you visualize your data in an elegant and customizable way.

## Quick Start

1. Install the plugin
2. Create a code block with the `datacards` language
3. Write a Dataview query
4. Add your preferred settings

```datacards
TABLE author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```

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