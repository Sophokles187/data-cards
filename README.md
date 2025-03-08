![](images/header-image.png)
# DataCards for Obsidian

Transform Dataview query results into visually appealing, customizable card layouts.

## Quick Start

1. **Install**: Download `main.js` , `manifest.json` and `style.css` from [releases page](https://github.com/Sophokles187/data-cards/releases)
2. Go to `.obsidian/plugins/` create the folder `data-cards` and copy over the downloaded files
3. (Or install using the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat))
4. **Enable**: Activate the plugin in Obsidian's Community Plugins settings
5. **Use**: Create a code block with the `datacards` language and write a Dataview query:

````markdown
```datacards
TABLE author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```
````

That's it! Your Dataview results will now display as beautiful cards.

## Features

- **Custom Code Block**: Use `datacards` code blocks with Dataview query syntax
- **Flexible Presets**: Multiple card preset options (grid, portrait, square, compact, dense) optimized for different use cases
- **Property Customization**: Select which properties to display and how they appear
- **Font Size Options**: Customize text size independently from presets to mix and match features
- **Image Support**: Display images from frontmatter properties with customizable dimensions
- **Global Settings**: Default configuration with per-block overrides
- **Mobile Optimization**: Dedicated mobile settings for better display on small screens
- **Performance Enhancements**: Lazy loading for images to improve loading times

## Requirements

- [Obsidian](https://obsidian.md/) v0.15.0+
- [Dataview Plugin](https://github.com/blacksmithgu/obsidian-dataview)

## Installation

<details>
<summary><b>Installation Instructions</b> (click to expand)</summary>

### From Obsidian Community Plugins

!!!! not on Obsidian Community Plugins yet !!!!
1. Open Obsidian Settings
1. Go to Community Plugins
2. Click "Browse" and search for "Data Cards"
3. Click "Install", then "Enable"

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/Sophokles187/data-cards/releases)
2. Download these files:  `main.js`, `manifest.json`, `style.css` 
3. Go to Obsidian vault's `.obsidian/plugins/` directory
4. Create a folder `data-cards` and copy over the downloaded files
5. Enable the plugin in Obsidian's Community Plugins settings

### Through BRAT Plugin

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) through community plugins
2. Add the DataCards GitHub-URL to the BRAT Plugin settings
3. Easily check for updates 

</details>

## Usage

### Basic Usage

Create a `datacards` code block with a Dataview query:

````markdown
```datacards
TABLE author, rating, genre FROM #books
SORT rating DESC
```
````

This will automatically render the results as cards using the default settings. The plugin automatically adds the `TABLE` keyword if no query type is specified, but you need to explicitly include the properties you want to display in your query.

### Advanced Usage with Settings

You can customize the appearance by adding settings after your query:

````markdown
```datacards
TABLE author, rating, genre, cover FROM #books
SORT rating DESC
WHERE rating >= 4

// Settings
preset: portrait
columns: 3
imageProperty: cover
properties: [author, rating, genre]
```
````

> **Important**: You must explicitly include all properties you want to display in your Dataview query (including the image property). The properties listed in the `properties` setting must match those requested in your query.

### Image Support

The plugin supports different ways to specify images:

1. **External URLs**: Use a full URL in your frontmatter:
   ```yaml
   cover: https://example.com/image.jpg
   ```

2. **Vault Images**: For images in your vault, you can use:
   ```yaml
   cover: path/to/image.jpg
   ```
   or use Obsidian's wiki link format:
   ```yaml
   cover: "[[path/to/image.jpg]]"
   ```

Remember to include the image property in your Dataview query:
````
TABLE title, author, cover FROM #books
````

### Date Formatting

The plugin automatically detects and formats date properties. By default, dates are displayed in the `YYYY-MM-DD` format, but you can customize this in the global settings or per code block:

````markdown
```datacards
TABLE title, author, published FROM #books
SORT published DESC

// Settings
defaultDateFormat: DD.MM.YYYY
```
````

### Mobile Support

DataCards automatically optimizes the display for mobile devices. By default, all presets switch to a single column on mobile for optimal readability. You can customize the mobile experience in the plugin settings:

- **Mobile Columns**: Override the default single column behavior (1-3)
- **Mobile Preset**: Choose a different preset specifically for mobile viewing
- **Mobile Image Height**: Adjust image height for better mobile display

### Performance Optimization

For large collections with many images, you can enable lazy loading in the plugin settings. This feature:

- Only loads images when they become visible in the viewport
- Reduces initial load time and saves bandwidth
- Shows a placeholder until the image is loaded
- Provides a smooth fade-in animation when images appear

