/**
 * @file google-translate.js
 * @description Manages the dynamic loading, initialization, and user interaction for the Google Translate widget.
 * This script ensures the widget is only loaded when the user clicks the translate button, and it handles various states like loading, error, and visibility toggling.
 * It also provides responsive button text and ensures the widget is accessible.
 */
let translateLoaded = false;

/**
 * @function getTranslateButtonText
 * @description Returns the appropriate HTML content for the translate button based on its state (e.g., show, hide, loading, error) and the current screen width.
 * This allows for responsive button text that adapts to different device sizes.
 * @param {string} type - The state of the button ('show', 'hide', 'loading', 'error', 'divMissingError').
 * @returns {string} The HTML string for the button's content.
 */
function getTranslateButtonText(type) {
    const microThreshold = 200;
    const width = window.innerWidth;

    // Defines the HTML content for each button state.
    const texts = {
        show: 'Experience in your mother tongue <span class="emoji-pulse">😮</span><span class="emoji-spin">🌍</span>',
        hide: 'Hide Translation <span class="emoji-spin">🌍</span><span class="emoji-pulse">❌</span>',
        loading: width <= microThreshold ? 'Loading... <span class="emoji-sandclock">⌛</span>' : 'Loading Translation... <span class="emoji-sandclock">⌛</span>',
        error: width <= microThreshold ? 'Error <span class="emoji-pulse">⚠️</span>' : 'Translate Error <span class="emoji-pulse">⚠️</span>',
        divMissingError: width <= microThreshold ? 'DIV Missing <span class="emoji-pulse">⚠️</span>' : 'Translate DIV Missing <span class="emoji-pulse">⚠️</span>'
    };

    return texts[type];
}


