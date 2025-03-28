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
3. Enable "Dynamic Updates"
4. Optionally adjust the update interval

## How Dynamic Updates Work

When dynamic updates are enabled:

1. DataCards monitors changes to notes that match your query
2. When a relevant property changes, the cards are automatically refreshed
3. Only the affected cards are updated, not the entire display

## Update Triggers

Cards will update when:

- You modify a property in a note's frontmatter
- You add or remove a tag that affects the query results
- You create or delete a note that matches the query
- You manually trigger a refresh

## Manual Refresh

You can manually refresh your cards at any time:

1. Command palette: "DataCards: Refresh DataCards in active view"
2. Right-click on a DataCards block and select "Refresh DataCards"

## Update Interval

Control how frequently DataCards checks for updates:

```
updateInterval: 5000  // Check every 5 seconds (in milliseconds)
```

The default interval is 2000ms (2 seconds).

## Performance Considerations

Dynamic updates can impact performance, especially with:

- Large numbers of notes
- Complex queries
- Frequent updates

To optimize performance:

- Use specific queries that match fewer notes
- Increase the update interval
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
updateInterval: 3000
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

### Project Dashboard

```datacards
TABLE file.link as "Project", status, team, deadline FROM #projects
SORT deadline ASC

// Settings
preset: compact
dynamicUpdate: true
conditionalFormatting: {
  "status": [
    { "condition": "= 'Completed'", "color": "#4CAF50" },
    { "condition": "= 'In Progress'", "color": "#FFC107" },
    { "condition": "= 'Not Started'", "color": "#F44336" }
  ]
}
```

## Troubleshooting

If dynamic updates aren't working:

- Verify that `dynamicUpdate: true` is set
- Check that you're in preview mode, not edit mode
- Make sure the Dataview plugin is up to date
- Try increasing the `updateInterval` value
- Check the console for any error messages