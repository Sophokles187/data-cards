// Enhanced JavaScript for DataCards documentation

document.addEventListener('DOMContentLoaded', function() {
  console.log('DataCards documentation loaded');
  initDataCardsDocs();
  
  // Add a loading indicator to the DOM
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'content-loading-indicator';
  document.body.appendChild(loadingIndicator);
  
  // Add loading state during navigation
  window.addEventListener('beforeunload', function() {
    document.body.classList.add('loading');
  });
  
  // Listen for Docsify route changes
  window.$docsify = window.$docsify || {};
  const originalHook = window.$docsify.plugins || [];
  
  window.$docsify.plugins = originalHook.concat(function(hook, vm) {
    hook.beforeEach(function(content) {
      document.body.classList.add('loading');
      return content;
    });
    
    hook.afterEach(function(html, next) {
      next(html);
      setTimeout(function() {
        document.body.classList.remove('loading');
      }, 200);
    });
  });
});

// Main initialization function
function initDataCardsDocs() {
  // Add classes and attributes after Docsify renders content
  const enhanceDOM = () => {
    // Add code block titles
    addCodeBlockTitles();
    
    // Add card classes to specific content
    enhanceExamples();
    
    // Add feature grid classes
    createFeatureGrids();
    
    // Add anchor links to headings
    addHeadingAnchors();
    
    // Add syntax highlighting for datacards code blocks
    highlightDatacardsBlocks();
    
    // Initialize image zoom behavior
    initImageZoom();
    
    // Initialize the tab system for sections
    initTabSystem();
    
    // Add responsive navigation
    enhanceResponsiveNavigation();
  };

  // Hook into Docsify's lifecycle
  window.$docsify = window.$docsify || {};
  const originalDom = window.$docsify.plugins || [];
  
  window.$docsify.plugins = originalDom.concat(function(hook, vm) {
    hook.doneEach(enhanceDOM);
  });
}

// Add titles to code blocks
function addCodeBlockTitles() {
  const codeBlocks = document.querySelectorAll('pre[data-lang]:not(.has-title)');
  
  codeBlocks.forEach(block => {
    const language = block.getAttribute('data-lang');
    if (!language || language === 'null') return;
    
    // Skip if title already exists
    if (block.previousElementSibling && block.previousElementSibling.classList.contains('code-block-title')) {
      return;
    }
    
    // Create title element
    const titleDiv = document.createElement('div');
    titleDiv.className = 'code-block-title';
    
    // Set appropriate title based on language
    let title = '';
    switch(language.toLowerCase()) {
      case 'datacards':
        title = 'DataCards Query';
        break;
      case 'javascript':
      case 'js':
        title = 'JavaScript';
        break;
      case 'json':
        title = 'JSON';
        break;
      case 'markdown':
      case 'md':
        title = 'Markdown';
        break;
      case 'yaml':
        title = 'YAML';
        break;
      case 'css':
        title = 'CSS';
        break;
      case 'html':
        title = 'HTML';
        break;
      default:
        title = language.charAt(0).toUpperCase() + language.slice(1);
    }
    
    titleDiv.textContent = title;
    
    // Insert title before code block
    block.parentNode.insertBefore(titleDiv, block);
    block.classList.add('has-title');
  });
}

// Add card styling to examples
function enhanceExamples() {
  // Find blockquotes that contain notes
  const noteBlocks = document.querySelectorAll('blockquote:not(.note)');
  noteBlocks.forEach(block => {
    const firstParagraph = block.querySelector('p:first-child');
    if (firstParagraph && firstParagraph.textContent.trim().startsWith('**Note:**')) {
      block.classList.add('note');
    }
  });
  
  // Find and enhance example sections
  const exampleHeadings = document.querySelectorAll('h3');
  exampleHeadings.forEach(heading => {
    if (heading.textContent.toLowerCase().includes('preset') || 
        heading.textContent.toLowerCase().includes('example')) {
      
      // Find the content after the heading until the next heading
      let content = [];
      let sibling = heading.nextElementSibling;
      
      while (sibling && !sibling.tagName.match(/^H[1-6]$/)) {
        content.push(sibling);
        sibling = sibling.nextElementSibling;
      }
      
      if (content.length > 0) {
        // Create example wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'datacards-example';
        
        // Add title
        const title = document.createElement('div');
        title.className = 'datacards-example-title';
        title.textContent = heading.textContent;
        wrapper.appendChild(title);
        
        // Move content into wrapper
        content.forEach(element => {
          wrapper.appendChild(element.cloneNode(true));
        });
        
        // Replace original content with new wrapper
        heading.insertAdjacentElement('afterend', wrapper);
        
        // Remove original content
        content.forEach(element => {
          element.remove();
        });
        
        // Hide original heading
        heading.style.display = 'none';
      }
    }
  });
}

