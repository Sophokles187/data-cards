# Mobile Support

DataCards is fully compatible with Obsidian Mobile and includes specific settings to optimize the display on smaller screens.

## Automatic Mobile Optimization

By default, DataCards automatically adjusts the layout for mobile devices:

- Reduces the number of columns
- Increases touch targets
- Optimizes spacing for smaller screens
- Adjusts font sizes for readability

## Mobile-Specific Settings

You can customize how your cards appear on mobile devices using mobile-specific settings.

### Mobile Columns

Control the number of columns on mobile devices:

```
mobileColumns: 1
```

This will display cards in a single column on mobile, regardless of the `columns` setting for desktop.

### Mobile Card Size

Adjust the size of cards on mobile:

```
mobileCardSize: large
```

Options include: `small`, `medium`, `large`, `xlarge`

### Mobile Image Size

Control the size of images on mobile:

```
mobileImageSize: medium
```

Options include: `small`, `medium`, `large`, `xlarge`

### Mobile Font Size

Adjust text size on mobile:

```
mobileFontSize: large
```

Options include: `small`, `medium`, `large`, `xlarge`

## Responsive Breakpoints

DataCards uses responsive breakpoints to determine when to apply mobile settings:

- **Mobile**: Screen width < 768px
- **Tablet**: Screen width 768px - 1024px
- **Desktop**: Screen width > 1024px

You can customize these breakpoints:

```
breakpoints: {
  mobile: 600,
  tablet: 900
}
```

## Examples

### Basic Mobile Optimization

```datacards
TABLE file.link, author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
columns: 3
mobileColumns: 1
```

### Comprehensive Mobile Settings

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
columns: 3
mobileColumns: 1
mobileCardSize: large
mobileImageSize: medium
mobileFontSize: large
```

### Different Layouts for Mobile and Desktop

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: grid
imageProperty: cover
columns: 4
mobileColumns: 1
mobilePreset: list
```

## Best Practices for Mobile

1. **Limit Properties**: Display fewer properties on mobile for better readability
2. **Use Single Column**: For content-heavy cards, use `mobileColumns: 1`
3. **Optimize Images**: Use appropriately sized images to reduce loading time
4. **Test on Devices**: Always test your cards on actual mobile devices

## Troubleshooting

If your cards don't look right on mobile:

- Check that you're using the latest version of DataCards
- Try adjusting the `mobileColumns` setting
- Verify that your images are properly sized for mobile
- Use the `mobileCardSize` and `mobileFontSize` settings to improve readability