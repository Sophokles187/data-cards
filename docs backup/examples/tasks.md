---
layout: default
title: Task Management
parent: Examples
nav_order: 2
---

# Task Management Example
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

This example shows how to use DataCards for task and project management.

## Task Dashboard

Create a visual task dashboard:

```markdown
```datacards
TABLE file.link as "Task", priority, status, dueDate, assigned FROM #tasks
WHERE status != "completed"
SORT dueDate ASC

// Settings
preset: grid
columns: 4
properties: [file.link, priority, status, dueDate, assigned]
defaultDateFormat: YYYY-MM-DD
```
```

![Task Dashboard Example](../assets/screenshots/example-tasks.png)

## Properties to Include in Your Task Notes

For this example to work, make sure your task notes have:

```yaml
---
tags: tasks
priority: High
status: In Progress
dueDate: 2023-09-30
assigned: John Doe
---
```

## Task Kanban Board

Group tasks by status to create a Kanban-like view:

```markdown
# Task Board

## To Do
```datacards
TABLE file.link as "Task", priority, dueDate FROM #tasks
WHERE status = "To Do"
SORT priority DESC

// Settings
preset: dense
columns: 2
```
```

## In Progress
```datacards
TABLE file.link as "Task", priority, dueDate FROM #tasks
WHERE status = "In Progress"
SORT priority DESC

// Settings
preset: dense
columns: 2
```
```

## Done
```datacards
TABLE file.link as "Task", priority, dueDate FROM #tasks
WHERE status = "Done"
SORT dueDate DESC

// Settings
preset: dense
columns: 2
```
```
```

## Project Overview

Show tasks organized by project:

```markdown
```datacards
TABLE file.link as "Task", priority, status, dueDate FROM #projects
SORT priority DESC

// Settings
preset: grid
properties: [file.link, priority, status, dueDate]
dynamicUpdate: true
```
```

## Task Priority Matrix

Organize tasks by priority:

```markdown
# Task Priority Matrix

## High Priority
```datacards
TABLE file.link as "Task", status, dueDate FROM #tasks
WHERE priority = "High"
SORT dueDate ASC

// Settings
preset: dense
columns: 3
```
```

## Medium Priority
```datacards
TABLE file.link as "Task", status, dueDate FROM #tasks
WHERE priority = "Medium"
SORT dueDate ASC

// Settings
preset: dense
columns: 3
```
```

## Low Priority
```datacards
TABLE file.link as "Task", status, dueDate FROM #tasks
WHERE priority = "Low"
SORT dueDate ASC

// Settings
preset: dense
columns: 3
```
```
```

## Tasks with Dynamic Updates

If you're using Meta Bind or other property editing plugins:

```markdown
```datacards
TABLE file.link as "Task", priority, status, dueDate FROM #tasks
WHERE status != "completed"
SORT dueDate ASC

// Settings
preset: grid
dynamicUpdate: true
refreshDelay: 1000
```
```

This will automatically update the cards when you change task properties.

## Tasks with Boolean Properties

If you track task completion with boolean properties:

```markdown
```datacards
TABLE file.link as "Task", completed, priority, dueDate FROM #tasks
SORT dueDate ASC

// Settings
preset: grid
booleanDisplayMode: checkbox
booleanTrueText: "Done"
booleanFalseText: "Pending"
```
```
