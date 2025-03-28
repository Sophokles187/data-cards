# Advanced Options

DataCards offers several settings to customize your card displays beyond the basic options.

## Performance Optimization

### Lazy Loading

Enable lazy loading to improve performance with many images:

```
enableLazyLoading: true
```

This will only load images as they come into view, reducing initial load time.

> **Note**: Lazy loading is available through the global settings panel and can be enabled for all DataCards blocks.

## Content Settings

### Scrollable Properties

For cards with many properties, you can enable scrollable properties to prevent cards from becoming too tall:

```
scrollableProperties: true
contentHeight: 250px
```

This creates a scrollable area for properties, keeping your cards at a consistent height.

### Boolean Display Settings

Control how boolean values are displayed:

```
booleanDisplayMode: "checkbox"  // Options: "both", "checkbox", "text"
showBooleanLabels: false
booleanTrueText: "Yes"
booleanFalseText: "No"
```

## Visual Customization

### Font Size

Adjust text size for all card elements:

```
fontSize: "small"  // Options: "larger", "large", "default", "small", "smaller"
```

### Alignment Options

Customize text alignment:

```
titleAlign: "center"  // Options: "left", "center", "right"
propertiesAlign: "right"  // Options: "left", "center", "right"
```

### Card Spacing

Adjust the space between cards:

```
cardSpacing: 8
```

### Card Shadows

Enable or disable subtle shadows:

```
enableShadows: false
```

## Mobile Optimization

Customize how cards appear on mobile devices:

```
mobilePreset: "compact"
mobileColumns: 2
mobileScrollableProperties: true
mobileContentHeight: "180px"
```

## Interaction Settings

Make cards clickable to open the related note:

```
enableClickableCards: true
```

## Dynamic Updates

Enable automatic updates when properties change:

```
enableDynamicUpdates: true
refreshDelay: 3000
```

For individual code blocks:

```
dynamicUpdate: true
```

## Date Formatting

Customize how dates are displayed:

```
defaultDateFormat: "DD.MM.YYYY"
```

## Available Settings Reference

Here's a complete list of all supported settings:

| Setting | Description | Default |
|---------|-------------|---------|
| `preset` | Card preset (`grid`, `portrait`, `square`, `compact`, `dense`) | `grid` |
| `columns` | Number of columns (code block only, overrides preset default) | Preset-specific |
| `imageProperty` | Frontmatter property to use for images | `cover` |
| `imageHeight` | Height of the image (code block only) | Preset-specific |
| `imageFit` | How the image should fit (`cover`, `contain`) (code block only) | Preset-specific |
| `properties` | Properties to display (array or `all`) | `all` |
| `exclude` | Properties to exclude (array) | `[]` |
| `scrollableProperties` | Whether to make properties scrollable when they exceed content height | `false` (except for `square` and `compact` presets) |
| `contentHeight` | Height of the scrollable content area | `200px` |
| `showLabels` | Whether to show property labels | `true` |
| `cardSpacing` | Space between cards (in pixels) | `16` |
| `enableShadows` | Add subtle shadows to cards | `true` |
| `propertiesAlign` | Text alignment for properties and their labels (`left`, `center`, `right`) | `left` |
| `titleAlign` | Text alignment for the title/filename (`left`, `center`, `right`) | `left` |
| `fontSize` | Text size for all card elements (`larger`, `large`, `default`, `small`, `smaller`) | `default` |
| `booleanDisplayMode` | How to display boolean values (`both`, `checkbox`, `text`) | `both` |
| `showBooleanLabels` | Whether to show text labels for boolean values | `true` |
| `booleanTrueText` | Custom text for true values | `true` |
| `booleanFalseText` | Custom text for false values | `false` |
| `enableClickableCards` | Make the entire card clickable to open the note | `false` |
| `defaultDateFormat` | Format for displaying dates (e.g., `YYYY-MM-DD`) | `YYYY-MM-DD` |
| `mobilePreset` | Preset to use on mobile devices | `grid` |
| `mobileColumns` | Number of columns to use on mobile devices (1-3) | `1` |
| `mobileScrollableProperties` | Whether to make properties scrollable on mobile devices | `true` |
| `mobileContentHeight` | Height of the scrollable content area on mobile devices | `150px` |
| `enableLazyLoading` | Whether to enable lazy loading for images | `false` |
| `enableDynamicUpdates` | Whether to automatically update DataCards when properties change | `false` |
| `dynamicUpdate` | Enable/disable dynamic updates for a specific card (code block only) | Inherits global setting |

## Examples

### Basic Settings Example

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
fontSize: small
enableShadows: true
```

### Mobile Optimization Example

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: grid
mobilePreset: compact
mobileColumns: 2
mobileScrollableProperties: true
```

### Boolean and Date Formatting Example

```datacards
TABLE file.link, status, completed, dueDate FROM #tasks
SORT dueDate ASC

// Settings
preset: grid
booleanDisplayMode: checkbox
defaultDateFormat: DD.MM.YYYY
```

### Scrollable Content Example

```datacards
TABLE file.link, author, summary, notes, rating FROM #books
SORT rating DESC

// Settings
preset: grid
scrollableProperties: true
contentHeight: 250px
titleAlign: center
propertiesAlign: left
```