### Dynamic Updates

DataCards can automatically update when properties of displayed notes change. This is particularly useful when using plugins like Meta Bind that allow editing properties directly in the preview mode

- **Global Setting**: Enable or disable dynamic updates for all DataCards in the plugin settings
- **Per-Card Setting**: Individual cards can override the global setting with the `dynamicUpdate` property

```datacards
TABLE title, status, priority FROM #tasks
SORT priority DESC

// Settings
preset: grid
dynamicUpdate: true
```


When enabled, DataCards will automatically refresh when properties change, eliminating the need to manually navigate away and back to see updates. This feature is disabled by default to avoid potential performance impacts with large collections.

> **Note for Meta Bind users**: When editing properties with Meta Bind while dynamic updates are enabled, you may experience the input field losing focus if you pause typing for more than 2.5 seconds. This is due to how the plugins interact and is a known limitation.

### Available Settings

<details>
<summary><b>Complete Settings Reference</b> (click to expand)</summary>

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
| `defaultDateFormat` | Format for displaying dates (e.g., `YYYY-MM-DD`) | `YYYY-MM-DD` |
| `mobilePreset` | Preset to use on mobile devices | `grid` |
| `mobileScrollableProperties` | Whether to make properties scrollable on mobile devices | `true` |
| `mobileContentHeight` | Height of the scrollable content area on mobile devices | `150px` |
| `enableLazyLoading` | Whether to enable lazy loading for images | `false` |
| `enableDynamicUpdates` | Whether to automatically update DataCards when properties change | `false` |
| `dynamicUpdate` | Enable/disable dynamic updates for a specific card (code block only) | Inherits global setting |
</details>

## Examples

### Font Size Options

You can customize the text size of all card elements (properties, labels, and title) independently from the preset:

````markdown
```datacards
TABLE title, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
fontSize: small
imageProperty: cover
```
````

Available font size options:
- `larger` (120% of default size)
- `large` (110% of default size)
- `default` (normal size)
- `small` (90% of default size - similar to dense preset)
- `smaller` (80% of default size)

This allows you to mix features from different presets. For example, you can use the portrait preset with small text, or the grid preset with larger text. The dense preset automatically uses small text by default, but you can override this if desired.


### Preset Options

Each preset is optimized for different use cases and has its own default column count:

<details>
<summary><b>Grid Preset</b> - Balanced default with 3 columns (click to expand)</summary>

Balanced default for most use cases. Features standard cards in a grid layout with 3 columns by default.

````markdown
```datacards
TABLE title, author, rating, genre, cover FROM #books
SORT rating DESC
LIMIT 10

// Settings
preset: grid
imageProperty: cover
properties: [title, author, rating, genre]
```
````
</details>

<details>
<summary><b>Portrait Preset</b> - Optimized for book covers with 3 columns (click to expand)</summary>

Optimized for book covers and portrait images. Features taller cards with "contain" fit to show full images without cropping. Uses 3 columns by default.

````markdown
```datacards
TABLE title, author, rating, genre, cover FROM #books
SORT rating DESC
LIMIT 10

// Settings
preset: portrait
imageProperty: cover
properties: [title, author, rating, genre]
```
````
</details>

<details>
<summary><b>Square Preset</b> - Perfect for photo collections with 4 columns (click to expand)</summary>

Perfect for photo collections and visual content. Features 1:1 square cards with images as the focus. Shows title at the bottom and reveals all properties on hover with an elegant overlay. The title stays fixed at the top of the overlay while other properties can be scrolled. Uses 4 columns by default.

````markdown
```datacards
TABLE title, photographer, location, image FROM #photos
SORT date DESC

// Settings
preset: square
imageProperty: image
properties: [title, photographer, location]
```
````

> **Tip**: The square preset is designed for visual browsing. Hover over any card to see all properties in an overlay. The properties are scrollable by default.
</details>

<details>
<summary><b>Compact Preset</b> - Side-by-side image and content with 4 columns (click to expand)</summary>

Good for items where you want to see image and details side-by-side. Features horizontal cards with image on the left and scrollable content on the right. Uses 4 columns by default.

````markdown
```datacards
TABLE title, director, year, rating, poster FROM #movies
WHERE rating >= 4
SORT year DESC

// Settings
preset: compact
imageProperty: poster
properties: [title, director, year, rating]
```
````
</details>

<details>
<summary><b>Dense Preset</b> - Maximum information density with 6 columns (click to expand)</summary>

Ideal for maximum information density with many items. Features smaller cards with minimal spacing, small font size (automatically uses the 'small' font size setting), and 6 columns by default.

