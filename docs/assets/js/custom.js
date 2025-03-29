// Meeres-Dämmerung JavaScript for DataCards documentation

document.addEventListener('DOMContentLoaded', function() {
  console.log('DataCards documentation loaded with Meeres-Dämmerung theme');
  initMeeresDammerungTheme();
});

// Main initialization function
function initMeeresDammerungTheme() {
  // Add subtle animations and effects
  addSubtleEffects();
  
  // Add mobile navigation enhancements
  enhanceResponsiveNavigation();
  
  // Add scroll progress indicator
  addScrollProgress();
  
  // Add card and UI enhancements
  enhanceUI();
  
  // Fix coverpage background
  fixCoverPageBackground();
  
  // Add breadcrumb navigation
  addBreadcrumbNavigation();
  
  // Hook into Docsify's lifecycle for content-specific enhancements
  window.$docsify = window.$docsify || {};
  const originalDom = window.$docsify.plugins || [];
  
  window.$docsify.plugins = originalDom.concat(function(hook, vm) {
    hook.doneEach(function() {
      // Reapply all enhancements after content loads
      enhanceCodeBlocks();
      enhanceImages();
      addCardStyleToExamples();
      addAccessibilityFeatures();
      fixCoverPageBackground(); // Reapply coverpage fix after page changes
      
      // Make sure scrolling is enabled after content loads
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    });
    
    // Add fade transition between pages
    hook.beforeEach(function(content) {
      if (document.querySelector('.content')) {
        document.querySelector('.content').classList.add('fade-out');
      }
      return content;
    });
    
    hook.afterEach(function(html, next) {
      next(html);
      setTimeout(function() {
        if (document.querySelector('.content')) {
          document.querySelector('.content').classList.remove('fade-out');
        }
      }, 100);
    });
  });
}

// Add subtle animations and ambient effects
function addSubtleEffects() {
  // Add grain texture overlay (handled in CSS)
  
  // Add ambient glow elements
  const glowContainer = document.querySelector('body');
  if (glowContainer && !document.querySelector('.glow')) {
    const glow1 = document.createElement('div');
    glow1.className = 'glow glow-1';
    const glow2 = document.createElement('div');
    glow2.className = 'glow glow-2';
    
    glowContainer.appendChild(glow1);
    glowContainer.appendChild(glow2);
  }
  
  // Add ambient glow elements that follow mouse movement with throttling
  let ticking = false;
  document.addEventListener('mousemove', function(e) {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        moveGlowWithMouse(e);
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Add CSS class for fade-in animations - with a limit to avoid performance issues
  const elements = document.querySelectorAll('.markdown-section > *');
  elements.forEach((el, index) => {
    // Only apply to first 20 elements to avoid performance issues
    if (index < 20) {
      el.classList.add('fade-in');
    }
  });
}

// Function to move glow elements with mouse - extracted to improve performance
function moveGlowWithMouse(e) {
  const glowElements = document.querySelectorAll('.glow');
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  
  glowElements.forEach((glow, index) => {
    // Apply subtle parallax effect based on mouse position
    const speed = index === 0 ? 0.03 : 0.02;
    const offsetX = (mouseX - window.innerWidth / 2) * speed;
    const offsetY = (mouseY - window.innerHeight / 2) * speed;
    
    // Add transition for smoother movement
    glow.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
    glow.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    // Apply Meeres-Dämmerung theme colors
    if (index === 0) {
      glow.style.background = 'rgba(95, 122, 138, 0.3)';
    } else {
      glow.style.background = 'rgba(122, 147, 160, 0.25)';
    }
  });
}

// Enhance code blocks with styling and copy functionality
function enhanceCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre[data-lang]');
  
  codeBlocks.forEach(block => {
    // Remove any existing language labels added by plugins
    const existingLabels = block.querySelectorAll('.lang-label');
    existingLabels.forEach(label => label.remove());
    
    // Remove potential docsify-generated labels
    if (block.querySelector('span.docsify-copy-code-button + span')) {
      block.querySelector('span.docsify-copy-code-button + span').remove();
    }
    
    // Make sure code blocks have the proper styling
    block.style.background = 'rgba(10, 10, 10, 0.6)';
    block.style.backdropFilter = 'blur(10px)';
    block.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    
    // Add a slight hover effect
    block.addEventListener('mouseenter', function() {
      this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
      this.style.borderColor = 'rgba(95, 122, 138, 0.2)';
    });
    
    block.addEventListener('mouseleave', function() {
      this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
      this.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    });
    
    // Add code header with language
    if (!block.querySelector('.code-header') && block.dataset.lang) {
      const codeHeader = document.createElement('div');
      codeHeader.className = 'code-header';
      codeHeader.textContent = block.dataset.lang;
      block.appendChild(codeHeader);
    }
  });
}

// Add card styling to examples and enhance images
function enhanceImages() {
  const images = document.querySelectorAll('.markdown-section img:not(.emoji)');
  
  images.forEach(img => {
    // Make sure images have the proper styling
    img.style.borderRadius = 'var(--radius-medium)';
    img.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    
    // Add hover effect
    img.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.01)';
      this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
    });
    
    img.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    });
  });
}

