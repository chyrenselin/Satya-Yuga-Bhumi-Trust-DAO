// This event listener ensures that the entire script runs only after the
// initial HTML document has been completely loaded and parsed.
document.addEventListener("DOMContentLoaded", () => {
    
    // --- GSAP SCROLL-TRIGGERED ANIMATIONS ---
    // 1. Register the ScrollTrigger plugin with GSAP to make it available for use.
    gsap.registerPlugin(ScrollTrigger);

    // 2. Animate sections on scroll.
    // Select all elements with the class ".reveal-animation" and loop through them.
    gsap.utils.toArray(".reveal-animation").forEach(section => {
        // Apply a "fade in and slide up" animation to each section.
        gsap.from(section, {
            opacity: 0, // Animate from completely transparent...
            y: 75, // ...and 75 pixels down from its final position.
            duration: 1.2, // The animation should last 1.2 seconds.
            ease: "power3.out", // A smooth easing function for a professional feel.
            
            // Configure the scroll trigger for this animation.
            scrollTrigger: {
                trigger: section, // The animation starts when this 'section' element enters the viewport.
                start: "top 85%", // Trigger the animation when the top of the element is 85% down from the top of the viewport.
                // Defines the actions for different trigger points.
                // "play none none none" means:
                // - onEnter: play the animation
                // - onLeave: do nothing
                // - onEnterBack: do nothing
                // - onLeaveBack: do nothing
                // This ensures the animation only runs once when scrolling down.
                toggleActions: "play none none none"
            }
        });
    });

    // --- PLEDGE FORM OVERLAY LOGIC ---
    // Get references to the necessary DOM elements for the pledge modal.
    const openBtn = document.getElementById('open-pledge-btn');
    const closeBtn = document.getElementById('close-pledge-btn');
    const pledgeOverlay = document.getElementById('pledge-overlay');

    /**
     * Shows the pledge form overlay.
     */
    function showPledgeOverlay() {
        // Adds the 'is-visible' class, which triggers the fade-in animation defined in the CSS.
        pledgeOverlay.classList.add('is-visible');
        // Prevents the main page content from scrolling while the overlay is open.
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hides the pledge form overlay.
     */
    function hidePledgeOverlay() {
        // Removes the 'is-visible' class, triggering the fade-out animation.
        pledgeOverlay.classList.remove('is-visible');
        // Resets the body's overflow style to allow scrolling again.
        document.body.style.overflow = '';
    }

    // Only add event listeners if all the required elements were found on the page.
    if (openBtn && closeBtn && pledgeOverlay) {
        // When the open button is clicked, show the overlay.
        openBtn.addEventListener('click', showPledgeOverlay);
        // When the close button is clicked, hide the overlay.
        closeBtn.addEventListener('click', hidePledgeOverlay);

        // Add an event listener to the whole document to listen for key presses.
        document.addEventListener('keydown', (event) => {
            // If the user presses the 'Escape' key while the overlay is visible, hide it.
            if (event.key === 'Escape' && pledgeOverlay.classList.contains('is-visible')) {
                hidePledgeOverlay();
            }
        });
    }
});