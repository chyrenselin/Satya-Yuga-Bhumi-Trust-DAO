// This entire script is wrapped in an Immediately Invoked Function Expression (IIFE)
// to create a private scope. This prevents its variables from leaking into the global namespace.
'use strict';
(function() {
    // --- STATE VARIABLES ---
    let isTranslateScriptLoaded = false; // Flag to track if the Google Translate script has been loaded.
    let observerTimeout; // Holds the timeout ID for error handling if the script takes too long to load.
    
    // --- DOM ELEMENT REFERENCES ---
    const translateButton = document.getElementById('translateBtn'); // The button that triggers the translation.
    const widgetContainer = document.getElementById('google_translate_element'); // The div where the widget will be rendered.

    // --- BUTTON CONTENT ---
    // An object to store the different HTML content for the button, representing its various states.
    const BUTTON_HTML = {
        initial: `<span class="emoji-pulse">😮</span>Experience our Sacred Invitation in your mother tongue<span class="emoji-spin">🌍</span>`,
        loading: `Loading Translation... <span class="emoji-sandclock">⌛</span>`,
        active: `<span class="emoji-spin">🌍</span> Hide Translation <span class="emoji-pulse">❌</span>`,
        error: `Translation Error (Ad-Blocker?) <span class="emoji-pulse">❌</span>`
    };

    /**
     * This function is the global callback that the Google Translate script executes once it has loaded.
     * The name 'googleTranslateElementInit' is required by the Google API via the '?cb=' URL parameter.
     */
    window.googleTranslateElementInit = function() {
        try {
            // Initialize the Google Translate widget.
            new google.translate.TranslateElement({
                pageLanguage: document.documentElement.lang || 'en', // The original language of the page.
                // A curated list of languages to offer in the dropdown.
                includedLanguages: 'en,hi,es,ar,fr,zh-CN,ru,de,bn,pt,ja,ur,ta,pa,ko,it,tr',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE, // A simple dropdown layout.
                autoDisplay: false // Prevents the top banner from showing.
            }, 'google_translate_element'); // The ID of the container element.

            // The Google script is slow and doesn't provide a ready callback.
            // We use a MutationObserver to "watch" for when Google adds its content to our div.
            const observer = new MutationObserver((mutations, obs) => {
                // Check if the actual widget element exists.
                if (widgetContainer.querySelector('.goog-te-gadget-simple')) {
                    clearTimeout(observerTimeout); // Cancel the error timeout.
                    isTranslateScriptLoaded = true; // Set our flag to true.
                    translateButton.disabled = false; // Re-enable the button.
                    translateButton.innerHTML = BUTTON_HTML.active; // Set the button to its "active" state.
                    widgetContainer.classList.remove('google-translate-hidden'); // Show the widget.
                    translateButton.setAttribute('aria-expanded', 'true');
                    obs.disconnect(); // Stop observing, as our job is done.
                }
            });

            // Start observing the widget container for changes to its direct children and their descendants.
            observer.observe(widgetContainer, {
                childList: true,
                subtree: true
            });

            // Set a 10-second timeout. If the observer hasn't found the widget by then,
            // assume it was blocked (e.g., by an ad-blocker) and trigger an error state.
            observerTimeout = setTimeout(() => {
                observer.disconnect();
                handleScriptError();
            }, 10000);

        } catch (error) {
            handleScriptError();
        }
    };

    /**
     * Handles errors during script loading or initialization.
     * Resets the button to an error state so the user knows something went wrong.
     */
    function handleScriptError() {
        if (!translateButton) return;
        translateButton.disabled = false;
        translateButton.innerHTML = BUTTON_HTML.error;
        if (widgetContainer) widgetContainer.classList.add('google-translate-hidden');
        translateButton.setAttribute('aria-expanded', 'false');
    }

    /**
     * Dynamically creates and injects the Google Translate script into the document.
     */
    function loadTranslateScript() {
        // Prevent re-loading if the script is already loaded or if the button is disabled.
        if (isTranslateScriptLoaded || translateButton.disabled) return;
        
        // Disable the button and show a loading message to the user.
        translateButton.disabled = true;
        translateButton.innerHTML = BUTTON_HTML.loading;
        
        // Create a new <script> element.
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        // The 'cb' parameter tells Google's script which global function to call upon completion.
        script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
        script.async = true;
        script.defer = true;
        // If the script fails to load (e.g., network error), handle the error.
        script.onerror = () => {
            handleScriptError();
        };
        // Append the script to the body to start the download.
        document.body.appendChild(script);
    }

    // --- SCRIPT ENTRY POINT ---
    // This event listener waits for the initial HTML document to be fully loaded and parsed.
    document.addEventListener('DOMContentLoaded', () => {
        if (!translateButton || !widgetContainer) return; // Exit if necessary elements don't exist.
        
        // Set the button's initial text content.
        translateButton.innerHTML = BUTTON_HTML.initial;

        // Add the main click event listener to the button.
        translateButton.addEventListener('click', () => {
            // If the widget is already active, clicking the button should "deactivate" it.
            // The simplest way to remove Google's modifications is to reload the page.
            if (isTranslateScriptLoaded) {
                window.location.reload();
            } else {
                // If the script isn't loaded yet, start the loading process.
                loadTranslateScript();
            }
        });
    });
})();