# Task Management Example

This example shows how to create a task management dashboard with DataCards.

## Basic Task Board

A simple kanban-style board for your tasks:

```datacards
TABLE file.link as "Task", status, priority, dueDate FROM #tasks
SORT dueDate ASC

// Settings
preset: grid
conditionalFormatting: {
  "status": [
    { "condition": "= 'Completed'", "color": "#4CAF50" },
    { "condition": "= 'In Progress'", "color": "#FFC107" },
    { "condition": "= 'Not Started'", "color": "#F44336" }
  ]
}
```


## Properties to Include in Your Task Notes

For this example to work, make sure your task notes have:

```yaml
---
tags: tasks
status: In Progress
priority: High
dueDate: 2023-07-15
assignee: John Doe
---
```

## Advanced Task Board

More detailed version with additional properties:


```datacards
TABLE 
  file.link as "Task", 
  status, 
  priority,
  dueDate,
  assignee,
  progress
FROM #tasks
SORT priority DESC, dueDate ASC

// Settings
preset: grid
dynamicUpdate: true
conditionalFormatting: {
  "priority": [
    { "condition": "= 'High'", "color": "#F44336" },
    { "condition": "= 'Medium'", "color": "#FFC107" },
    { "condition": "= 'Low'", "color": "#4CAF50" }
  ],
  "status": [
    { "condition": "= 'Completed'", "color": "#4CAF50" },
    { "condition": "= 'In Progress'", "color": "#2196F3" },
    { "condition": "= 'Not Started'", "color": "#9E9E9E" }
  ]
}
```


## Filter by Status

Display tasks with a specific status:

```datacards
TABLE file.link as "Task", priority, dueDate, assignee FROM #tasks
WHERE status = "In Progress"
SORT dueDate ASC

// Settings
preset: grid
```


## Due Today

Display tasks due today:


```datacards
TABLE file.link as "Task", status, priority, assignee FROM #tasks
WHERE date(dueDate) = date(today)
SORT priority DESC

// Settings
preset: grid
columns: 2
```


## Project-Specific Tasks

If you use sub-tags for organizing tasks:


```datacards
TABLE file.link as "Task", status, priority, dueDate FROM #tasks/project-alpha
SORT dueDate ASC

// Settings
preset: grid

```

## Compact Task List

A more compact display for many tasks:


```datacards
TABLE file.link as "Task", status, priority, dueDate, assignee FROM #tasks
SORT dueDate ASC

// Settings
preset: compact
```

