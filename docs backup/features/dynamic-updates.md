---
layout: default
title: Dynamic Updates
parent: Features
nav_order: 5
---

# Dynamic Updates
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

DataCards can automatically update when properties of displayed notes change. This is particularly useful when using plugins like Meta Bind that allow editing properties directly in the preview mode.

## Enabling Dynamic Updates

Dynamic updates can be enabled globally in the plugin settings or per card:

### Global Setting

1. Open Obsidian Settings
2. Go to DataCards plugin settings
3. Enable "Enable Dynamic Updates"

### Per-Card Setting

Individual cards can override the global setting:

```markdown
```datacards
TABLE title, status, priority FROM #tasks
SORT priority DESC

// Settings
preset: grid
dynamicUpdate: true
```
```

## How It Works

When dynamic updates are enabled:

1. DataCards monitors for property changes in your notes
2. When a change is detected, the cards will automatically refresh
3. This happens with a slight delay to avoid refreshing while you're still typing

## Refresh Delay

You can adjust how long DataCards waits before refreshing after a property change:

```markdown
```datacards
TABLE title, status, priority FROM #tasks
SORT priority DESC

// Settings
dynamicUpdate: true
refreshDelay: 1000  // 1 second (in milliseconds)
```
```

The default delay is 2500ms (2.5 seconds).

## Integration with Meta Bind

DataCards works well with the [Meta Bind](https://github.com/mProjectsCode/obsidian-meta-bind-plugin) plugin, which allows editing frontmatter properties directly in preview mode.

When using both plugins together:

1. Enable dynamic updates in DataCards
2. Edit properties using Meta Bind inputs
3. DataCards will automatically refresh to show the updated values

**Note for Meta Bind users**: When editing properties with Meta Bind while dynamic updates are enabled, you may experience the input field losing focus if you pause typing for more than the refresh delay. This is due to how the plugins interact and is a known limitation.

## Performance Considerations

Dynamic updates can impact performance, especially with large collections or frequent updates. If you notice performance issues:

1. Increase the refresh delay
2. Disable dynamic updates globally and only enable it for specific cards
3. Consider using the manual refresh command instead

## Manual Refresh

You can manually refresh DataCards at any time using the command:

1. Open the Command Palette (Ctrl/Cmd + P)
2. Search for "DataCards: Refresh DataCards in active view"
3. Execute the command

This is useful when you need immediate updates without waiting for the automatic refresh.
