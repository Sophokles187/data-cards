// Custom JavaScript for DataCards documentation

// Add dark mode toggle functionality if needed
document.addEventListener('DOMContentLoaded', function() {
  // You can add custom JavaScript functionality here
  console.log('DataCards documentation loaded');
});

// Add copy button to code blocks that don't have them
(function() {
  // This will be executed after Docsify renders the page
  const addCopyButtons = () => {
    const codeBlocks = document.querySelectorAll('pre[data-lang]:not(.has-copy-button)');
    codeBlocks.forEach(block => {
      block.classList.add('has-copy-button');
      // The actual copy button will be added by the docsify-copy-code plugin
    });
  };
  
  // Hook into Docsify's lifecycle events
  window.$docsify = window.$docsify || {};
  const originalDom = window.$docsify.plugins || [];
  
  window.$docsify.plugins = originalDom.concat(function(hook, vm) {
    hook.doneEach(addCopyButtons);
  });
})();