/**
 * @file navigation.js
 * @description This file handles all navigation-related functionality, including smooth scrolling for anchor links,
 * the skip link for accessibility, and dynamically updating the active state of the Table of Contents (ToC)
 * as the user scrolls through the page.
 */

/**
 * @function scrollToElement
 * @description Scrolls to a specified element on the page with a smooth animation.
 * It also temporarily sets focus to the target element for improved accessibility.
 * @param {string} elementId - The ID of the element to scroll to.
 * @param {string} [blockPosition='start'] - The vertical alignment of the element after scrolling.
 */
function scrollToElement(elementId, blockPosition = 'start') {
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: blockPosition
        });
        // For accessibility, temporarily set focus to the scrolled-to element.
        const oldTabIndex = targetElement.getAttribute('tabindex');
        if (oldTabIndex === null) { // Only add tabindex if it wasn't there before.
            targetElement.setAttribute('tabindex', -1);
            targetElement.addEventListener('blur', () => {
                if (targetElement.getAttribute('tabindex') === '-1') {
                    targetElement.removeAttribute('tabindex');
                }
            }, { once: true });
        }
        targetElement.focus({ preventScroll: true }); // preventScroll avoids jarring jumps on focus.
    } else {
        console.warn(`Element with ID "${elementId}" not found for scrolling.`);
    }
}


/**
 * @function enableSmoothScroll
 * @description Attaches click event listeners to all links matching the selector to enable smooth scrolling.
 * @param {string} selector - The CSS selector for the links to apply smooth scrolling to.
 */
function enableSmoothScroll(selector) {
    const links = document.querySelectorAll(selector);
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                if (targetId) {
                    scrollToElement(targetId);
                } else if (href === "#") { // Handles links that are just "#".
                     window.scrollTo({ top: 0, behavior: 'smooth'});
                     // For "back to top" links, the browser typically handles focus management well.
                }
            }
        });
    });
}

/**
 * @function initSkipLink
 * @description Initializes the skip link, which allows keyboard users to bypass the header and jump to the main content.
 */
function initSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');
    if (skipLink && mainContent) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToElement('main-content');
        });
         console.log('Skip link initialized.');
    } else {
        if (!skipLink) console.warn("Skip link element not found.");
        if (!mainContent) console.warn("Main content element not found for skip link.");
    }
}

/**
 * @function initTocActiveState
 * @description Initializes the logic for highlighting the active link in the Table of Contents (ToC)
 * based on the user's scroll position.
 */
