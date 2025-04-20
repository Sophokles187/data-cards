import { App, PluginSettingTab, Setting } from 'obsidian'; // Remove unused imports: Notice, Modal, MarkdownRenderer
import { DataCardsSettings } from '../models/settings';
import DataCardsPlugin from '../main';
// Removed import for settingsReferenceContent

/**
 * Settings tab for the DataCards plugin
 */
// Removed SettingsReferenceModal class definition

export class DataCardsSettingTab extends PluginSettingTab {
  plugin: DataCardsPlugin;

  constructor(app: App, plugin: DataCardsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // General settings (no heading)

    // Add button to open settings reference website
    new Setting(containerEl)
      .setName('Settings reference')
      .setDesc('Open the complete settings reference guide on the website.')
      .addButton(button => button
        .setButtonText('Open reference website')
        .setCta() // Make it stand out a bit
        .onClick(() => {
          // Open the external link in the default browser
          window.open('https://sophokles187.github.io/data-cards/#/settings-reference', '_blank');
        }));

    // Preset settings
    new Setting(containerEl).setName('Presets').setHeading();

    new Setting(containerEl)
      .setName('Default preset')
      .setDesc('Choose the default preset for cards')
      .addDropdown(dropdown => dropdown
        .addOption('grid', 'Grid (balanced, 3 columns)')
        .addOption('portrait', 'Portrait (optimized for book covers, 3 columns)')
        .addOption('square', 'Square (1:1 cards with minimal text, 4 columns)')
        .addOption('compact', 'Compact (side-by-side layout, 4 columns)')
        .addOption('dense', 'Dense (maximum density, 6 columns)')
        .setValue(this.plugin.settings.preset)
        .onChange(async (value: string) => {
          this.plugin.settings.preset = value as any;
          await this.plugin.saveSettings();
        }));

    // Hidden setting for columns - we keep it in the code but don't show in UI
    // as presets now define recommended column counts

    // Image settings
    new Setting(containerEl).setName('Images').setHeading();

    new Setting(containerEl)
      .setName('Default image property')
      .setDesc('The frontmatter property to use for images')
      .addText(text => text
        .setPlaceholder('cover')
        .setValue(this.plugin.settings.imageProperty)
        .onChange(async (value) => {
          this.plugin.settings.imageProperty = value;
          await this.plugin.saveSettings();
        }));

    // Image height and fit are now controlled by presets
    // These settings have been removed from the UI to avoid confusion
    // Users can still override them in individual code blocks

    // Display settings
    new Setting(containerEl).setName('Display').setHeading();

    new Setting(containerEl)
      .setName('Show property labels')
      .setDesc('Show labels for properties')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showLabels)
        .onChange(async (value) => {
          this.plugin.settings.showLabels = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Card spacing')
      .setDesc('Space between cards (in pixels)')
      .addSlider(slider => slider
        .setLimits(0, 32, 4)
        .setValue(this.plugin.settings.cardSpacing)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.cardSpacing = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Enable card shadows')
      .setDesc('Add subtle shadows to cards for a more three-dimensional appearance')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableShadows)
        .onChange(async (value) => {
          this.plugin.settings.enableShadows = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Properties alignment')
      .setDesc('Text alignment for properties and their labels')
      .addDropdown(dropdown => dropdown
        .addOption('left', 'Left')
        .addOption('center', 'Center')
        .addOption('right', 'Right')
        .setValue(this.plugin.settings.propertiesAlign)
        .onChange(async (value: string) => {
          this.plugin.settings.propertiesAlign = value as any;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Title alignment')
      .setDesc('Text alignment for the title (filename)')
      .addDropdown(dropdown => dropdown
        .addOption('left', 'Left')
        .addOption('center', 'Center')
        .addOption('right', 'Right')
        .setValue(this.plugin.settings.titleAlign)
        .onChange(async (value: string) => {
          this.plugin.settings.titleAlign = value as any;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show file as title')
      .setDesc('When using TABLE WITHOUT ID, show the file name as the card title') // Assuming TABLE WITHOUT ID is a specific term
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showFileAsTitle)
        .onChange(async (value) => {
          this.plugin.settings.showFileAsTitle = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Font size')
      .setDesc('Text size for all card elements (properties, labels, and title)')
      .addDropdown(dropdown => dropdown
        .addOption('larger', 'Larger (120%)')
        .addOption('large', 'Large (110%)')
        .addOption('default', 'Default (100%)')
        .addOption('small', 'Small (90% - similar to dense preset)')
        .addOption('smaller', 'Smaller (80%)')
        .setValue(this.plugin.settings.fontSize)
        .onChange(async (value: string) => {
          this.plugin.settings.fontSize = value as any;
          await this.plugin.saveSettings();
        }));

    // Card Content Settings
    new Setting(containerEl).setName('Card content').setHeading();

    new Setting(containerEl)
      .setName('Scrollable properties')
      .setDesc('Enable scrolling for card properties when they exceed the content height (Note: Square and Compact presets are scrollable by default)') // Assuming Square and Compact are proper nouns
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.scrollableProperties)
        .onChange(async (value) => {
          this.plugin.settings.scrollableProperties = value;
          await this.plugin.saveSettings();
        }));

    // Card Interaction Settings
    new Setting(containerEl).setName('Card interaction').setHeading();

    new Setting(containerEl)
      .setName('Enable clickable cards')
      .setDesc('Make the entire card clickable to open the note (not just the title)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableClickableCards)
        .onChange(async (value) => {
          this.plugin.settings.enableClickableCards = value;
          await this.plugin.saveSettings();
        }));


    new Setting(containerEl)
      .setName('Content height')
      .setDesc('Height of the scrollable content area (e.g., 200px)')
      .addText(text => text
        .setPlaceholder('200px')
        .setValue(this.plugin.settings.contentHeight)
        .onChange(async (value) => {
          this.plugin.settings.contentHeight = value || '200px';
          await this.plugin.saveSettings();
        }));

    // Formatting settings
    new Setting(containerEl).setName('Formatting').setHeading();

    new Setting(containerEl)
      .setName('Default date format')
      .setDesc('Format for displaying dates (YYYY = year, MM = month, DD = day)') // Assuming YYYY, MM, DD are specific format codes
      .addText(text => text
        .setPlaceholder('YYYY-MM-DD')
        .setValue(this.plugin.settings.defaultDateFormat)
        .onChange(async (value) => {
          this.plugin.settings.defaultDateFormat = value || 'YYYY-MM-DD';
          await this.plugin.saveSettings();
        }));

    // Boolean Display Settings
    new Setting(containerEl).setName('Boolean display').setHeading();

    new Setting(containerEl)
      .setName('Boolean display mode')
      .setDesc('How to display boolean values in cards')
      .addDropdown(dropdown => dropdown
        .addOption('both', 'Both checkbox and text')
        .addOption('checkbox', 'Checkbox only')
        .addOption('text', 'Text only')
        .setValue(this.plugin.settings.booleanDisplayMode)
        .onChange(async (value: string) => {
          this.plugin.settings.booleanDisplayMode = value as any;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show boolean labels')
      .setDesc('Show text labels for boolean values')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showBooleanLabels)
        .onChange(async (value) => {
          this.plugin.settings.showBooleanLabels = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('True text')
      .setDesc('Custom text to display for true values')
      .addText(text => text
        .setPlaceholder('true')
        .setValue(this.plugin.settings.booleanTrueText)
        .onChange(async (value) => {
          this.plugin.settings.booleanTrueText = value || 'true';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('False text')
      .setDesc('Custom text to display for false values')
      .addText(text => text
        .setPlaceholder('false')
        .setValue(this.plugin.settings.booleanFalseText)
        .onChange(async (value) => {
          this.plugin.settings.booleanFalseText = value || 'false';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Per-card boolean settings')
      .setDesc('Individual cards can override these settings in their code block settings')
      .setDisabled(true);

    // Mobile settings
    new Setting(containerEl).setName('Mobile').setHeading();

    new Setting(containerEl)
      .setName('Mobile preset')
      .setDesc('Preset to use on mobile devices')
      .addDropdown(dropdown => dropdown
        .addOption('grid', 'Grid (balanced)')
        .addOption('portrait', 'Portrait (optimized for book covers)')
        .addOption('square', 'Square (1:1 cards with minimal text)')
        .addOption('compact', 'Compact (side-by-side layout)')
        .addOption('dense', 'Dense (maximum density)')
        .setValue(this.plugin.settings.mobilePreset)
        .onChange(async (value: string) => {
          this.plugin.settings.mobilePreset = value as any;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Mobile columns')
      .setDesc('Number of columns to use on mobile devices (default: 1)')
      .addSlider(slider => slider
        .setLimits(1, 3, 1)
        .setValue(this.plugin.settings.mobileColumns)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.mobileColumns = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Mobile scrollable properties')
      .setDesc('Enable scrolling for card properties on mobile devices')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.mobileScrollableProperties)
        .onChange(async (value) => {
          this.plugin.settings.mobileScrollableProperties = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Mobile content height')
      .setDesc('Height of the scrollable content area on mobile devices')
      .addText(text => text
        .setPlaceholder('150px')
        .setValue(this.plugin.settings.mobileContentHeight)
        .onChange(async (value) => {
          this.plugin.settings.mobileContentHeight = value || '150px';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Force mobile mode')
      .setDesc('Force the plugin to use mobile settings even on desktop (for testing)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.forceMobileMode)
        .onChange(async (value) => {
          this.plugin.settings.forceMobileMode = value;
          await this.plugin.saveSettings();
        }));

    // Performance settings
    new Setting(containerEl).setName('Performance').setHeading();

    new Setting(containerEl)
      .setName('Enable lazy loading')
      .setDesc('Only load images when they become visible (improves performance with many cards)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableLazyLoading)
        .onChange(async (value) => {
          this.plugin.settings.enableLazyLoading = value;
          await this.plugin.saveSettings();
        }));

    // Update settings
    new Setting(containerEl).setName('Updates').setHeading();

    new Setting(containerEl)
      .setName('Enable dynamic updates')
      .setDesc('Automatically update DataCards when properties change (may impact performance)') // Assuming DataCards is a proper noun
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableDynamicUpdates)
        .onChange(async (value) => {
          this.plugin.settings.enableDynamicUpdates = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Refresh delay')
      .setDesc('Delay in milliseconds before refreshing after a property change (higher values give more time to complete typing)')
      .addSlider(slider => slider
        .setLimits(500, 5000, 500)
        .setValue(this.plugin.settings.refreshDelay)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.refreshDelay = value;
          await this.plugin.saveSettings();
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Reset to default (2500ms)')
        .onClick(async () => {
          this.plugin.settings.refreshDelay = 2500;
          await this.plugin.saveSettings();
          this.display(); // Refresh the settings tab
        }));

    new Setting(containerEl)
      .setName('Per-card dynamic updates')
      .setDesc('Individual cards can override the global setting with "dynamicUpdate: true/false" in their settings')
      .setDisabled(true);

    // Debug settings
    new Setting(containerEl).setName('Developer').setHeading();

    new Setting(containerEl)
      .setName('Debug mode')
      .setDesc('Enable debug logging (only use during development or troubleshooting)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.debugMode)
        .onChange(async (value) => {
          this.plugin.settings.debugMode = value;
          await this.plugin.saveSettings();
        }));

    // Help section
    new Setting(containerEl).setName('Help').setHeading();

    const helpText = containerEl.createEl('div');

    // Basic Usage section
    const basicUsagePara = helpText.createEl('p');
    const basicUsageStrong = basicUsagePara.createEl('strong', { text: 'Basic Usage:' });
    basicUsagePara.createEl('br');
    basicUsagePara.appendText('Use the ');
    basicUsagePara.createEl('code', { text: 'datacards' });
    basicUsagePara.appendText(' code block to create card layouts from Dataview queries.');

    // Example section
    const examplePara = helpText.createEl('p');
    examplePara.createEl('strong', { text: 'Example:' });

    const preElement = helpText.createEl('pre');
    const codeElement = preElement.createEl('code');
    codeElement.setText(
`\`\`\`datacards
TABLE title, author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: grid
imageFit: contain
defaultDateFormat: YYYY
\`\`\``
    );

    // Important note
    const importantPara = helpText.createEl('p');
    importantPara.createEl('strong', { text: 'Important:' });
    importantPara.appendText(' You must explicitly include all properties you want to display in your Dataview query (including the image property).');

    // Image Support section
    const imageSupportPara = helpText.createEl('p');
    imageSupportPara.createEl('strong', { text: 'Image Support:' });
    imageSupportPara.createEl('br');
    imageSupportPara.appendText('The plugin supports external URLs, vault images, and wiki links:');
    imageSupportPara.createEl('br');
    imageSupportPara.createEl('code', { text: 'cover: https://example.com/image.jpg' });
    imageSupportPara.appendText(' or ');
    imageSupportPara.createEl('code', { text: 'cover: [[path/to/image.jpg]]' });

    // Tip section
    const tipPara = helpText.createEl('p');
    tipPara.createEl('strong', { text: 'Tip:' });
    tipPara.appendText(' Data Cards works best with the Editor-Setting "Readable line length" disabled.');

    helpText.createEl('br');

    // Documentation link
    const docLinkPara = helpText.createEl('p');
    const docLink = docLinkPara.createEl('a', {
      text: 'View documentation homepage',
      href: 'https://sophokles187.github.io/data-cards/#/'
    });
    docLink.setAttribute('target', '_blank');
    docLink.setAttribute('rel', 'noopener');
  }
}
