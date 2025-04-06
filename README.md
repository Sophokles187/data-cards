

# DataCards for Obsidian

![Header Image](images/header-image.png)

Transform Dataview query results into visually appealing, customizable card layouts.

[![Documentation](https://img.shields.io/badge/Documentation-Visit%20Docs-blue)](https://sophokles187.github.io/data-cards/)

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

## Documentation

Visit the [documentation site](https://sophokles187.github.io/data-cards/) for complete guides, examples, and reference materials:

- [Getting Started](https://sophokles187.github.io/data-cards/getting-started.html)
- [Installation Guide](https://sophokles187.github.io/data-cards/installation.html)
- [Features Overview](https://sophokles187.github.io/data-cards/features/)
- [Example Usage](https://sophokles187.github.io/data-cards/examples/)
- [FAQ & Troubleshooting](https://sophokles187.github.io/data-cards/faq.html)

## Requirements

- [Obsidian](https://obsidian.md/) v0.15.0+
- [Dataview Plugin](https://github.com/blacksmithgu/obsidian-dataview)

## Installation

### Option 1: Community Plugins 
> **Note**: DataCards is not yet available in the Community Plugins store. Please use BRAT or manual installation until then.

1. Open Obsidian Settings
2. Go to Community Plugins
3. Click "Browse" and search for "Data Cards"
4. Click "Install", then "Enable"

### Option 2: BRAT Plugin 
1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) through Community Plugins
2. Open BRAT settings in Obsidian
3. Click "Add Beta Plugin"
4. Enter the DataCards repository URL: `https://github.com/Sophokles187/data-cards`
5. Click "Add Plugin"
6. Enable DataCards in Community Plugins settings

### Option 3: Manual Installation 
1. Download the latest release from the [releases page](https://github.com/Sophokles187/data-cards/releases)
2. Download these files:
   - `main.js`
   - `manifest.json`
   - `style.css`
3. Navigate to your Obsidian vault's `.obsidian/plugins/` directory
4. Create a new folder named `data-cards`
5. Copy the downloaded files into the `data-cards` folder
6. Enable the plugin in Obsidian's Community Plugins settings

> **Note**: After installation, you may need to restart Obsidian for the changes to take effect.

## Example Usage

Create a `datacards` code block with a Dataview query and optional settings:

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

> **Important**: You must explicitly include all properties you want to display in your Dataview query (including the image property).

See the [documentation](https://sophokles187.github.io/data-cards/examples/) for more detailed examples.

## Support Development

If you find DataCards useful and would like to support its development, consider buying me a coffee:

[![Support on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/sophokles)

## License

GNU General Public License v3.0 (GPL-3.0)

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Dataview Plugin](https://github.com/blacksmithgu/obsidian-dataview) (MIT License) - This plugin uses the Dataview API
