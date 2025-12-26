'use strict';

// This script manages the dynamic loading and state of the Google Translate widget.
// It is designed to be more robust than a simple script include, handling loading states,
// errors, and the asynchronous nature of the widget's rendering.

// Global flag to track if the widget's DOM has been successfully rendered by the Google script.
let translateLoaded = false;

// --- HTML content for different button states ---
const hideHtml = '<span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌</span> अनुवाद छुपाएँ'; // "Hide Translation"
const showHtml = '<span class="emoji-pulse">😮</span>Experience the Granth in your mother tongue<span class="emoji-spin">🌍</span>';
const loadingHtml = 'अनुवाद लोड हो रहा है... <span class="emoji-sandclock">⌛</span>'; // "Loading Translation..."

/**
 * This is the global callback function that the Google Translate script executes once it has loaded.
 * Its name is required by the Google API (`...&cb=googleTranslateElementInit`).
 */
function googleTranslateElementInit() {
  try {
    const newIncludedLanguages = 'en,hi,es,ar,fr,zh-CN,ru,de,bn,pt,ja,ur,ta,pa,ko,it,tr,nl,id,vi,th,ml,te,mr,gu,kn';

    // Initialize the Google Translate widget itself.
    new google.translate.TranslateElement({
      pageLanguage: 'hi', // The page's original language.
      includedLanguages: newIncludedLanguages,
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE, // Use the simple dropdown layout.
      autoDisplay: false // IMPORTANT: Prevents Google from showing its own top banner.
    }, 'google_translate_element'); // The ID of the div where the widget will be injected.

    const widgetDiv = document.getElementById('google_translate_element');
    const translateButton = document.getElementById('translateBtn');
    let observerTimeout;

    // The Google script injects the widget's DOM asynchronously. We use a MutationObserver
    // to "watch" our container div and detect when Google's content is added.
    const observer = new MutationObserver((mutations, obs) => {
      if (widgetDiv && widgetDiv.querySelector('.goog-te-gadget-simple')) {
        // The widget has been rendered!
        translateLoaded = true; // Set our global flag.
        obs.disconnect(); // Stop observing now that we've found it.
        clearTimeout(observerTimeout); // Cancel the error timeout.

        if (translateButton) {
          translateButton.disabled = false; // Re-enable the button.

          // This logic handles the case where the user clicked the button *while* the script was loading.
          if (translateButton.innerHTML.includes('<span class="emoji-sandclock">')) {
            // If the button shows "Loading...", it means the user wants to see the widget now.
            translateButton.innerHTML = hideHtml; // Set button to "Hide" state.
            widgetDiv.style.display = 'flex'; // Show the widget.
            widgetDiv.classList.remove('google-translate-hidden');
            translateButton.setAttribute('aria-expanded', 'true');
            widgetDiv.setAttribute('aria-hidden', 'false');
          } else {
            // If the script loaded without the user clicking during load, keep the widget hidden.
            widgetDiv.style.display = 'none';
            widgetDiv.classList.add('google-translate-hidden');
            widgetDiv.setAttribute('aria-hidden', 'true');
            translateButton.setAttribute('aria-expanded', 'false');
            // Ensure the button text is correct.
            if (!translateButton.innerHTML.includes('अनुवाद छुपाएँ')) {
                translateButton.innerHTML = showHtml;
            }
          }
        }
      }
    });

    // Set a 10-second timeout. If the widget hasn't rendered by then, we assume an error
    // (e.g., it was blocked by an ad-blocker).
    observerTimeout = setTimeout(() => {
        if (!translateLoaded) {
            const btn = document.getElementById('translateBtn');
            if (btn && btn.innerHTML.includes('<span class="emoji-sandclock">')) {
                btn.innerHTML = 'अनुवाद लोड नहीं हो सका <span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌</span>'; // "Translation failed to load"
                btn.disabled = false;
            }
            observer.disconnect();
        }
    }, 10000);

     // Start observing the widget container for changes.
     if(widgetDiv) {
        setTimeout(() => { // Use a small delay to ensure the browser is ready.
             observer.observe(widgetDiv, { childList: true, subtree: true });
        }, 50);
     } else {
         // Handle the case where the target div doesn't even exist in the HTML.
         console.error('#google_translate_element not found. Cannot initialize observer.');
         clearTimeout(observerTimeout);
     }

  } catch (error) {
    // Catch any synchronous errors during the new google.translate.TranslateElement call.
    console.error('Error initializing Google Translate Element:', error);
    const translateButton = document.getElementById('translateBtn');
     if (translateButton) {
        translateButton.disabled = false;
        translateButton.innerHTML = 'अनुवाद लोड नहीं हो सका <span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌</span>';
        translateButton.setAttribute('aria-expanded', 'false');
     }
  }
}

/**
 * Main function called by the button's 'onclick' attribute.
 * It manages the state of loading the script and showing/hiding the widget.
 * @param {Event} event - The click event object.
 */
function initTranslate(event) {
  const widget = document.getElementById('google_translate_element');
  const btn = event.currentTarget;

  // Safety checks.
  if (!widget || !btn) {
      if (btn) btn.disabled = true;
      return;
  }
   if (btn.disabled || btn.innerHTML.includes('<span class="emoji-sandclock">')) {
      return; // Prevent multiple clicks while loading.
   }

  const isWidgetHidden = widget.classList.contains('google-translate-hidden') || widget.style.display === 'none';

  if (!translateLoaded) {
    // --- FIRST CLICK: LOAD THE SCRIPT ---
    btn.disabled = true;
    btn.innerHTML = loadingHtml; // Show loading state.
    btn.setAttribute('aria-expanded', 'false');
    widget.style.display = 'none'; // Ensure it's hidden.
    widget.classList.add('google-translate-hidden');

    // Check if the script tag already exists.
    let script = document.getElementById('google-translate-script');
    if (!script) {
        // If not, create it and append it to the body to start the download.
        script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.defer = true;
        script.id = 'google-translate-script';
        script.onerror = () => {
           // Handle script loading errors (e.g., network failure).
           console.error('Google Translate script failed to load.');
           btn.disabled = false;
           btn.innerHTML = 'अनुवाद लोड नहीं हो सका <span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌</span>';
           widget.style.display = 'none';
        };
        document.body.appendChild(script);
    }
  } else {
    // --- SUBSEQUENT CLICKS: TOGGLE VISIBILITY ---
    if (isWidgetHidden) {
       // If the widget is loaded but hidden, show it.
       widget.style.display = 'flex';
       widget.classList.remove('google-translate-hidden');
       btn.innerHTML = hideHtml; // Change button to "hide" state.
       btn.setAttribute('aria-expanded', 'true');
       widget.setAttribute('aria-hidden', 'false');
    } else {
       // If the widget is visible, hide it and reload the page.
       // Reloading is the most reliable way to remove all of Google's DOM modifications and revert the text.
       widget.style.display = 'none';
       widget.classList.add('google-translate-hidden');
       btn.innerHTML = showHtml;
       btn.setAttribute('aria-expanded', 'false');
       widget.setAttribute('aria-hidden', 'true');
       window.location.reload();
    }
  }
}