window.googleTranslateElementInit = function() {
    console.log('Google Translate Element Initializing for Vishwa Samvidhan...');
    try {
      const newIncludedLanguages = 'en,hi,es,ar,fr,zh-CN,ru,de,bn,pt,ja,ur,ta,pa,ko,it,tr,nl,id,vi,th,ml,te,mr,gu,kn,la,sa';

      new google.translate.TranslateElement({
        pageLanguage: 'en', // Sets the default language of the page, which is English.
        includedLanguages: newIncludedLanguages,
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false // Prevents the widget from being displayed automatically on load.
      }, 'google_translate_element');
      console.log('Google Translate Element Initialized.');

      const widgetDiv = document.getElementById('google_translate_element');
      const translateButton = document.getElementById('translateBtn');
      let observerTimeout;

      const observer = new MutationObserver((mutations, obs) => {
        // Checks if the Google Translate widget has been successfully rendered in the DOM.
        if (widgetDiv && widgetDiv.children.length > 0 && widgetDiv.querySelector('.goog-te-gadget-simple')) {
          console.log('Google Translate widget DOM rendered.');
          translateLoaded = true;
          obs.disconnect(); // Disconnect the observer since the widget is now loaded.
          clearTimeout(observerTimeout); // Clears the timeout since the widget has loaded successfully.

          if (translateButton) {
            translateButton.disabled = false; // Re-enables the translate button now that the widget is ready.

            // Checks if the user clicked the translate button while the script was still loading.
            if (translateButton.innerHTML.includes('<span class="emoji-sandclock">')) {
                console.log('Button was in loading state, showing widget after init.');
                // If the user clicked during load, the widget is shown and the button text is updated to the 'hide' state.
                translateButton.innerHTML = getTranslateButtonText('hide'); // Sets the button text to the 'hide' state, adapted for the current screen size.
                widgetDiv.style.display = 'flex';
                translateButton.setAttribute('aria-expanded', 'true');
                widgetDiv.setAttribute('aria-hidden', 'false');
                widgetDiv.classList.remove('google-translate-hidden');
            } else {
               // If the widget initialized without a prior click, ensure it remains hidden and the button text is set to the 'show' state.
               console.log('Widget init successful, but button not in loading state.');
                widgetDiv.style.display = 'none';
                widgetDiv.setAttribute('aria-hidden', 'true');
                widgetDiv.classList.add('google-translate-hidden');
                translateButton.setAttribute('aria-expanded', 'false');
                // Resets the button text to the 'show' state, adapted for the current screen size.
                translateButton.innerHTML = getTranslateButtonText('show');
            }

          } else {
              console.warn('#translateBtn not found after GTranslate widget init.');
          }
        }
      });

      // Sets a timeout to handle cases where the Google Translate script fails to load or render within a reasonable time.
      observerTimeout = setTimeout(() => {
          if (!translateLoaded) {
              console.warn('MutationObserver timed out or Google Translate script failed to render the widget DOM within 10 seconds.');
              const btn = document.getElementById('translateBtn');
              if (btn) {
                   btn.disabled = false; // Re-enables the button so the user can try again.
                   // If the button was in a loading state, it is updated to show an error.
                   if (btn.innerHTML.includes('<span class="emoji-sandclock">')) {
                       btn.innerHTML = getTranslateButtonText('error'); // If the button was not loading, its text is restored to the initial 'show' state.
                   } else {
                         btn.innerHTML = getTranslateButtonText('show'); // Restore initial if not loading/error state
                   }
                   btn.setAttribute('aria-expanded', 'false');
              }
               const widget = document.getElementById('google_translate_element');
               if (widget) {
                   widget.style.display = 'none';
                   widget.setAttribute('aria-hidden', 'true');
                   widget.classList.add('google-translate-hidden');
               }
              translateLoaded = false;
              observer.disconnect(); // Disconnects the observer to prevent further unnecessary checks.
          }
      }, 10000); // Sets a 10-second timeout for the widget to load.


       if(widgetDiv) {
           // Starts observing the widget container for DOM changes, with a small delay to ensure the browser is ready.
          setTimeout(() => {
               observer.observe(widgetDiv, { childList: true, subtree: true });
               console.log('MutationObserver started on #google_translate_element.');
          }, 50); // A 50ms delay before starting the observer.
       } else {
           // Handles the error case where the Google Translate container element is not found in the DOM.
           console.error('Google Translate widget div #google_translate_element not found on page load. Cannot initialize or observe.');
           clearTimeout(observerTimeout); // Clears the loading timeout since the operation is cancelled.
           const btn = document.getElementById('translateBtn');
              if (btn) {
                   btn.disabled = true;
                   btn.innerHTML = getTranslateButtonText('divMissingError'); // Sets the button text to an error state indicating the container is missing.
                   btn.setAttribute('aria-expanded', 'false');
              }
           translateLoaded = false;
       }
    } catch (error) {
      // Catches any unexpected errors that occur during the initialization function.
      console.error('Error during Google Translate Element initialization function:', error);
        const translateButton = document.getElementById('translateBtn');
        if (translateButton) {
            translateButton.disabled = false;
             // Checks if the button was in a loading state before the error occurred.
            if (translateButton.innerHTML.includes('<span class="emoji-sandclock">')) {
                 translateButton.innerHTML = getTranslateButtonText('error'); // Sets the button text to an error state, adapted for the current screen size.
            } else {
                // If the button was not in a loading state, it reverts to the 'show' text.
                translateButton.innerHTML = getTranslateButtonText('show');
            }

            translateButton.setAttribute('aria-expanded', 'false');
        }
        const widgetDiv = document.getElementById('google_translate_element');
        if (widgetDiv) {
            widgetDiv.style.display = 'none';
            widgetDiv.setAttribute('aria-hidden', 'true');
            widgetDiv.classList.add('google-translate-hidden');
        }
      translateLoaded = false;
    }
     console.log('googleTranslateElementInit finished.'); // Logs a message to the console when the initialization callback is complete.
};


/**
 * @function initTranslate
 * @description Handles the click event for the translate button. It dynamically loads the Google Translate script if it hasn't been loaded yet, or toggles the visibility of the widget if it's already loaded.
 * @param {Event} event - The click event object.
 */
