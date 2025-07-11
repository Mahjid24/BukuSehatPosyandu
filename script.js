
const pagesContainer = document.getElementById('pagesContainer');
const navDotsContainer = document.getElementById('navDots');
const progressBar = document.getElementById('progressBar');
const currentPageNum = document.getElementById('currentPageNum');
const totalPages = document.getElementById('totalPages');

const pages = document.querySelectorAll('.page');
const numPages = pages.length;
let currentPage = 0;

// Update total pages
totalPages.textContent = numPages;

// Create navigation dots
for (let i = 0; i < numPages; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot', 'w-2', 'h-2', 'bg-gray-400', 'rounded-full', 'cursor-pointer');
    dot.addEventListener('click', () => goToPage(i));
    navDotsContainer.appendChild(dot);
}
const dots = navDotsContainer.querySelectorAll('.dot');

function updateNavControls(pageNumber) {
    currentPage = pageNumber;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPage);
    });

    // Update progress bar
    const progressPercentage = ((currentPage + 1) / numPages) * 100;
    progressBar.style.width = progressPercentage + '%';

    // Update page counter
    currentPageNum.textContent = currentPage + 1;
}

function goToPage(pageNumber) {
    if (pageNumber < 0 || pageNumber >= numPages) return;
    
    // Smooth scroll to target page
    pagesContainer.scrollTo({
        left: pageNumber * pagesContainer.clientWidth,
        behavior: 'smooth'
    });
}

// Touch/swipe support for mobile
let startX = 0;
let startY = 0;
let isDragging = false;

pagesContainer.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
}, { passive: true });

pagesContainer.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(startX - currentX);
    const diffY = Math.abs(startY - currentY);
    
    // If horizontal swipe is more dominant than vertical, prevent scroll
    if (diffX > diffY && diffX > 10) {
        e.preventDefault();
    }
}, { passive: false });

pagesContainer.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = startX - endX;
    const diffY = Math.abs(startY - endY);
    
    // Only trigger page change if horizontal swipe is dominant and sufficient
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
        if (diffX > 0) {
            goToPage(currentPage + 1); // Swipe left - next page
        } else {
            goToPage(currentPage - 1); // Swipe right - prev page
        }
    }
});

// Mouse support for desktop
let mouseStartX = 0;
let isMouseDragging = false;

pagesContainer.addEventListener('mousedown', (e) => {
    mouseStartX = e.clientX;
    isMouseDragging = true;
    pagesContainer.style.cursor = 'grabbing';
});

pagesContainer.addEventListener('mousemove', (e) => {
    if (!isMouseDragging) return;
    e.preventDefault();
});

pagesContainer.addEventListener('mouseup', (e) => {
    if (!isMouseDragging) return;
    isMouseDragging = false;
    pagesContainer.style.cursor = 'grab';
    
    const endX = e.clientX;
    const diffX = mouseStartX - endX;
    
    if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
            goToPage(currentPage + 1);
        } else {
            goToPage(currentPage - 1);
        }
    }
});

pagesContainer.addEventListener('mouseleave', () => {
    isMouseDragging = false;
    pagesContainer.style.cursor = 'grab';
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPage(currentPage - 1);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToPage(currentPage + 1);
    } else if (e.key === 'Home') {
        e.preventDefault();
        goToPage(0);
    } else if (e.key === 'End') {
        e.preventDefault();
        goToPage(numPages - 1);
    }
});

// Intersection Observer for page transitions and visibility
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const pageElement = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            pageElement.classList.add('is-visible');
            const pageIndex = Array.from(pages).indexOf(pageElement);
            updateNavControls(pageIndex);
        } else {
            pageElement.classList.remove('is-visible');
        }
    });
}, {
    root: pagesContainer,
    threshold: [0, 0.5, 1],
    rootMargin: '0px'
});

// Observe all pages
pages.forEach(page => {
    observer.observe(page);
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate position after resize
        goToPage(currentPage);
    }, 100);
});

// Prevent context menu on long press for better mobile experience
pagesContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Initialize the first page
updateNavControls(0);

// Add smooth scrolling behavior
pagesContainer.style.scrollBehavior = 'smooth';

// Performance optimization: lazy load content
const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const page = entry.target;
            page.classList.add('loaded');
        }
    });
}, {
    rootMargin: '100px'
});

pages.forEach(page => {
    lazyLoadObserver.observe(page);
});

// Accessibility improvements
dots.forEach((dot, index) => {
    dot.setAttribute('aria-label', `Pergi ke halaman ${index + 1}`);
    dot.setAttribute('role', 'button');
    dot.setAttribute('tabindex', index === currentPage ? '0' : '-1');
});

// Update ARIA labels
function updateAriaLabels() {
    document.body.setAttribute('aria-label', `Halaman ${currentPage + 1} dari ${numPages}`);
    
    dots.forEach((dot, index) => {
        dot.setAttribute('aria-label', `Pergi ke halaman ${index + 1}`);
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', index === currentPage ? '0' : '-1');
    });
}

// Call updateAriaLabels when page changes
const originalUpdateNavControls = updateNavControls;
updateNavControls = function(pageNumber) {
    originalUpdateNavControls(pageNumber);
    updateAriaLabels();
};

// Initialize accessibility
updateAriaLabels();

// Add focus management for keyboard navigation
dots.forEach((dot, index) => {
    dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToPage(index);
        }
    });
});
