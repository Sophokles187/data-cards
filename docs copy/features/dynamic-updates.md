# Dynamic Updates

DataCards can automatically update when your note properties change, providing a real-time view of your data.

## Enabling Dynamic Updates

By default, cards are not automatically updated when you change your notes. You need to enable dynamic updates explicitly.

### For a Specific Card Block

Add the `dynamicUpdate` setting to your DataCards code block:

```datacards
TABLE file.link, author, rating, genre, cover FROM #books
SORT rating DESC

// Settings
preset: portrait
imageProperty: cover
dynamicUpdate: true
```

### Globally in Plugin Settings

To enable dynamic updates for all DataCards blocks:

1. Open Obsidian Settings
2. Go to the DataCards plugin settings
3. Navigate to the "Update Settings" section
4. Enable "Dynamic Updates"
5. Optionally adjust the "Refresh Delay"

## How Dynamic Updates Work

When dynamic updates are enabled:

1. DataCards monitors changes to notes that match your query
2. When a relevant property changes, the cards are automatically refreshed after the configured delay
3. Only the affected cards are updated, not the entire display

## Update Triggers

Cards will update when:

- You modify a property in a note's frontmatter
- You add or remove a tag that affects the query results
- You create or delete a note that matches the query
- You manually trigger a refresh

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

## Examples

### Task Tracker with Dynamic Updates

```datacards
TABLE file.link as "Task", status, priority, dueDate FROM #tasks
WHERE status != "Completed"
SORT dueDate ASC

// Settings
preset: grid
dynamicUpdate: true
```

### Reading Progress Tracker

```datacards
TABLE file.link as "Book", author, progress, cover FROM #books
WHERE status = "Reading"
SORT progress DESC

// Settings
preset: portrait
imageProperty: cover
dynamicUpdate: true
```

## Troubleshooting

If dynamic updates aren't working:

- Verify that `dynamicUpdate: true` is set or that the global setting is enabled
- Check that you're in preview mode, not edit mode
- Make sure the Dataview plugin is up to date
- Try increasing the `refreshDelay` value

> **Note for Meta Bind users**: When editing properties with Meta Bind while dynamic updates are enabled, you may experience the input field losing focus if you pause typing for more than the refresh delay. This is due to how the plugins interact and is a known limitation.