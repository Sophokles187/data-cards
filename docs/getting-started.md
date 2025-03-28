# Getting Started with DataCards

## Table of contents

- [Installation](#installation)
  - [Requirements](#requirements)
  - [Installation Methods](#installation-methods)
- [Basic Usage](#basic-usage)
- [Your First DataCards Block](#your-first-datacards-block)
- [Customizing Cards](#customizing-cards)
- [Settings Reference](#settings-reference)

## Installation

### Requirements

- [Obsidian](https://obsidian.md/) v0.15.0+
- [Dataview Plugin](https://github.com/blacksmithgu/obsidian-dataview)

### Installation Methods

#### Method 1: Community Plugins
> **Note**: DataCards is not yet available in the Community Plugins store. Please use BRAT or manual installation until then.

1. Open Obsidian Settings
2. Go to Community Plugins
3. Click "Browse" and search for "Data Cards"
4. Click "Install", then "Enable"

#### Method 2: BRAT Plugin 
1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) through Community Plugins
2. Open BRAT settings in Obsidian
3. Click "Add Beta Plugin"
4. Enter the DataCards repository URL: `https://github.com/Sophokles187/data-cards`
5. Click "Add Plugin"
6. Enable DataCards in Community Plugins settings

#### Method 3: Manual Installation 
1. Download the latest release from the [releases page](https://github.com/Sophokles187/data-cards/releases)
2. Download these files:
   - `main.js`
   - `manifest.json`
   - `style.css`
3. Navigate to your Obsidian vault's `.obsidian/plugins/` directory
4. Create a new folder named `data-cards`
5. Copy the downloaded files into the `data-cards` folder
6. Enable the plugin in Obsidian's Community Plugins settings

## Basic Usage

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

## Customizing Cards

You can customize your cards by adding settings after your query:

```markdown
```datacards
TABLE author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
```
```

Settings are added after your query, following a line with `// Settings`. Each setting is specified as `key: value` on a new line.

## Settings Reference

For a complete list of all available settings and their options, refer to the **[Settings Reference](settings-reference.md)** page.

This reference includes:
- All available settings with descriptions
- Default values
- Available options for each setting
- Example usages

You can access this reference at any time to find the exact setting you need.