// Add card styling to examples
function addCardStyleToExamples() {
  // Find example sections
  const exampleSections = document.querySelectorAll('h3, h4');
  
  exampleSections.forEach(heading => {
    if (heading.textContent.toLowerCase().includes('example') || 
        heading.textContent.toLowerCase().includes('card')) {
      
      // Find the next code block
      let nextElement = heading.nextElementSibling;
      while (nextElement && !nextElement.tagName.match(/^PRE$/i)) {
        nextElement = nextElement.nextElementSibling;
      }
      
      if (nextElement && nextElement.tagName.match(/^PRE$/i)) {
        // Create card container
        const card = document.createElement('div');
        card.className = 'card';
        
        // Create card header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        
        // Create card title
        const cardTitle = document.createElement('h3');
        cardTitle.className = 'card-title';
        
        // Add icon to card title
        const icon = document.createElement('i');
        icon.className = 'ph ph-code';
        cardTitle.appendChild(icon);
        
        // Add title text
        const titleText = document.createTextNode(heading.textContent);
        cardTitle.appendChild(titleText);
        
        // Add title to header
        cardHeader.appendChild(cardTitle);
        
        // Create card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Clone the code block
        const codeBlock = nextElement.cloneNode(true);
        
        // Add to card
        card.appendChild(cardHeader);
        cardBody.appendChild(codeBlock);
        card.appendChild(cardBody);
        
        // Replace the original code block
        nextElement.parentNode.replaceChild(card, nextElement);
        
        // Remove the original heading
        if (heading.parentNode) {
          heading.parentNode.removeChild(heading);
        }
      }
    }
  });
}

// Add scroll progress indicator
function addScrollProgress() {
  // Check if progress indicator already exists
  if (document.querySelector('.progress')) return;

  // Create progress container
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress';
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  
  progressContainer.appendChild(progressBar);
  document.body.appendChild(progressContainer);
  
  // Update progress on scroll - throttled for performance
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = window.scrollY;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        progressBar.style.width = progress + '%';
        ticking = false;
      });
      ticking = true;
    }
  });
}

