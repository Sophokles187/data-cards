# Installation

This page provides detailed instructions for installing the DataCards plugin for Obsidian.

## Requirements

Before installing DataCards, make sure you have:

- [Obsidian](https://obsidian.md/) v0.15.0 or newer
- [Dataview Plugin](https://github.com/blacksmithgu/obsidian-dataview) installed and enabled

## Installation Methods

### Method 1: Community Plugins (Recommended)
> **Note**: DataCards is not yet available in the Community Plugins store. Please use BRAT or manual installation until then.

1. Open Obsidian Settings
2. Go to Community Plugins
3. Click "Browse" and search for "Data Cards"
4. Click "Install", then "Enable"

### Method 2: BRAT Plugin 

The BRAT (Beta Reviewers Auto-update Tool) plugin allows you to install plugins that aren't yet in the Community Plugins directory.

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) through Community Plugins
2. Open BRAT settings in Obsidian
3. Click "Add Beta Plugin"
4. Enter the DataCards repository URL: `https://github.com/Sophokles187/data-cards`
5. Click "Add Plugin"
6. Enable DataCards in Community Plugins settings

### Method 3: Manual Installation 

If you prefer to install the plugin manually:

1. Download the latest release from the [releases page](https://github.com/Sophokles187/data-cards/releases)
2. Download these files:
   - `main.js`
   - `manifest.json`
   - `style.css`
3. Navigate to your Obsidian vault's `.obsidian/plugins/` directory
4. Create a new folder named `data-cards`
5. Copy the downloaded files into the `data-cards` folder
6. Enable the plugin in Obsidian's Community Plugins settings

## Verification

To verify that DataCards is installed correctly:

1. Open Obsidian Settings
2. Go to Community Plugins
3. Make sure DataCards is listed and enabled
4. Create a test note with a `datacards` code block
5. Preview the note to confirm cards are rendering properly

## Troubleshooting

If you encounter issues during installation:

- Make sure Dataview plugin is installed and enabled
- Check that you're using a compatible version of Obsidian
- Try restarting Obsidian after installation
- Verify that all required files are in the correct location

For more help, see the [FAQ & Troubleshooting](faq.md) page.