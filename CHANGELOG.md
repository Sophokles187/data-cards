# Changelog

All notable changes to the DataCards plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-19

### Added
- **Kanban Boards**: Transform your notes into interactive task boards with the new kanban preset
  - Automatic organization of notes into columns by status property
  - Inline status editing with dropdown menus for quick task management
  - New task creation directly from kanban boards with "+" buttons in column headers
  - Smart tag management - new tasks automatically get the correct tags to appear in your board
  - Custom status values and colors for personalized workflow organization
  - Empty state handling with guided task creation for new boards
  - Status selection in new task modal for flexible task placement
- **Enhanced Documentation**: Comprehensive kanban feature documentation with examples and best practices
- **Settings Validation**: Clear documentation about single-line JSON object requirements for settings

### Improved
- **Code Quality**: Removed all debug logging to comply with Obsidian guidelines
- **Error Handling**: Better error messages for kanban setup issues
- **User Experience**: Intuitive workflow for creating and managing tasks in kanban boards

### Technical
- Added kanban-specific CSS styling and layout management
- Implemented automatic frontmatter updates for status changes
- Enhanced settings parser with better validation
- Improved empty state rendering with preset-specific handling

### Documentation
- Added comprehensive kanban documentation in `/docs/features/kanban.md`
- Updated README with kanban feature highlights
- Added clear examples for kanban customization and use cases
- Documented single-line JSON requirement for object settings

## [1.0.4] - Previous Release

### Previous Features
- Card presets (grid, portrait, square, compact, dense)
- Advanced image support with lazy loading
- Refresh button for manual updates
- Dynamic and fixed column layouts
- Mobile optimization
- Property customization and formatting
- Rich text processing with wiki links and HTML support
