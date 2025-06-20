# Kanban Test Notes

Copy these notes into your Obsidian vault to test the kanban functionality:

## Task - Setup Database.md
```markdown
---
title: Setup Database
status: todo
priority: high
assignee: John
due: 2024-01-15
project: Website Redesign
tags:
  - test-kanban
  - backend
---

Set up the initial database schema and connections.
```

## Task - Design Homepage.md
```markdown
---
title: Design Homepage
status: in-progress
priority: high
assignee: Sarah
due: 2024-01-20
project: Website Redesign
tags:
  - test-kanban
  - design
---

Create mockups and wireframes for the new homepage.
```

## Task - Write API Documentation.md
```markdown
---
title: Write API Documentation
status: review
priority: medium
assignee: Mike
due: 2024-01-25
project: Website Redesign
tags:
  - test-kanban
  - documentation
---

Document all API endpoints and usage examples.
```

## Task - Deploy to Production.md
```markdown
---
title: Deploy to Production
status: done
priority: low
assignee: DevOps
due: 2024-01-10
project: Website Redesign
tags:
  - test-kanban
  - deployment
---

Deploy the completed features to production environment.
```

## Task - Fix Login Bug.md
```markdown
---
title: Fix Login Bug
status: todo
priority: medium
assignee: John
due: 2024-01-18
project: Website Redesign
tags:
  - test-kanban
  - bugfix
---

Resolve the authentication issue preventing user login.
```

## Task - Update User Interface.md
```markdown
---
title: Update User Interface
status: in-progress
priority: low
assignee: Sarah
due: 2024-01-30
project: Website Redesign
tags:
  - test-kanban
  - ui
---

Modernize the user interface with new design system.
```

# Test DataCards Blocks

Add these DataCards blocks to a note to test the kanban functionality:

## Basic Kanban Test
```datacards
TABLE file.link as "Task", priority, assignee, due
FROM #test-kanban
GROUP BY status
SORT status ASC

// Settings
preset: kanban
```

## Filtered Kanban Test (High Priority Only)
```datacards
TABLE file.link as "Task", priority, assignee, due
FROM #test-kanban
WHERE priority = "high"
GROUP BY status
SORT priority DESC

// Settings
preset: kanban
kanbanColumnWidth: 250px
kanbanShowColumnCounts: true
kanbanCompactCards: true
```

## Group by Priority (Alternative Kanban)
```datacards
TABLE file.link as "Task", status, assignee, due
FROM #test-kanban
GROUP BY priority
SORT priority ASC

// Settings
preset: kanban
```

## Group by Assignee (Team View)
```datacards
TABLE file.link as "Task", status, priority, due
FROM #test-kanban
GROUP BY assignee
SORT assignee ASC

// Settings
preset: kanban
```

## Non-Kanban Grouped Results (For Comparison)
```datacards
TABLE file.link as "Task", priority, assignee, due
FROM #test-kanban
GROUP BY status
SORT status ASC

// Settings
preset: grid
```
