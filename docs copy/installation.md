---
layout: default
title: Installation
nav_order: 3
---

# Installation
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Requirements

Before installing DataCards, make sure you have:

- [Obsidian](https://obsidian.md/) v0.15.0 or newer
- [Dataview Plugin](https://github.com/blacksmithgu/obsidian-dataview) installed and enabled

DataCards relies on Dataview to function, as it transforms Dataview query results into card layouts.

## Installation Methods

### Option 1: Community Plugins (Coming Soon)

> **Note**: DataCards is not yet available in the Community Plugins store. Please use BRAT or manual installation until then.

1. Open Obsidian Settings
2. Go to Community Plugins
3. Disable Safe Mode if prompted
4. Click "Browse" and search for "Data Cards"
5. Click "Install", then "Enable"

### Option 2: BRAT Plugin (Recommended for Beta Testing)

The [BRAT (Beta Reviewers Auto-update Tester)](https://github.com/TfTHacker/obsidian42-brat) plugin allows you to install beta plugins not yet available in the Community Plugins store.

1. Install the BRAT plugin through Obsidian's Community Plugins
2. Open BRAT settings in Obsidian
3. Click "Add Beta Plugin"
4. Enter the DataCards repository URL: `https://github.com/Sophokles187/data-cards`
5. Click "Add Plugin"
6. Enable DataCards in the Community Plugins settings

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

## Verifying Installation

To verify that DataCards is properly installed:

1. Open Obsidian's Settings
2. Navigate to "Community plugins"
3. Check that "DataCards" appears in your list of installed plugins and is enabled

## Updating DataCards

### Community Plugins & BRAT

If you installed DataCards through the Community Plugins browser or BRAT, updates will be automatically available through Obsidian's plugin updater.

### Manual Updates

If you installed manually, you'll need to:

1. Download the latest release files
2. Replace the files in your `.obsidian/plugins/data-cards/` folder
3. Restart Obsidian if necessary

## Troubleshooting Installation

If you encounter problems during installation:

- Make sure Obsidian is updated to the latest version
- Verify that the Dataview plugin is installed and enabled
- Try restarting Obsidian after installation
- Check the console for any error messages (Help → Developer → Toggle Developer Tools)
