# Dynamic Columns

Dynamic columns allow DataCards to automatically adjust the number of columns based on the available container width, providing a truly responsive layout that adapts to different screen sizes and note widths.

## Overview

Instead of using a fixed number of columns (like 3 or 4), dynamic columns use CSS Grid's `auto-fit` functionality to automatically fit as many cards as possible within the available space, while maintaining a minimum card width.

## How It Works

When dynamic columns are enabled:

1. **Responsive Layout**: The number of columns automatically adjusts based on the container width
2. **Minimum Width**: Cards maintain a minimum width that you can customize
3. **Automatic Wrapping**: Cards automatically wrap to new rows when there isn't enough space
4. **Fluid Resizing**: As you resize the note pane or window, cards automatically reflow

## Enabling Dynamic Columns

### Global Setting

You can enable dynamic columns globally in the plugin settings:

1. Open Obsidian Settings
2. Navigate to "DataCards" in the Community Plugins section
3. Enable "Dynamic columns"
4. Set your preferred "Minimum card width" (default: 250px)

### Per-Block Setting

You can also enable dynamic columns for specific code blocks:

```datacards
TABLE file.link, author, rating, cover FROM #books
SORT rating DESC

// Settings
dynamicColumns: true
minCardWidth: 280px
```

## Settings

### `dynamicColumns`

- **Type**: Boolean
- **Default**: `false`
- **Description**: Enable dynamic column layout based on container width

### `minCardWidth`

- **Type**: String (CSS value)
- **Default**: `250px`
- **Description**: Minimum width for cards when using dynamic columns

## Examples

### Basic Dynamic Layout

```datacards
TABLE file.link, title, author, rating FROM #books
SORT rating DESC

// Settings
preset: grid
dynamicColumns: true
```

### Custom Minimum Width

```datacards
TABLE file.link, title, cover FROM #movies
SORT rating DESC

// Settings
preset: portrait
dynamicColumns: true
minCardWidth: 320px
```

### Different Presets with Dynamic Columns

Dynamic columns work with all presets:

```datacards
TABLE file.link, title, summary FROM #articles

// Settings
preset: compact
dynamicColumns: true
minCardWidth: 300px
```

## Settings Hierarchy

The plugin follows a clear hierarchy when determining column layout:

1. **Per-block `columns: X`** (highest priority) - Forces fixed columns, ignores any dynamic columns settings
2. **Per-block `dynamicColumns: true/false`** - Overrides global dynamic columns setting
3. **Global `dynamicColumns: true/false`** - Default behavior when no per-block override
4. **Mobile settings** (always override) - Always use `mobileColumns` setting on mobile devices

### Examples of Settings Hierarchy

```datacards
// This will use exactly 4 columns, even if global Dynamic Columns is enabled
TABLE file.link, author, rating FROM #books
// Settings
columns: 4
```

```datacards
// This will disable dynamic columns for this block only
TABLE file.link, author, rating FROM #books
// Settings
dynamicColumns: false
columns: 3
```

```datacards
// This will enable dynamic columns for this block, even if globally disabled
TABLE file.link, author, rating FROM #books
// Settings
dynamicColumns: true
minCardWidth: 300px
```

## Behavior Notes

### Mobile Devices

Dynamic columns are automatically disabled on mobile devices to ensure optimal performance and readability. On mobile, the plugin will use the `mobileColumns` setting instead.

### Preset Compatibility

Dynamic columns work with all presets:

- **Grid**: Maintains balanced proportions with dynamic sizing
- **Portrait**: Adjusts for taller cards with book cover layouts
- **Square**: Creates responsive grids of square cards
- **Compact**: Adapts side-by-side layouts responsively
- **Dense**: Maximizes information density while staying responsive

### Performance

Dynamic columns use modern CSS Grid features that are well-optimized by browsers. The layout calculations are handled entirely by CSS, ensuring smooth performance even with large numbers of cards.

## Comparison: Fixed vs Dynamic Columns

### Fixed Columns (Traditional)
- Set number of columns (e.g., 3 columns)
- Cards may become very wide or very narrow
- Requires manual adjustment for different screen sizes
- Predictable layout

### Dynamic Columns (New)
- Automatically adjusts number of columns
- Cards maintain consistent, readable width
- Adapts to any screen size automatically
- More flexible and responsive

## Tips

1. **Choose appropriate minimum width**: Consider your content and screen sizes when setting `minCardWidth`
2. **Test different values**: Try values between 200px and 400px to find what works best for your content
3. **Consider your use case**: Dynamic columns work best when you want maximum flexibility and don't need a specific number of columns
4. **Combine with presets**: Each preset has different characteristics that work well with dynamic columns

## Browser Support

Dynamic columns use CSS Grid with `auto-fit` and `minmax()`, which are supported in all modern browsers. This includes:

- Chrome 57+
- Firefox 52+
- Safari 10.1+
- Edge 16+

These are the same browsers that support Obsidian, so compatibility is not a concern.