function initTocActiveState() {
    const tocLinks = document.querySelectorAll('.toc-navigation .toc-link');
    const sections = [];
    tocLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            const section = document.getElementById(targetId);
            if (section) {
                // Pre-calculates the top position of each section for performance.
                sections.push({link: link, section: section, top: section.getBoundingClientRect().top + window.scrollY});
            } else {
                console.warn(`Section with ID "${targetId}" not found for TOC link:`, link);
            }
        } else {
            console.warn(`TOC link has invalid href:`, link);
        }
    });

    if(sections.length === 0) {
        console.log('No valid sections found for TOC active state. TOC navigation may not work.');
        // If no sections are found, the ToC is hidden.
        const tocNav = document.querySelector('.toc-navigation');
        if(tocNav) tocNav.style.display = 'none';
        return;
    }

    let lastActiveLink = null;
    let lastScrollY = 0;
    let ticking = false;

    /**
     * @function updateActiveLink
     * @description This function is called on scroll to determine which ToC link should be active.
     * It uses a threshold-based approach to identify the current section in the viewport.
     */
    const updateActiveLink = () => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
         // Determines the scroll direction for more accurate section detection.
        const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
        lastScrollY = scrollY;

        // A section is considered "active" when it is within the top 30% of the viewport.
        const threshold = viewportHeight * 0.30;

        let currentlyActive = null;

         // Processes sections in the direction of the scroll for better accuracy.
        const orderedSections = scrollDirection === 'down' ? sections : sections.slice().reverse();

        for (const item of orderedSections) {
            const sectionTop = item.section.getBoundingClientRect().top + scrollY;
            const sectionBottom = sectionTop + item.section.offsetHeight;

             // A section is active if its top is above the threshold and its bottom is below it.
             if (sectionTop <= scrollY + threshold && sectionBottom > scrollY + threshold) {
                 currentlyActive = item.link;
                 break; // The first matching section is considered active.
             }
         }

         // Fallback logic for when no section is perfectly within the threshold (e.g., at the very top or bottom of the page).
         if (!currentlyActive) {
             // If near the top, the first section is activated.
             if (sections.length > 0 && scrollY < sections[0].top + threshold) {
                 currentlyActive = sections[0].link;
             } else if (sections.length > 0 && scrollY + viewportHeight > sections[sections.length - 1].section.offsetTop + sections[sections.length - 1].section.offsetHeight * 0.8) { // If near the bottom.
                 currentlyActive = sections[sections.length - 1].link;
             } else {
                  // Finds the closest section that is above the viewport's top.
                  let closestSection = null;
                  let minDistanceFromViewportTop = Infinity;
                  sections.forEach(item => {
                       const distanceFromTop = item.section.getBoundingClientRect().top;
                       if (distanceFromTop <= threshold) {
                           const absoluteDistanceFromTop = Math.abs(distanceFromTop - threshold);
                           if (absoluteDistanceFromTop < minDistanceFromViewportTop) {
                                minDistanceFromViewportTop = absoluteDistanceFromTop;
                                closestSection = item;
                           }
                       }
                   });

                  if(closestSection) currentlyActive = closestSection.link;
                  // This handles cases where scrolling between sections might not trigger the main logic.

             }
         }


        if (currentlyActive && currentlyActive !== lastActiveLink) {
            // Updates the active class on the ToC links.
            if (lastActiveLink) lastActiveLink.classList.remove('active');
            currentlyActive.classList.add('active');
            lastActiveLink = currentlyActive;
        } else if (!currentlyActive && lastActiveLink) {
             // This logic prevents the active link from deactivating while its section is still visible.
             const lastActiveSection = sections.find(item => item.link === lastActiveLink)?.section;
             if (lastActiveSection) {
                 const rect = lastActiveSection.getBoundingClientRect();
                 // If the section is still partially in the viewport, keep it active.
                 if (rect.bottom > 0 && rect.top < viewportHeight) {
                     currentlyActive = lastActiveLink;
                 } else if (scrollY <= sections[0].top + threshold / 2) { // If scrolled back to the top.
                     if(lastActiveLink) lastActiveLink.classList.remove('active');
                      if(sections.length > 0) {
                        sections[0].link.classList.add('active');
                        lastActiveLink = sections[0].link;
                       }
                 } else {
                     // If the section is completely out of view, deactivate the link.
                     if(lastActiveLink) lastActiveLink.classList.remove('active');
                     lastActiveLink = null;
                 }
             }
        } else if (!currentlyActive && !lastActiveLink && sections.length > 0 && scrollY <= sections[0].top + threshold) {
             // Sets the initial active link on page load.
             sections[0].link.classList.add('active');
             lastActiveLink = sections[0].link;
        }


        ticking = false; // Resets the ticking flag for the next animation frame.
    };

    /**
     * @function requestTick
     * @description Throttles the `updateActiveLink` function using `requestAnimationFrame` to improve performance during scroll events.
     */
    const requestTick = () => {
        if (!ticking) {
            requestAnimationFrame(updateActiveLink);
            ticking = true;
        }
    };

    // Attaches the throttled update function to the scroll event.
    window.addEventListener('scroll', requestTick, { passive: true });
    // Sets the initial active state on page load.
    updateActiveLink();

    console.log('TOC active state tracking initialized.');

}
