# FAQ & Troubleshooting

## Table of contents

- [Frequently Asked Questions](#frequently-asked-questions)
  - [General Questions](#general-questions)
  - [Setup and Configuration](#setup-and-configuration)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Error Messages](#error-messages)
  - [Advanced Troubleshooting](#advanced-troubleshooting)

## Frequently Asked Questions

### General Questions

#### What's the difference between DataCards and regular Dataview?
DataCards is built on top of Dataview and transforms Dataview query results into card layouts. While Dataview displays data in tables, lists, or tasks, DataCards presents the same data in a visually appealing card format with customizable layouts and image support.

#### Can I use DataCards without Dataview?
No, DataCards requires the Dataview plugin to be installed and enabled, as it uses Dataview to query your notes.

#### Does DataCards impact performance?
DataCards is designed to be as efficient as possible, but complex queries with many results or large images may impact performance. You can use the lazy loading feature to improve performance with large image collections.

#### How do I update my cards when I change my notes?
DataCards includes a refresh button on each container that appears when you hover over the top-left corner. This is the recommended way to update your cards. You can also enable automatic dynamic updates in the Advanced settings, but the refresh button is more reliable.

#### Can I use DataCards on mobile?
Yes, DataCards is fully compatible with Obsidian mobile and includes specific settings for mobile devices to optimize the display.

### Setup and Configuration

#### How do I include images in my cards?
1. Add an image property to your note's frontmatter (e.g., `cover: https://example.com/image.jpg`)
2. Include that property in your Dataview query
3. Specify the image property in your DataCards settings with `imageProperty: cover`

#### Why don't my properties appear on the cards?
Make sure you explicitly include all properties you want to display in your Dataview query. DataCards can only display properties that are included in the query.

#### Can I control which properties are displayed?
Yes, you can use the `properties` setting to specify which properties to show, or use `exclude` to hide specific properties.

#### How can I change the size of my cards?
Use the `preset` setting to change the overall layout, and `columns` to control how many cards appear in each row.

#### Can I use wiki links in my properties?
Yes, DataCards properly displays wiki links and allows them to be clickable.

## Troubleshooting

### Common Issues

#### My DataCards block isn't rendering
- Make sure the Dataview plugin is installed and enabled
- Check that your code block uses the correct syntax: ```datacards (with three backticks)
- Verify that your Dataview query is correct
- Check the console for any error messages (Help → Developer → Toggle Developer Tools)

#### Images aren't displaying correctly
- Verify that you've specified the correct image property name
- Check that the image path or URL is correct
- Make sure you included the image property in your Dataview query
- Try different image formats (URL, path, or wiki link)

#### My cards are showing empty or "No notes found"
- Check that your query is matching the notes you expect
- Verify that the properties you're querying exist in your notes
- Try simplifying your query to see if that works
- Ensure your frontmatter is correctly formatted

#### Some properties aren't appearing on my cards
- Make sure you've included all desired properties in your Dataview query
- Check that you haven't accidentally excluded them with the `exclude` setting
- Verify that the properties exist in your notes' frontmatter

#### Cards aren't updating when I change properties
- Use the refresh button: hover over the top-left corner of the DataCards container and click the refresh button (↻)
- Alternatively, use the command: "DataCards: Refresh DataCards in active view"
- If using dynamic updates: enable with `dynamicUpdate: true` (note: this feature is less reliable than the refresh button)

#### My custom settings aren't applying
- Check the syntax of your settings (should be `setting: value`)
- Make sure settings are after your query
- Verify that you're using the correct setting names

### Error Messages

#### "Dataview plugin is required but not enabled"
Install and enable the Dataview plugin in Obsidian's Community Plugins settings.

#### "Error executing Dataview query"
There's an issue with your Dataview query. Check the syntax and make sure it's valid.

#### "No notes found"
Your query didn't match any notes. Check your query and make sure your notes have the right tags or properties.

### Advanced Troubleshooting

#### Enable Debug Mode
If you're experiencing issues, enable debug mode in the plugin settings to get more detailed information:

1. Open Obsidian Settings
2. Go to DataCards plugin settings
3. Enable "Debug Mode" under Developer Settings
4. Open the developer console (Help → Developer → Toggle Developer Tools)
5. Look for messages starting with "[DataCards]"

#### Reset Settings
If you're having persistent issues, try resetting to default settings:

1. Open Obsidian Settings
2. Go to DataCards plugin settings
3. Click the reset button on each setting