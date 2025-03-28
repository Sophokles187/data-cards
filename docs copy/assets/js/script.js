/**
 * DataCards Documentation
 * Main JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply theme based on preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        enableDarkMode();
    }
    
    // Toggle theme when button is clicked
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            if (body.classList.contains('dark-theme')) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });
    }
    
    // Toggle mobile menu
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            body.classList.toggle('mobile-menu-open');
        });
    }
    
    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            body.classList.remove('mobile-menu-open');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const sidebar = document.querySelector('.sidebar');
        const isClickInside = sidebar && (sidebar.contains(event.target) || (mobileMenuToggle && mobileMenuToggle.contains(event.target)));
        
        if (!isClickInside && body.classList.contains('mobile-menu-open')) {
            body.classList.remove('mobile-menu-open');
        }
    });
    
    // Mark current page as active in navigation
    markActiveNavItem();
    
    // Functions to enable/disable dark mode
    function enableDarkMode() {
        body.classList.add('dark-theme');
        if (moonIcon) moonIcon.style.display = 'none';
        if (sunIcon) sunIcon.style.display = 'block';
        try {
            localStorage.setItem('theme', 'dark');
        } catch (e) {
            console.warn('LocalStorage not available:', e);
        }
    }
    
    function disableDarkMode() {
        body.classList.remove('dark-theme');
        if (moonIcon) moonIcon.style.display = 'block';
        if (sunIcon) sunIcon.style.display = 'none';
        try {
            localStorage.setItem('theme', 'light');
        } catch (e) {
            console.warn('LocalStorage not available:', e);
        }
    }
    
    // Mark the current page in navigation
    function markActiveNavItem() {
        const currentPath = window.location.pathname;
        
        // Handle root path
        if (currentPath === '/' || currentPath.endsWith('/index.html')) {
            const homeLinks = document.querySelectorAll('.nav-link[href="/"], .nav-link[href="index.html"], .nav-link[href="./"]');
            homeLinks.forEach(link => link.classList.add('active'));
            return;
        }
        
        // Handle other pages
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (currentPath.endsWith(href) || currentPath.includes(href))) {
                link.classList.add('active');
            }
        });
    }
});