// Enhance UI with card elements and buttons
function enhanceUI() {
  // Add tag styling to certain elements
  document.querySelectorAll('.tag, .label').forEach(el => {
    el.style.display = 'inline-block';
    el.style.padding = '5px 12px';
    el.style.borderRadius = 'var(--radius-small)';
    el.style.fontSize = '14px';
    el.style.fontWeight = '500';
    el.style.color = 'var(--accent-primary)';
    el.style.background = 'rgba(95, 122, 138, 0.05)';
    el.style.border = '1px solid rgba(95, 122, 138, 0.2)';
    el.style.marginRight = '8px';
    el.style.marginBottom = '8px';
  });
  
  // Add button styling
  document.querySelectorAll('.get-started-button, .button').forEach(el => {
    el.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
    el.style.color = 'white';
    el.style.borderRadius = '6px';
    el.style.padding = '10px 18px';
    el.style.display = 'inline-flex';
    el.style.alignItems = 'center';
    el.style.gap = '8px';
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    
    // Add hover effect
    el.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(95, 122, 138, 0.3)';
    });
    
    el.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
  });
  
  // Add secondary button styling
  document.querySelectorAll('.github-button, .button-secondary').forEach(el => {
    el.style.backgroundColor = 'rgba(29, 29, 34, 0.5)';
    el.style.color = 'var(--text-secondary)';
    el.style.border = '1px solid var(--border-primary)';
    
    // Add hover effect
    el.addEventListener('mouseenter', function() {
      this.style.backgroundColor = 'rgba(29, 29, 34, 0.7)';
      this.style.color = 'var(--text-primary)';
      this.style.borderColor = 'var(--border-secondary)';
      this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    });
    
    el.addEventListener('mouseleave', function() {
      this.style.backgroundColor = 'rgba(29, 29, 34, 0.5)';
      this.style.color = 'var(--text-secondary)';
      this.style.borderColor = 'var(--border-primary)';
      this.style.boxShadow = 'none';
    });
  });
  
  // Convert feature sections to feature cards grid
  const featureSections = document.querySelectorAll('h2');
  featureSections.forEach(heading => {
    if (heading.textContent.toLowerCase().includes('feature') || 
        heading.textContent.toLowerCase().includes('funktionen')) {
      
      // Find all h3 headings that follow this h2 until the next h2
      const features = [];
      let nextElement = heading.nextElementSibling;
      
      while (nextElement && nextElement.tagName !== 'H2') {
        if (nextElement.tagName === 'H3') {
          // Get the description paragraph
          let description = '';
          let descElement = nextElement.nextElementSibling;
          if (descElement && descElement.tagName === 'P') {
            description = descElement.textContent;
          }
          
          features.push({
            title: nextElement.textContent,
            description: description
          });
        }
        nextElement = nextElement.nextElementSibling;
      }
      
      // If we found features, create a feature grid
      if (features.length > 0) {
        const featureGrid = document.createElement('div');
        featureGrid.className = 'features-grid';
        
        features.forEach(feature => {
          const featureCard = document.createElement('div');
          featureCard.className = 'feature-card';
          
          const featureIcon = document.createElement('div');
          featureIcon.className = 'feature-icon';
          featureIcon.innerHTML = '<i class="ph ph-star"></i>';
          
          const featureTitle = document.createElement('h3');
          featureTitle.className = 'feature-title';
          featureTitle.textContent = feature.title;
          
          const featureDesc = document.createElement('p');
          featureDesc.className = 'feature-description';
          featureDesc.textContent = feature.description;
          
          featureCard.appendChild(featureIcon);
          featureCard.appendChild(featureTitle);
          featureCard.appendChild(featureDesc);
          
          featureGrid.appendChild(featureCard);
        });
        
        // Insert the feature grid after the heading
        heading.parentNode.insertBefore(featureGrid, heading.nextSibling);
      }
    }
  });
}

// Enhance mobile navigation
function enhanceResponsiveNavigation() {
  // Add mobile navigation toggle
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content');
  
  // Create mobile menu button if it doesn't exist
  if (!document.querySelector('.mobile-menu-button')) {
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-button';
    
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      mobileMenuButton.appendChild(span);
    }
    
    // Add click event
    mobileMenuButton.addEventListener('click', function() {
      document.body.classList.toggle('sidebar-mobile-open');
    });
    
    document.body.appendChild(mobileMenuButton);
    
    // Create backdrop for mobile
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    backdrop.addEventListener('click', function() {
      document.body.classList.remove('sidebar-mobile-open');
    });
    
    document.body.appendChild(backdrop);
  }
  
  // Create "Back to Top" button if it doesn't exist
  if (!document.querySelector('.scroll-to-top-button')) {
    const scrollToTopButton = document.createElement('button');
    scrollToTopButton.className = 'scroll-to-top-button';
    scrollToTopButton.innerHTML = '<i class="ph ph-arrow-up"></i>';
    scrollToTopButton.title = 'Back to top';
    
    scrollToTopButton.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.body.appendChild(scrollToTopButton);
    
    // Show button when scrolled down - throttled for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          if (window.scrollY > 300) {
            scrollToTopButton.classList.add('visible');
          } else {
            scrollToTopButton.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }
}