// Create feature grids for certain sections
function createFeatureGrids() {
  // Look for feature tables and convert them to grid
  const featureTables = document.querySelectorAll('table');
  
  featureTables.forEach(table => {
    const tableHeading = table.querySelector('thead');
    if (tableHeading && tableHeading.textContent.toLowerCase().includes('feature')) {
      // This is likely a feature table
      
      // Find the table's parent
      const tableParent = table.parentNode;
      
      // Create grid container
      const gridContainer = document.createElement('div');
      gridContainer.className = 'feature-grid';
      
      // Process each row (except header)
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          // Create feature card
          const card = document.createElement('div');
          card.className = 'feature-card';
          
          // Add title
          const title = document.createElement('h3');
          title.textContent = cells[0].textContent.trim();
          card.appendChild(title);
          
          // Add description
          const description = document.createElement('p');
          description.innerHTML = cells[1].innerHTML;
          card.appendChild(description);
          
          // Add to grid
          gridContainer.appendChild(card);
        }
      });
      
      // Replace table with grid
      tableParent.replaceChild(gridContainer, table);
    }
  });
}

// Add anchor links to headings for easier navigation
function addHeadingAnchors() {
  const headings = document.querySelectorAll('.markdown-section h2, .markdown-section h3, .markdown-section h4');
  
  headings.forEach(heading => {
    // Skip if already has anchor
    if (heading.querySelector('.anchor')) return;
    
    // Create anchor
    const anchor = document.createElement('a');
    const id = heading.id || heading.textContent.toLowerCase().replace(/[^\w]+/g, '-');
    
    heading.id = id;
    anchor.className = 'anchor';
    anchor.href = `#${id}`;
    anchor.textContent = '#';
    anchor.style.opacity = '0';
    anchor.style.marginLeft = '0.5em';
    anchor.style.textDecoration = 'none';
    
    heading.appendChild(anchor);
    
    // Show on hover
    heading.addEventListener('mouseenter', () => {
      anchor.style.opacity = '0.5';
    });
    
    heading.addEventListener('mouseleave', () => {
      anchor.style.opacity = '0';
    });
  });
}

// Add custom syntax highlighting for datacards code blocks
function highlightDatacardsBlocks() {
  // Check if Prism is available
  if (typeof Prism === 'undefined') return;
  
  // Define DataCards grammar if not already defined
  if (!Prism.languages.datacards) {
    Prism.languages.datacards = Prism.languages.extend('markdown', {
      'property': {
        pattern: /^\s*\w+\s*:/m,
        inside: {
          'punctuation': /:/
        }
      },
      'settings-comment': {
        pattern: /\/\/\s*Settings.*/,
        greedy: true,
        alias: 'comment'
      },
      'dataview-keyword': {
        pattern: /\b(TABLE|FROM|WHERE|SORT|GROUP BY|LIMIT|FLATTEN)\b/,
        alias: 'keyword'
      }
    });
  }
  
  // Apply highlighting
  const codeBlocks = document.querySelectorAll('pre[data-lang="datacards"] code');
  codeBlocks.forEach(block => {
    if (!block.className.includes('language-datacards')) {
      block.className = 'language-datacards';
      Prism.highlightElement(block);
    }
  });
}

// Initialize image zoom behavior (using the built-in zoom plugin)
function initImageZoom() {
  const images = document.querySelectorAll('.markdown-section img:not(.no-zoom)');
  
  images.forEach(img => {
    // Add zoom class if not already present
    if (!img.classList.contains('zoom')) {
      img.classList.add('zoom');
    }
    
    // Add loading animation and fade-in effect
    if (!img.hasAttribute('data-loading-handled')) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
      
      img.setAttribute('data-loading-handled', 'true');
    }
  });
}

