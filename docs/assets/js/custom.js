// Sage Mist JavaScript for DataCards documentation

document.addEventListener('DOMContentLoaded', function() {
  console.log('DataCards documentation loaded with Sage Mist theme');
  initSageMistTheme();
});

// Main initialization function
function initSageMistTheme() {
  // Add subtle animations and effects
  addSubtleEffects();
  
  // Add mobile navigation enhancements
  enhanceResponsiveNavigation();
  
  // Add scroll progress indicator
  addScrollProgress();
  
  // Add card and UI enhancements
  enhanceUI();
  
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
  });
}

// Enhance code blocks with styling and copy functionality
function enhanceCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre[data-lang]');
  
  codeBlocks.forEach(block => {
    // Add language label (already handled by CSS)
    
    // Make sure code blocks have the proper styling
    block.style.background = 'var(--surface-gradient)';
    block.style.backdropFilter = 'blur(10px)';
    block.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    
    // Add a slight hover effect
    block.addEventListener('mouseenter', function() {
      this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
      this.style.borderColor = 'rgba(140, 172, 176, 0.2)';
    });
    
    block.addEventListener('mouseleave', function() {
      this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
      this.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    });
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
        
        // Create card title
        const cardTitle = document.createElement('div');
        cardTitle.className = 'card-title';
        cardTitle.textContent = heading.textContent;
        
        // Clone the code block
        const codeBlock = nextElement.cloneNode(true);
        
        // Add to card
        card.appendChild(cardTitle);
        card.appendChild(codeBlock);
        
        // Replace the original code block
        nextElement.parentNode.replaceChild(card, nextElement);
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
    el.style.padding = '4px 10px';
    el.style.borderRadius = 'var(--radius-small)';
    el.style.fontSize = '12px';
    el.style.fontWeight = '500';
    el.style.color = 'var(--accent-primary)';
    el.style.background = 'rgba(124, 155, 139, 0.05)';
    el.style.border = '1px solid rgba(124, 155, 139, 0.2)';
  });
  
  // Add button styling
  document.querySelectorAll('.get-started-button').forEach(el => {
    el.style.background = 'var(--accent-gradient)';
    el.style.color = 'white';
    el.style.borderRadius = 'var(--radius-medium)';
    el.style.padding = 'var(--spacing-default) var(--spacing-comfortable)';
    
    // Add hover effect
    el.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(124, 155, 139, 0.3)';
    });
    
    el.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
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
