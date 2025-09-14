# Updates & Refresh

DataCards provides two ways to update your cards when data changes: a manual refresh button (recommended) and automatic dynamic updates (legacy).

## Refresh Button (Recommended)

Each DataCards container includes a refresh button that appears when you hover over the top-left corner. This is the recommended way to update your cards.

**Benefits:**
- Works reliably in both reading and editing modes
- Gives you full control over when updates happen
- No performance impact when not in use
- Simple and predictable behavior

**Usage:**
1. Make changes to your note properties
2. Hover over the DataCards container
3. Click the refresh button (↻) that appears in the top-left corner

## Dynamic Updates (Legacy)

⚠️ **Not Recommended**: Dynamic updates are a legacy feature that may be unreliable, especially in editing mode. The refresh button is recommended instead.

DataCards can automatically update when your note properties change, but this feature has limitations and may impact performance.

### Enabling Dynamic Updates

⚠️ **Warning**: This feature may be unreliable and can impact performance. Consider using the refresh button instead.

#### For a Specific Card Block

Add the `dynamicUpdate` setting to your DataCards code block:

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
dynamicUpdate: true
```

#### Globally in Plugin Settings

To enable dynamic updates for all DataCards blocks:

1. Open Obsidian Settings
2. Go to the DataCards plugin settings
3. Navigate to the "Advanced (Experimental)" section
4. Enable "Dynamic Updates"
5. Optionally adjust the "Refresh Delay"


## Refresh Delay

Control how long the plugin waits before refreshing after detecting changes:

```
refreshDelay: 3000  // Wait 3 seconds before refreshing (in milliseconds)
```

The default delay is 2500ms (2.5 seconds). This delay helps prevent excessive refreshes while you're still typing or making changes.

## Performance Considerations

Dynamic updates can impact performance, especially with:

- Large numbers of notes
- Complex queries
- Frequent updates

To optimize performance:

- Use specific queries that match fewer notes
- Increase the refresh delay
- Only enable dynamic updates where needed


## Troubleshooting



- Verify that `dynamicUpdate: true` is set or that the global setting is enabled
- Dynamic updates work better in reading mode than editing mode
- Make sure the Dataview plugin is up to date
- Try increasing the `refreshDelay` value
- **Consider switching to the refresh button for more reliable updates**

> **Note for Meta Bind users**: When editing properties with Meta Bind while dynamic updates are enabled, you may experience the input field losing focus if you pause typing for more than the refresh delay. This is due to how the plugins interact and is a known limitation.