window.initTranslate = function(event) {
    const widget = document.getElementById('google_translate_element');
    const btn = event.currentTarget;

    if (!widget || !btn) {
        console.error('Translate button or widget element not found for initTranslate logic.');
        if (btn) { btn.disabled = true; btn.innerHTML = getTranslateButtonText('divMissingError'); } // Disables the button and sets its text to an error state.
        return;
    }
    // Prevents the function from running if the button is already disabled or in a loading state.
    if (btn.disabled || btn.innerHTML.includes('<span class="emoji-sandclock">')) {
        console.log('initTranslate: Button is disabled or in loading state, ignoring click.');
        return;
    }

    // Determines if the widget is currently hidden by checking for a specific CSS class.
    const isWidgetHidden = widget.classList.contains('google-translate-hidden');

    if (!translateLoaded) {
      // If the widget is not yet loaded, this block initiates the loading process.
      console.log('initTranslate: Widget not loaded. Starting load process...');
      btn.disabled = true; // Disables the button to prevent multiple clicks while loading.
      // Sets the button text to a 'loading' state, adapted for the current screen size.
      btn.innerHTML = getTranslateButtonText('loading');
      btn.setAttribute('aria-expanded', 'false');
      // Ensures the widget container remains hidden while the script is loading.
      widget.style.display = 'none';
      widget.setAttribute('aria-hidden', 'true');
      widget.classList.add('google-translate-hidden'); // Adds or retains the CSS class used to hide the widget.

      let script = document.getElementById('google-translate-script');
      if (!script) {
          // Creates and appends the Google Translate script tag to the document body.
          script = document.createElement('script');
          script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          script.async = true;
          script.defer = true; // Defer ensures the script is executed after the document has been parsed.
          script.id = 'google-translate-script';
          script.onerror = () => {
             console.error('initTranslate: Google Translate script failed to load.');
             btn.disabled = false; // Re-enables the button so the user can try again.
             // Sets the button text to an error state, adapted for the current screen size.
             btn.innerHTML = getTranslateButtonText('error');
             // Ensures the widget remains hidden and inaccessible after a loading error.
             widget.style.display = 'none';
             widget.setAttribute('aria-hidden', 'true');
             widget.classList.add('google-translate-hidden');
             translateLoaded = false; // Sets the `translateLoaded` flag to false to indicate a failed load.
             btn.setAttribute('aria-expanded', 'false');
          };
          document.body.appendChild(script);
          console.log('initTranslate: Google Translate script tag appended.');
      } else {
           // If the script tag exists but is not yet loaded, this indicates a previous failed attempt or a pending load.
           console.log('initTranslate: Script tag already exists. Waiting for googleTranslateElementInit callback or timeout.');
           // No action is needed here as the button is already in the correct loading state.
      }
    } else {
      // If the widget is already loaded, this block toggles its visibility or reloads the page to reset the translation.
      if (isWidgetHidden) { // If the widget is hidden, this block makes it visible.
         console.log('initTranslate: Widget loaded and hidden. Showing widget.');
         widget.style.display = 'flex'; // The display style can be 'flex' or 'block', depending on the desired layout.
         widget.classList.remove('google-translate-hidden'); // Removes the CSS class that hides the widget.
         // Sets the button text to the 'hide' state, adapted for the current screen size.
         btn.innerHTML = getTranslateButtonText('hide');
         btn.setAttribute('aria-expanded', 'true'); // Sets the ARIA attribute to indicate the widget is expanded.
         widget.setAttribute('aria-hidden', 'false'); // Sets the ARIA attribute to make the widget accessible to screen readers.

      } else { // If the widget is visible, this block hides it and reloads the page to reset the translation.
         console.log('initTranslate: Widget loaded and shown. Hiding and reloading page.');
         // Hides the widget immediately for a responsive user experience.
         widget.style.display = 'none';
         widget.classList.add('google-translate-hidden');
         // Reverts the button text to the 'show' state, adapted for the current screen size.
         btn.innerHTML = getTranslateButtonText('show');
         btn.setAttribute('aria-expanded', 'false'); // Sets the ARIA attribute to indicate the widget is collapsed.
         widget.setAttribute('aria-hidden', 'true'); // Sets the ARIA attribute to make the widget inaccessible to screen readers.

         // Reloads the page to reliably remove any DOM modifications made by Google Translate.
         window.location.reload();
         // Note: Any code placed after `window.location.reload()` may not execute.
      }
    }
};
