---
layout: default
title: Home
---

# DataCards for Obsidian

Transform Dataview query results into visually appealing, customizable card layouts.

<a href="{{ '/getting-started' | relative_url }}" class="button">Get Started</a>

## Overview

DataCards is a plugin for [Obsidian](https://obsidian.md) that transforms [Dataview](https://github.com/blacksmithgu/obsidian-dataview) query results into beautiful card layouts. Whether you're organizing books, movies, projects, or any other collection of notes, DataCards helps you visualize your data in an elegant and customizable way.

{% include card.html title="Quick Start" content="
1. Install the plugin
2. Create a code block with the `datacards` language
3. Write a Dataview query
4. Add your preferred settings
" %}

{% include code.html title="Example Query" code="```datacards
TABLE author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```" %}

## Features

DataCards offers a range of features to help you visualize your data:

<div class="table-wrapper">
<table>
    <thead>
        <tr>
            <th>Feature</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Flexible Presets</td>
            <td>Multiple card layouts optimized for different content types</td>
        </tr>
        <tr>
            <td>Image Support</td>
            <td>Display images from frontmatter properties</td>
        </tr>
        <tr>
            <td>Property Customization</td>
            <td>Control which properties appear and how they're displayed</td>
        </tr>
        <tr>
            <td>Mobile Optimization</td>
            <td>Responsive design with mobile-specific settings</td>
        </tr>
    </tbody>
</table>
</div>

{% include note.html content="**Note:** DataCards requires the Dataview plugin to be installed and enabled." %}

## Presets

Choose from multiple presets to display your data:

### Grid Preset <span class="badge">Default</span>

Balanced layout for most use cases with 3 columns by default.

### Portrait Preset

Optimized for book covers and portrait images. Features taller cards with "contain" fit to show full images without cropping.

### Square Preset

Perfect for photo collections and visual content. Features 1:1 square cards with images as the focus.
