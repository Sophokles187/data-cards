import { App, PluginSettingTab, Setting } from 'obsidian';
import { DataCardsSettings } from '../models/settings';
import DataCardsPlugin from '../main';

/**
 * Settings tab for the DataCards plugin
 */
export class DataCardsSettingTab extends PluginSettingTab {
  plugin: DataCardsPlugin;

  constructor(app: App, plugin: DataCardsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'DataCards Settings' });

    // Preset settings
    containerEl.createEl('h3', { text: 'Preset Settings' });

    new Setting(containerEl)
      .setName('Default Preset')
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
    containerEl.createEl('h3', { text: 'Image Settings' });

    new Setting(containerEl)
      .setName('Default Image Property')
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
    containerEl.createEl('h3', { text: 'Display Settings' });

    new Setting(containerEl)
      .setName('Show Property Labels')
      .setDesc('Show labels for properties')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showLabels)
        .onChange(async (value) => {
          this.plugin.settings.showLabels = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Card Spacing')
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
      .setName('Enable Card Shadows')
      .setDesc('Add subtle shadows to cards for a more three-dimensional appearance')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableShadows)
        .onChange(async (value) => {
          this.plugin.settings.enableShadows = value;
          await this.plugin.saveSettings();
        }));
    
    // Card Content Settings
    containerEl.createEl('h3', { text: 'Card Content Settings' });
    
    new Setting(containerEl)
      .setName('Scrollable Properties')
      .setDesc('Enable scrolling for card properties when they exceed the content height (Note: Square and Compact presets are scrollable by default)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.scrollableProperties)
        .onChange(async (value) => {
          this.plugin.settings.scrollableProperties = value;
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('Content Height')
      .setDesc('Height of the scrollable content area (e.g., 200px)')
      .addText(text => text
        .setPlaceholder('200px')
        .setValue(this.plugin.settings.contentHeight)
        .onChange(async (value) => {
          this.plugin.settings.contentHeight = value || '200px';
          await this.plugin.saveSettings();
        }));
        
    // Formatting settings
    containerEl.createEl('h3', { text: 'Formatting Settings' });
    
    new Setting(containerEl)
      .setName('Default Date Format')
      .setDesc('Format for displaying dates (YYYY = year, MM = month, DD = day)')
      .addText(text => text
        .setPlaceholder('YYYY-MM-DD')
        .setValue(this.plugin.settings.defaultDateFormat)
        .onChange(async (value) => {
          this.plugin.settings.defaultDateFormat = value || 'YYYY-MM-DD';
          await this.plugin.saveSettings();
        }));
    
    // Mobile settings
    containerEl.createEl('h3', { text: 'Mobile Settings' });
    
    new Setting(containerEl)
      .setName('Mobile Preset')
      .setDesc('Preset to use on mobile devices (all presets default to 1 column on mobile)')
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
    
    // Mobile columns and image height are now controlled by presets
    // These settings have been removed from the UI to avoid confusion
    // All presets default to 1 column on mobile for optimal readability
    
    new Setting(containerEl)
      .setName('Mobile Scrollable Properties')
      .setDesc('Enable scrolling for card properties on mobile devices')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.mobileScrollableProperties)
        .onChange(async (value) => {
          this.plugin.settings.mobileScrollableProperties = value;
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('Mobile Content Height')
      .setDesc('Height of the scrollable content area on mobile devices')
      .addText(text => text
        .setPlaceholder('150px')
        .setValue(this.plugin.settings.mobileContentHeight)
        .onChange(async (value) => {
          this.plugin.settings.mobileContentHeight = value || '150px';
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('Force Mobile Mode')
      .setDesc('Force the plugin to use mobile settings even on desktop (for testing)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.forceMobileMode)
        .onChange(async (value) => {
          this.plugin.settings.forceMobileMode = value;
          await this.plugin.saveSettings();
        }));
    
    // Performance settings
    containerEl.createEl('h3', { text: 'Performance Settings' });
    
    new Setting(containerEl)
      .setName('Enable Lazy Loading')
      .setDesc('Only load images when they become visible (improves performance with many cards)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableLazyLoading)
        .onChange(async (value) => {
          this.plugin.settings.enableLazyLoading = value;
          await this.plugin.saveSettings();
        }));
        
    // Debug settings
    containerEl.createEl('h3', { text: 'Developer Settings' });
    
    new Setting(containerEl)
      .setName('Debug Mode')
      .setDesc('Enable debug logging (only use during development or troubleshooting)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.debugMode)
        .onChange(async (value) => {
          this.plugin.settings.debugMode = value;
          await this.plugin.saveSettings();
        }));

    // Help section
    containerEl.createEl('h3', { text: 'Help' });
    
    const helpText = containerEl.createEl('div');
    helpText.innerHTML = `
      <p><strong>Basic Usage:</strong><br>
      Use the <code>datacards</code> code block to create card layouts from Dataview queries.</p>
      
      <p><strong>Example:</strong></p>
      <pre><code>
\`\`\`datacards
TABLE title, author, rating, cover FROM #books
SORT rating DESC

// Settings
preset: grid
imageFit: contain
defaultDateFormat: YYYY
\`\`\`
      </code></pre>
      
      <p><strong>Important:</strong> You must explicitly include all properties you want to display in your Dataview query (including the image property).</p>
      
      <p><strong>Image Support:</strong><br>
      The plugin supports external URLs, vault images, and wiki links:<br>
      <code>cover: https://example.com/image.jpg</code> or <code>cover: [[path/to/image.jpg]]</code></p>     
    
      <p><strong>Tip:</strong> Data Cards works best with the Editor-Setting "Readable line length" disabled. </p><br>
      
      <p><a href="https://github.com/Sophokles187/data-cards" target="_blank" rel="noopener">View complete documentation and examples on GitHub</a></p>
    `;
  }
}