// Add accessibility features
function addAccessibilityFeatures() {
  // Add focus styles to all interactive elements
  document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
    // Remove existing event listeners first to prevent duplicates
    el.removeEventListener('focus', handleFocus);
    el.removeEventListener('blur', handleBlur);
    
    // Add new event listeners
    el.addEventListener('focus', handleFocus);
    el.addEventListener('blur', handleBlur);
  });
  
  // Ensure all images have alt text
  document.querySelectorAll('img').forEach(img => {
    if (!img.getAttribute('alt')) {
      img.setAttribute('alt', 'Image');
    }
  });
}

// Handle focus for accessibility
function handleFocus() {
  this.style.outline = '2px solid var(--accent-secondary)';
  this.style.outlineOffset = '2px';
}

// Handle blur for accessibility
function handleBlur() {
  this.style.outline = 'none';
}

// Fix coverpage background issues
function fixCoverPageBackground() {
  // Wait for cover background to be created
  setTimeout(() => {
    const coverBg = document.querySelector('.cover-background');
    if (coverBg) {
      // Force our background style
      coverBg.style.background = 'var(--background-primary)';
      coverBg.style.backgroundImage = 'none';
      
      // Add grain texture
      if (!coverBg.classList.contains('grain-added')) {
        const grainOverlay = document.createElement('div');
        grainOverlay.className = 'cover-grain-overlay';
        grainOverlay.style.position = 'absolute';
        grainOverlay.style.top = '0';
        grainOverlay.style.left = '0';
        grainOverlay.style.width = '100%';
        grainOverlay.style.height = '100%';
        grainOverlay.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E\")";
        grainOverlay.style.opacity = '0.12';
        grainOverlay.style.pointerEvents = 'none';
        grainOverlay.style.zIndex = '0';
        
        coverBg.appendChild(grainOverlay);
        coverBg.classList.add('grain-added');
      }
      
      // Add ambient glow to cover
      if (!coverBg.querySelector('.glow')) {
        const glow1 = document.createElement('div');
        glow1.className = 'glow glow-1';
        glow1.style.position = 'absolute';
        glow1.style.top = '20%';
        glow1.style.left = '5%';
        glow1.style.width = '300px';
        glow1.style.height = '300px';
        glow1.style.background = 'rgba(95, 122, 138, 0.3)';
        glow1.style.filter = 'blur(70px)';
        glow1.style.opacity = '0.3';
        glow1.style.zIndex = '0';
        
        const glow2 = document.createElement('div');
        glow2.className = 'glow glow-2';
        glow2.style.position = 'absolute';
        glow2.style.bottom = '10%';
        glow2.style.right = '5%';
        glow2.style.width = '200px';
        glow2.style.height = '200px';
        glow2.style.background = 'rgba(122, 147, 160, 0.25)';
        glow2.style.filter = 'blur(70px)';
        glow2.style.opacity = '0.3';
        glow2.style.zIndex = '0';
        
        coverBg.appendChild(glow1);
        coverBg.appendChild(glow2);
      }
    }
  }, 100);
}

// Add breadcrumb navigation
function addBreadcrumbNavigation() {
  // Only add breadcrumb if we're not on the cover page
  if (document.querySelector('.cover')) return;
  
  // Check if breadcrumb already exists
  if (document.querySelector('.breadcrumb')) return;
  
  // Get current page path
  const path = window.location.hash.substring(1);
  if (!path || path === '/') return;
  
  // Create breadcrumb container
  const breadcrumb = document.createElement('div');
  breadcrumb.className = 'breadcrumb';
  
  // Add home link
  const homeLink = document.createElement('a');
  homeLink.href = '#/';
  homeLink.textContent = 'DataCards';
  breadcrumb.appendChild(homeLink);
  
  // Add separator
  const separator = document.createElement('span');
  separator.className = 'separator';
  separator.textContent = '/';
  breadcrumb.appendChild(separator);
  
  // Get current page title
  const title = document.querySelector('.markdown-section h1')?.textContent || path;
  
  // Add current page
  const currentPage = document.createElement('span');
  currentPage.textContent = title;
  breadcrumb.appendChild(currentPage);
  
  // Insert breadcrumb at the top of the content
  const content = document.querySelector('.content');
  if (content && content.firstChild) {
    content.insertBefore(breadcrumb, content.firstChild);
  }
}
