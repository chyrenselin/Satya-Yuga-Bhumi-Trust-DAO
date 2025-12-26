/**
 * @file main.js
 * @description This is the main JavaScript file for the Vishwa Samvidhan page.
 * It handles the initialization of various components, including smooth scrolling, table of contents,
 * the Google Translate widget, and the background anthem. It also sets up accessibility features
 * and provides helpful console warnings for developers.
 */

(function() {
    'use strict';

    /**
     * @function understandPrincipalsAndPlayAnthem
     * @description This function is intended to handle the logic for "understanding principles" and playing the anthem.
     * Currently, it triggers the click event on the start button.
     */
    function understandPrincipalsAndPlayAnthem() {
        // This function is a placeholder for logic related to "understanding principles."
        // For now, it plays the anthem by programmatically clicking the start button.
        const startButton = document.getElementById('startJourneyBtn');
        if (startButton && typeof startButton.onclick === 'function') {
            startButton.onclick();
        }
    }

    /**
     * @function stopAnthem
     * @description This function stops the anthem by triggering the click event on the stop button.
     */
    function stopAnthem() {
        const stopButton = document.getElementById('stopMusicBtn');
        if (stopButton && typeof stopButton.onclick === 'function') {
            stopButton.onclick();
        }
    }

    // Enhance accessibility by indicating that JavaScript is enabled.
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js-enabled');

    /**
     * @event DOMContentLoaded
     * @description This event fires when the initial HTML document has been completely loaded and parsed.
     * It initializes all the main functionalities of the page.
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize core functionalities.
        initSkipLink();
        enableSmoothScroll('.primary-navigation a[href^="#"]');
        enableSmoothScroll('.toc-navigation a.toc-link[href^="#"]');
        enableSmoothScroll('a.back-to-top-link[href^="#"]');
        initTocActiveState();
        initLivingArchiveDetailsLink();
        setPrintDate(); // Sets the CSS variable for the print date.

        const translateBtnConst = document.getElementById('translateBtn');
        const translateWidgetDivConst = document.getElementById('google_translate_element');

        if (translateBtnConst) {
            // Set up ARIA attributes for accessibility.
            translateBtnConst.setAttribute('aria-controls', 'google_translate_element');
            translateBtnConst.setAttribute('aria-expanded', 'false'); // The widget is hidden by default.

            // Set the initial button text based on the screen size.
            translateBtnConst.innerHTML = getTranslateButtonText('show');
            translateBtnConst.disabled = false; // Ensures the button is enabled initially.

            // Add a resize event listener to update the button text on window resize.
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                     // Only update the text if the button is not in a loading, error, or hide state.
                     if (!translateBtnConst.disabled && !translateBtnConst.innerHTML.includes('<span class="emoji-sandclock">') && !translateBtnConst.innerHTML.includes(getTranslateButtonText('hide').split('<span')[0].trim())) {
                         const currentText = translateBtnConst.innerHTML;
                         const newText = getTranslateButtonText('show');
                         // Avoids unnecessary DOM updates if the text has not changed.
                         if (currentText !== newText) {
                            console.log('Window resized, updating translate button text.');
                            translateBtnConst.innerHTML = newText;
                         }
                     }
                     // If the widget is visible, the "hide" button text should also be responsive.
                     if (!translateBtnConst.disabled && translateBtnConst.innerHTML.includes(getTranslateButtonText('hide').split('<span')[0].trim())) {
                         const newHideText = getTranslateButtonText('hide');
                          if (translateBtnConst.innerHTML !== newHideText) {
                            console.log('Window resized, updating hide translation button text.');
                            translateBtnConst.innerHTML = newHideText;
                         }
                     }
                }, 100); // Debounces the resize event to improve performance.
            }, { passive: true });


             console.log('Translate button initialized.');
        } else {
            console.warn('#translateBtn not found on DOMContentLoaded.');
        }
        if (translateWidgetDivConst) {
            // Hides the translate widget by default.
            translateWidgetDivConst.style.display = 'none';
            translateWidgetDivConst.setAttribute('aria-hidden', 'true');
             translateWidgetDivConst.classList.add('google-translate-hidden');
             console.log('Translate widget div initialized to hidden state.');
        } else {
            console.warn('#google_translate_element not found on DOMContentLoaded.');
            // If the widget container is missing, the button is disabled and shows an error.
            if(translateBtnConst) {
               translateBtnConst.disabled = true;
               translateBtnConst.innerHTML = getTranslateButtonText('divMissingError');
               translateBtnConst.setAttribute('aria-expanded', 'false');
               console.error('Translate button disabled due to missing widget div.');
           }
        }

        const footerTranslateLink = document.getElementById('footer-translate-link-dummy');
        if(footerTranslateLink && translateBtnConst){
            // Adds a click event listener to the footer translate link to trigger the main translate button.
            footerTranslateLink.addEventListener('click', (e)=>{
                e.preventDefault();
                translateBtnConst.click();
                // Scrolls the translate button into view for better user experience.
                setTimeout(() => {
                    translateBtnConst.scrollIntoView({behavior: 'smooth', block: 'center'});
                }, 50); // A small delay to ensure the click event is processed first.
            });
             console.log('Footer translate link initialized.');
        } else {
            if (!footerTranslateLink) console.warn('Footer translate link with ID "footer-translate-link-dummy" not found.');
            if (!translateBtnConst) console.warn('Translate button not found, cannot initialize footer translate link click handler.');
        }

        // Initialize the anthem audio player and its controls.
        const samvidhanAnthem = document.getElementById('samvidhanAnthemAudio');
        const understandPrincipalsBtn = document.getElementById('startJourneyBtn');
        const stopAnthemBtn = document.getElementById('stopMusicBtn');

        if (samvidhanAnthem && understandPrincipalsBtn && stopAnthemBtn) {
            understandPrincipalsBtn.addEventListener('click', understandPrincipalsAndPlayAnthem);
            stopAnthemBtn.addEventListener('click', stopAnthem);
            stopAnthemBtn.style.display = 'none'; // Hides the stop button by default.
            stopAnthemBtn.setAttribute('aria-hidden', 'true');
             // Ensures the start button is visible and accessible.
             understandPrincipalsBtn.style.display = 'inline-flex';
             understandPrincipalsBtn.setAttribute('aria-hidden', 'false');
            console.log("Anthem elements and buttons initialized.");
        } else {
            if(!samvidhanAnthem) console.warn("Anthem audio element not found.");
            if(!understandPrincipalsBtn) console.warn("Understand Principals button not found.");
            if(!stopAnthemBtn) console.warn("Stop Anthem button not found.");
             // If the control buttons are missing, the audio player is hidden.
             const audioPlayer = document.getElementById('samvidhanAnthemAudio');
             if(audioPlayer) audioPlayer.style.display = 'none';
        }


        console.log("Vishwa Samvidhan - Eternal Script Initialized. The Path Unfolds in Wisdom.");

        // Provides a warning for developers if the site is being run from the file protocol.
        if (window.location.protocol === 'file:') {
            console.warn('Running site from file:// protocol. Service Workers and Manifest fetching may fail.');
        }


    });

})();
