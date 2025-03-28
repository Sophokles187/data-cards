---
layout: default
title: Mobile Support
parent: Features
nav_order: 4
---

# Mobile Support
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

DataCards provides specific settings to optimize the display on mobile devices. When viewed on a mobile device, DataCards automatically applies mobile-specific settings.

## Default Mobile Behavior

By default, when viewed on mobile:

- Cards switch to a single column
- Properties become scrollable to save vertical space
- Image heights are reduced

## Mobile-Specific Settings

You can customize the mobile experience with these settings:

### Mobile Columns

Set the number of columns to use on mobile devices:

```markdown
```datacards
TABLE title, author, rating FROM #books

// Settings
mobileColumns: 2
```
```

The default is 1, and you can set it between 1-3.

### Mobile Preset

Use a different preset specifically for mobile viewing:

```markdown
```datacards
TABLE title, author, rating, cover FROM #books

// Settings
preset: portrait
mobilePreset: grid
```
```

This allows you to have different layouts on desktop and mobile.

### Mobile Image Height

Adjust image height for better mobile display:

```markdown
```datacards
TABLE title, author, rating, cover FROM #books

// Settings
imageHeight: 300px
mobileImageHeight: 150px
```
```

### Mobile Scrollable Properties

Control whether properties are scrollable on mobile:

```markdown
```datacards
TABLE title, author, rating FROM #books

// Settings
mobileScrollableProperties: true
mobileContentHeight: 150px
```
```

## Testing Mobile View

You can force mobile mode for testing purposes using the plugin settings:

1. Open Obsidian Settings
2. Go to DataCards plugin settings
3. Enable "Force Mobile Mode"

This allows you to test mobile layouts on desktop.

## Responsive Design

DataCards is designed to be responsive and will automatically adjust to different screen sizes. The mobile settings give you additional control over this behavior.

## Example: Mobile-Optimized Configuration

Here's an example of a configuration optimized for both desktop and mobile:

```markdown
```datacards
TABLE title, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
columns: 3
imageHeight: 350px
scrollableProperties: false

// Mobile settings
mobilePreset: grid
mobileColumns: 1
mobileImageHeight: 120px
mobileScrollableProperties: true
mobileContentHeight: 150px
```
```

This configuration will display a portrait layout with 3 columns on desktop, and a more compact grid layout with 1 column on mobile.
