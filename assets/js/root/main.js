// This is the main JavaScript file for the root-level pages.
// It primarily handles the mobile navigation functionality.

// Wait for the initial HTML document to be fully loaded and parsed before running the script.
// This ensures that all the DOM elements we want to select are available.
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the necessary DOM elements for the mobile navigation.
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle'); // The hamburger menu button.
    const siteNav = document.querySelector('.site-nav'); // The navigation menu itself.
    const body = document.querySelector('body'); // The body element, used to control page scrolling.

    // Only add the event listener if both the toggle button and the navigation menu exist on the page.
    // This acts as a safeguard and prevents errors on pages that might not have these elements.
    if (mobileNavToggle && siteNav) {
        // Add a 'click' event listener to the hamburger menu button.
        mobileNavToggle.addEventListener('click', () => {
            // When the button is clicked, toggle the 'active' class on the navigation menu.
            // The 'active' class is used in the CSS to make the menu visible.
            siteNav.classList.toggle('active');

            // Also, toggle the 'nav-open' class on the body element.
            // This class is used in the CSS to set 'overflow: hidden', which prevents the
            // main page from scrolling while the mobile navigation menu is open.
            body.classList.toggle('nav-open');
        });
    }
});
