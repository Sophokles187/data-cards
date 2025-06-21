# Task Management Example

This example shows how to create interactive task management boards with DataCards using the new kanban preset.

## Basic Kanban Board

A simple kanban board for your tasks:

```datacards
TABLE file.link as "Task", priority, assignee, status FROM #tasks
SORT status ASC

// Settings
preset: kanban
```


## Custom Kanban with Colors

Kanban board with custom status options and colors:

```datacards
TABLE file.link as "Task", priority, assignee, due, status FROM #tasks
SORT status ASC

// Settings
preset: kanban
kanbanStatusOptions: ["backlog", "in-progress", "review", "done"]
kanbanColors: {"backlog": "gray", "in-progress": "blue", "review": "orange", "done": "green"}
```

## Team Project Kanban

Kanban board with new task templates for team collaboration:

```datacards
TABLE file.link as "Task", assignee, priority, due, status FROM #team-project
SORT status ASC

// Settings
preset: kanban
kanbanStatusOptions: ["todo", "active", "testing", "deployed"]
kanbanColors: {"todo": "blue", "active": "orange", "testing": "purple", "deployed": "green"}
newTaskPath: "Projects/Team Tasks"
newTaskTemplate: {"priority": "medium", "assignee": "", "due": ""}
```


## Personal Task Management

Simple kanban for personal productivity:

```datacards
TABLE file.link as "Task", priority, due, status FROM #personal-tasks
SORT status ASC

// Settings
preset: kanban
kanbanStatusOptions: ["todo", "doing", "done"]
kanbanColors: {"todo": "blue", "doing": "orange", "done": "green"}
newTaskPath: "Personal/Tasks"
newTaskTemplate: {"priority": "", "due": ""}
```

## Content Creation Pipeline

Kanban for managing content creation workflow:

```datacards
TABLE file.link as "Article", author, wordcount, status FROM #content-pipeline
SORT status ASC

// Settings
preset: kanban
kanbanStatusOptions: ["idea", "draft", "review", "published"]
kanbanColors: {"idea": "gray", "draft": "blue", "review": "orange", "published": "green"}
newTaskPath: "Content/Articles"
newTaskTemplate: {"author": "", "wordcount": "", "category": ""}
```

## Properties to Include in Your Task Notes

For these examples to work, make sure your task notes have the required frontmatter:

```yaml
---
tags: [tasks]
status: todo
priority: high
due: 2024-01-15
assignee: John Doe
---
```

The kanban preset automatically detects the `status` property and organizes your tasks into columns. You can edit the status directly from the kanban board using the dropdown menus.