You can override the default column count for any preset by adding the `columns` setting to your code block:

````markdown
```datacards
TABLE task, due, priority, status FROM #project
WHERE !completed
SORT due ASC

// Settings
preset: dense
columns: 4  // Override the default 6 columns for dense preset
properties: [task, due, priority, status]
```
````
</details>

### Advanced Features

<details>
<summary><b>Scrollable Properties</b> - For cards with many properties (click to expand)</summary>

For cards with many properties, you can enable scrollable properties to prevent cards from becoming too tall:

```datacards
TABLE title, author, rating, genre, published, summary, notes FROM #books
SORT rating DESC

// Settings
preset: grid
scrollableProperties: true
contentHeight: 250px
```

Some presets (`square` and `compact`) have scrollable properties by default. You can override this behavior globally in the plugin settings or per code block with the `scrollableProperties` setting.

On mobile devices, properties are scrollable by default to optimize vertical space. You can customize this behavior with the `mobileScrollableProperties` and `mobileContentHeight` settings.
</details>

## DataviewJS and DataCards

DataCards is designed to work with standard Dataview queries, not DataviewJS. However, some experimental integration is possible through DataviewJS's ability to output markdown content. This is not officially supported and may be subject to limitations or unexpected behavior.

<details>
<summary><b>How DataviewJS Integration Works</b> (click to expand)</summary>

The integration works through a specific mechanism:
1. DataviewJS can generate markdown content using `dv.paragraph()`
2. Within this generated markdown, you can include a `datacards` code block
3. When Obsidian processes the page, it first executes the DataviewJS code, which outputs markdown
4. Then Obsidian processes the generated markdown, including any `datacards` blocks

This is an indirect integration - DataCards doesn't process DataviewJS code, but DataviewJS can generate content that DataCards will later process.
</details>

<details>
<summary><b>Simple Example</b> (click to expand)</summary>

Here's a basic working example:

````markdown
```dataviewjs
// Create a simple datacards block
dv.paragraph("```datacards\nTABLE file.link as \"Title\", author, genre, cover FROM #book\nSORT file.ctime DESC\n\n// Settings\npreset: grid\ncolumns: 3\nimageProperty: cover\n```");
```
````

This will:
1. Execute the DataviewJS code
2. Generate a markdown string containing a datacards code block
3. Obsidian will then process that generated datacards block
</details>

<details>
<summary><b>Advanced Example: Book Library with Statistics</b> (click to expand)</summary>

![](images/screenshot-9.png)

For more complex use cases, you can combine statistics with visual displays:

````markdown
```dataviewjs
// Get all books
const books = dv.pages("#book")
    .sort(b => b.publication, 'desc');

// Display some stats
const totalBooks = books.length;
const uniqueAuthors = new Set(books.map(b => b.author)).size;
const genreCounts = {};

books.forEach(book => {
    if (book.genre) {
        const genres = Array.isArray(book.genre) ? book.genre : [book.genre];
        genres.forEach(g => {
            genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
    }
});

// Output stats
dv.paragraph(`📚 **Total Books**: ${totalBooks}`);
dv.paragraph(`👥 **Unique Authors**: ${uniqueAuthors}`);
dv.paragraph(`🏷️ **Top Genres**:`);
const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
topGenres.forEach(([genre, count]) => {
    dv.paragraph(`- ${genre}: ${count} books`);
});

// Generate a DataCards block for the most recent books
dv.paragraph("### Recent Books\n");
dv.paragraph(`\`\`\`datacards
TABLE file.link as "Title", author, publication, genre, cover FROM #book
SORT publication DESC
LIMIT 6

// Settings
preset: portrait
columns: 3
imageProperty: cover
properties: [file.link, author, publication, genre]
\`\`\``);
```
````
</details>

<details>
<summary><b>Considerations When Using DataviewJS</b> (click to expand)</summary>

1. **Experimental Feature**: This integration is experimental and not officially supported.

2. **String Escaping**: When generating datacards blocks in DataviewJS, be careful with string escaping, especially with quotes.

3. **Performance**: Complex DataviewJS code with multiple generated datacards blocks may impact performance.

4. **Troubleshooting**: If your integration doesn't work, try simplifying your approach - start with the basic example and build up gradually.

5. **Updates May Break Integration**: Future updates to either plugin might affect this experimental integration.

While this approach offers interesting possibilities for advanced users, it should be considered experimental and used with appropriate expectations.
</details>

## License

GNU General Public License v3.0 (GPL-3.0)

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Dataview Plugin](https://github.com/blacksmithgu/obsidian-dataview) (MIT License) - This plugin uses the Dataview API
