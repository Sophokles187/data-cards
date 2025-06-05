# DataCards for Obsidian

![Header Image](assets/images/header-image.png)

Transform Dataview query results into visually appealing, customizable card layouts.

> 📚 [**Settings Reference**](settings-reference.md) - Complete list of all available settings

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
| Refresh Button | Manual refresh button for reliable updates in all modes |
| Mobile Optimization | Responsive design with mobile-specific settings |

> **Note:** DataCards requires the Dataview plugin to be installed and enabled.

## Presets

Choose from multiple presets to display your data:

### Grid Preset (Default)

The default layout with a balanced design suitable for various use cases. It arranges cards in a grid with 3 columns by default.

### Portrait Preset

Optimized for displaying book covers and portrait images. It features taller cards and uses "contain" fit to display full images without cropping.

### Square Preset

Ideal for photo collections and other visual content. It displays cards in a 1:1 square format, emphasizing the images, with properties shown as an overlay on mouse hover.

### Compact Preset

This preset offers a side-by-side image and content layout, featuring 4 columns by default, with the image on the left and scrollable content on the right, making it ideal when you need to see both the image and details at a glance.

### Dense Preset

This preset maximizes information density with minimal spacing, featuring 6 columns by default, smaller text, and reduced spacing, making it ideal for dashboards and when you need to see many items at once.

## Support

If you find DataCards useful, you can buy me a coffe to support ongoing development and maintenance.

[![Support on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/sophokles)