---
title: Installation
icon: fas fa-download
order: 4
---

# Installation

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

## Getting Started

Create a `datacards` code block with a Dataview query:

```markdown
```datacards
TABLE author, rating, genre FROM #books
SORT rating DESC
```
```

This will automatically render the results as cards using the default settings.

## Your First DataCards Block

1. Make sure both Dataview and DataCards plugins are enabled
2. Create a new note or open an existing one
3. Start a new code block with three backticks followed by `datacards`
4. Write a Dataview query
5. End the code block with three backticks
6. Preview your note to see the cards

That's it! Your Dataview results will now display as beautiful cards.