// Create a function to handle tab system if needed
function initTabSystem() {
  // Find appropriate headers that should be converted to tabs
  const tabSections = document.querySelectorAll('.markdown-section h2, .markdown-section h3');
  
  tabSections.forEach(section => {
    // Only convert headers with specific content
    if (section.textContent.toLowerCase().includes('preset') || 
        section.textContent.toLowerCase().includes('example') ||
        section.textContent.toLowerCase().includes('type')) {
      
      // Find siblings that would be part of this tab group
      let siblingElements = [];
      let tabHeaders = [];
      let currentElement = section.nextElementSibling;
      let nextSectionFound = false;
      
      // Collect all content until next section header of same or higher level
      while (currentElement && !nextSectionFound) {
        if (currentElement.tagName.match(/^H[1-3]$/)) {
          if (parseInt(currentElement.tagName[1]) <= parseInt(section.tagName[1])) {
            nextSectionFound = true;
          } else {
            // It's a subsection, add it as a tab header
            tabHeaders.push(currentElement);
            currentElement = currentElement.nextElementSibling;
          }
        } else {
          siblingElements.push(currentElement);
          currentElement = currentElement.nextElementSibling;
        }
      }
      
      // Only create tabs if there are reasonable subsections
      if (tabHeaders.length >= 2) {
        // Create tab container
        const tabContainer = document.createElement('div');
        tabContainer.className = 'tabs';
        
        // Add radio buttons and labels for each tab
        tabHeaders.forEach((header, index) => {
          const tabId = `tab-${section.textContent.toLowerCase().replace(/[^\w]+/g, '-')}-${index}`;
          
          // Create radio button
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = `tabs-${section.textContent.toLowerCase().replace(/[^\w]+/g, '-')}`;
          radio.id = tabId;
          if (index === 0) radio.checked = true;
          tabContainer.appendChild(radio);
          
          // Create label
          const label = document.createElement('label');
          label.setAttribute('for', tabId);
          label.textContent = header.textContent;
          tabContainer.appendChild(label);
          
          // Create tab content div
          const tabContent = document.createElement('div');
          tabContent.className = 'tab';
          
          // Move content into tab
          let currentTab = header.nextElementSibling;
          let reachedNextHeader = false;
          
          while (currentTab && !reachedNextHeader) {
            if (currentTab.tagName.match(/^H[1-6]$/)) {
              reachedNextHeader = true;
            } else {
              const clone = currentTab.cloneNode(true);
              tabContent.appendChild(clone);
              currentTab = currentTab.nextElementSibling;
            }
          }
          
          tabContainer.appendChild(tabContent);
        });
        
        // Insert tab container after the main section heading
        section.insertAdjacentElement('afterend', tabContainer);
        
        // Hide original headers and content
        tabHeaders.forEach(header => {
          header.style.display = 'none';
        });
        
        siblingElements.forEach(element => {
          element.style.display = 'none';
        });
      }
    }
  });
}

// Function to handle responsive navigation and mobile-friendly enhancements
function enhanceResponsiveNavigation() {
  // Add a mobile menu toggle button
  const addMobileMenuButton = () => {
    if (document.querySelector('.mobile-menu-button')) return;
    
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    const button = document.createElement('button');
    button.className = 'mobile-menu-button';
    button.innerHTML = '<span></span><span></span><span></span>';
    button.setAttribute('aria-label', 'Toggle Menu');
    button.style.display = 'none'; // Hide by default, show in media query
    
    button.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-mobile-open');
    });
    
    document.body.appendChild(button);
    
    // Add a backdrop for mobile
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    backdrop.addEventListener('click', () => {
      document.body.classList.remove('sidebar-mobile-open');
    });
    document.body.appendChild(backdrop);
  };
  
  // Add a scroll to top button
  const addScrollToTopButton = () => {
    if (document.querySelector('.scroll-to-top-button')) return;
    
    const button = document.createElement('button');
    button.className = 'scroll-to-top-button';
    button.innerHTML = '↑';
    button.setAttribute('aria-label', 'Scroll to top');
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Only show when scrolled down
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
    });
    
    document.body.appendChild(button);
  };
  
  // Add progress bar for long articles
  const addScrollProgressBar = () => {
    if (document.querySelector('.scroll-progress')) return;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    });
  };
  
  // Execute enhancements
  addMobileMenuButton();
  addScrollToTopButton();
  addScrollProgressBar();
}
