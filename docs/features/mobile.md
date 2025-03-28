# Mobile Support

DataCards is fully compatible with Obsidian Mobile and includes specific settings to optimize the display on smaller screens.

## Automatic Mobile Optimization

By default, DataCards automatically adjusts the layout for mobile devices:

- Reduces the number of columns to 1
- Optimizes spacing for smaller screens
- Makes properties scrollable for better readability

## Mobile-Specific Settings

You can customize how your cards appear on mobile devices using mobile-specific settings in either the global plugin settings or per code block.

### Mobile Columns

Control the number of columns on mobile devices:

```
mobileColumns: 2
```

This will display cards in two columns on mobile. The valid range is 1-3 columns.

### Mobile Preset

Use a different preset on mobile devices:

```
mobilePreset: compact
```

This lets you use a completely different card layout on mobile compared to desktop.

### Mobile Content Height

Control the height of scrollable content areas on mobile:

```
mobileContentHeight: 180px
```

This is particularly useful for cards with many properties.

### Mobile Scrollable Properties

Enable or disable scrollable properties on mobile:

```
mobileScrollableProperties: true
```

By default, this is enabled to make mobile viewing more compact.

## Global Mobile Settings

In the plugin settings, you can configure default mobile settings for all your cards:

1. Open Obsidian Settings
2. Go to the DataCards plugin settings
3. Navigate to the "Mobile Settings" section
4. Adjust your preferred mobile options

## Examples

### Basic Mobile Optimization

```datacards
TABLE file.link, author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
mobileColumns: 1
```

### Different Layouts for Mobile and Desktop

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: grid
imageProperty: cover
columns: 3
mobilePreset: compact
mobileColumns: 2
```

### Custom Content Height on Mobile

```datacards
TABLE file.link, author, summary, notes, rating FROM #books
SORT rating DESC

// Settings
preset: grid
scrollableProperties: true
contentHeight: 250px
mobileContentHeight: 180px
```

## Best Practices for Mobile

1. **Limit Properties**: Display fewer properties on mobile for better readability
2. **Use Single Column**: For content-heavy cards, use `mobileColumns: 1`
3. **Consider Different Presets**: Some presets work better on mobile than others
4. **Test on Devices**: Always test your cards on actual mobile devices

## Force Mobile Mode for Testing

To preview how your cards will look on mobile without using a mobile device:

1. Open Obsidian Settings
2. Go to the DataCards plugin settings
3. Navigate to the "Mobile Settings" section
4. Enable "Force Mobile Mode"

This setting is for testing only and should be disabled for normal use.