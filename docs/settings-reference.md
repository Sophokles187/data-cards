# Settings Reference

This page provides a comprehensive reference for all available settings in DataCards.

## Using Settings

Settings can be specified in two ways:

1. **Global Settings**: Set default values for all DataCards blocks in the plugin settings
2. **Per-Block Settings**: Override global settings for specific code blocks

### Global Settings

To access global settings:

1. Open Obsidian Settings
2. Navigate to "DataCards" in the Community Plugins section
3. Adjust settings as needed

### Per-Block Settings

To customize settings for a specific code block, add them after your query:

```
TABLE file.link, author, rating FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```

## Complete Settings Reference

| Setting | Description | Default | Available Options |
|---------|-------------|---------|-------------------|
| **Preset Settings** | | | |
| `preset` | Card layout preset | `grid` | `grid`, `portrait`, `square`, `compact`, `dense` |
| `columns` | Number of columns (code block only) | Preset-specific | Number (typically 1-6) |
| **Image Settings** | | | |
| `imageProperty` | Frontmatter property to use for images | `cover` | Any property name |
| `imageHeight` | Height of images | Preset-specific | CSS value (e.g., `200px`) |
| `imageFit` | How images should fit | Preset-specific | `cover`, `contain` |
| **Content Settings** | | | |
| `properties` | Properties to display | `all` | `all` or array of property names |
| `exclude` | Properties to exclude | `[]` | Array of property names |
| `scrollableProperties` | Enable scrolling for properties | `false` | `true`, `false` |
| `contentHeight` | Height of scrollable content | `200px` | CSS value (e.g., `250px`) |
| **Display Settings** | | | |
| `showLabels` | Show property labels | `true` | `true`, `false` |
| `cardSpacing` | Space between cards (pixels) | `16` | Number |
| `enableShadows` | Add shadows to cards | `true` | `true`, `false` |
| `propertiesAlign` | Text alignment for properties | `left` | `left`, `center`, `right` |
| `titleAlign` | Text alignment for title | `left` | `left`, `center`, `right` |
| `fontSize` | Text size for all elements | `default` | `larger`, `large`, `default`, `small`, `smaller` |
| **Layout Settings** | | | |
| `dynamicColumns` | Auto-adjust columns based on width | `false` | `true`, `false` |
| `minCardWidth` | Minimum card width for dynamic layout | `250px` | CSS value (e.g., `300px`) |
| **Boolean Settings** | | | |
| `booleanDisplayMode` | How to display boolean values | `both` | `both`, `checkbox`, `text` |
| `showBooleanLabels` | Show text labels for booleans | `true` | `true`, `false` |
| `booleanTrueText` | Custom text for true values | `true` | Any text |
| `booleanFalseText` | Custom text for false values | `false` | Any text |
| **Interaction Settings** | | | |
| `enableClickableCards` | Make entire card clickable | `false` | `true`, `false` |
| **Date Formatting** | | | |
| `defaultDateFormat` | Format for displaying dates | `YYYY-MM-DD` | Date format string |
| **Mobile Settings** | | | |
| `mobilePreset` | Preset for mobile devices | Same as desktop | `grid`, `portrait`, `square`, `compact`, `dense` |
| `mobileColumns` | Columns on mobile devices | `1` | `1`, `2`, `3` |
| `mobileScrollableProperties` | Enable scrolling on mobile | `true` | `true`, `false` |
| `mobileContentHeight` | Scrollable content height on mobile | `150px` | CSS value (e.g., `180px`) |
| `forceMobileMode` | Force mobile layout (testing) | `false` | `true`, `false` |
| **Performance Settings** | | | |
| `enableLazyLoading` | Load images only when visible | `false` | `true`, `false` |
| **Update Settings** | | | |
| `enableDynamicUpdates` | Auto-update when properties change | `false` | `true`, `false` |
| `dynamicUpdate` | Enable updates for specific card | Inherits global | `true`, `false` |
| `refreshDelay` | Delay before refreshing (ms) | `2500` | Number (milliseconds) |

## Examples

### Basic Example

```datacards
TABLE file.link, author, rating, genre FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```

### Advanced Example

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: grid
imageProperty: cover
columns: 3
fontSize: small
showLabels: true
propertiesAlign: center
titleAlign: center
enableShadows: true
mobilePreset: compact
mobileColumns: 1
```

### Scrollable Properties Example

```datacards
TABLE file.link, author, summary, notes, ratings, genres, cover FROM #books
SORT rating DESC

// Settings
preset: grid
imageProperty: cover
scrollableProperties: true
contentHeight: 250px
```

### Dynamic Columns Example

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: grid
imageProperty: cover
dynamicColumns: true
minCardWidth: 280px
```