# Kanban Test

Create these test notes in your vault:

## Task 1
---
title: Setup Database
status: todo
priority: high
assignee: John
tags: [test-kanban]
---

Setup the database for the project.

## Task 2
---
title: Design UI
status: in-progress
priority: medium
assignee: Sarah
tags: [test-kanban]
---

Design the user interface mockups.

## Task 3
---
title: Write Tests
status: review
priority: low
assignee: Mike
tags: [test-kanban]
---

Write unit tests for the application.

## Task 4
---
title: Deploy App
status: done
priority: high
assignee: DevOps
tags: [test-kanban]
---

Deploy the application to production.

---

# Test Kanban

```datacards
TABLE file.link as "Task", priority, assignee, status
FROM #test-kanban
SORT status ASC

// Settings
preset: kanban
kanbanStatusOptions: ["backlog", "active", "testing", "deployed"]
kanbanColors: {
  "todo": "blue",
  "in-progress": "orange",
  "review": "purple",
  "done": "green"
}
newTaskPath: "Tasks"
newTaskTemplate: {
  "priority": "medium",
  "assignee": "John"
}
```

**Test:**
1. See colored columns
2. Click + button to create new task
3. Change status using dropdowns
