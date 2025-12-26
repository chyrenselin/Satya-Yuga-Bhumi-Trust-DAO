// --- Keyboard Navigation & Accessibility Enhancements for Chapters ---

// This event listener adds keyboard support for the chapter accordion.
document.addEventListener('keydown', function(event) {
  const target = event.target;

  // Allows users to toggle a chapter using Enter or Space when the heading is focused.
  if (target && target.tagName === 'H2' && target.getAttribute('role') === 'button' && target.closest('.chapter')) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevents default browser action (like scrolling on Space).
      const chapter = target.closest('.chapter');
      if (chapter) {
          toggleChapter(chapter); // Calls the main toggle function from chapters.js.
      }
    }
  }

  // Allows users to close an open chapter by pressing the Escape key when focus is inside it.
  if (event.key === 'Escape') {
    const focusedElement = document.activeElement;
    const contentArea = focusedElement ? focusedElement.closest('.chapter.active .content') : null;

    if (contentArea) {
      const chapter = contentArea.closest('.chapter.active');
      if (chapter) {
        event.preventDefault();
        // The toggleChapter function already handles moving focus back to the heading, which is the correct behavior.
        toggleChapter(chapter);
      }
    }
  }
});

// --- Logic to Distinguish Mouse vs. Keyboard Focus (:focus-visible polyfill) ---
// This block of code adds a 'using-mouse' class to the body when the user clicks,
// which is used by the CSS to hide focus outlines for mouse users, improving the visual experience
// while preserving the outlines for keyboard users for accessibility.
let lastInputWasKeyboard = false;
document.body.addEventListener('mousedown', () => { lastInputWasKeyboard = false; }, { capture: true });
document.body.addEventListener('keydown', (event) => {
    // We only set the flag for keys that are clearly for navigation or interaction.
    const isNavigationOrInteractionKey = ['Tab', 'Enter', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key);
    if (isNavigationOrInteractionKey) {
         lastInputWasKeyboard = true;
    }
}, { capture: true });

// On 'focusin', we check the flag and apply/remove the class BEFORE the element's focus style is calculated.
document.body.addEventListener('focusin', (event) => {
     if (event.target !== document.body) {
          if (lastInputWasKeyboard) {
             document.body.classList.remove('using-mouse');
          } else {
              document.body.classList.add('using-mouse');
          }
     }
}, { capture: true });

// Handles cases where focus leaves the document window.
document.body.addEventListener('focusout', () => {
    setTimeout(() => {
         if (!document.activeElement || document.activeElement === document.body) {
              document.body.classList.remove('using-mouse');
         }
    }, 10);
}, { capture: true });


// --- Main DOMContentLoaded Entry Point ---
// This ensures all the setup code runs only after the page's HTML has been fully loaded.
document.addEventListener('DOMContentLoaded', () => {
  const stopBtn = document.getElementById('stopMusicBtn');
  const translateBtn = document.getElementById('translateBtn');
  const translateWidgetDiv = document.getElementById('google_translate_element');

  // --- Initial Button and Widget State ---
  // Ensures all interactive elements start in their correct visual and accessibility states.
  if (stopBtn) {
    stopBtn.style.display = 'none';
    stopBtn.setAttribute('aria-hidden', 'true');
  }

  if (translateBtn) {
     translateBtn.setAttribute('aria-controls', 'google_translate_element');
     translateBtn.setAttribute('aria-expanded', 'false'); // Default state is collapsed.
      if (!translateBtn.innerHTML.includes('अनुवाद छुपाएँ')) {
          translateBtn.innerHTML = showHtml; // Set initial button text.
      }
      translateBtn.disabled = false;
  }

    if(translateWidgetDiv){
         translateWidgetDiv.style.display = 'none';
         translateWidgetDiv.setAttribute('aria-hidden', 'true');
         translateWidgetDiv.classList.add('google-translate-hidden');
    } else {
         // If the widget's container div is missing, disable the button to prevent errors.
         if(translateBtn) {
             translateBtn.disabled = true;
             translateBtn.innerHTML = 'अनुवाद div नहीं मिला <span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌</span>'; // "Translation div not found"
             translateBtn.setAttribute('aria-expanded', 'false');
         }
    }


  // --- Chapter Accessibility Setup ---
  // This loop goes through each chapter and adds the necessary ARIA attributes and initial states
  // to make the accordion fully accessible to screen readers and keyboard users.
  document.querySelectorAll('#chapters .chapter').forEach((chapter, index) => {
    const heading = chapter.querySelector('h2');
    const content = chapter.querySelector('.content');

    if (heading && content) {
        // Ensure unique IDs exist for ARIA linking.
        if (!heading.id) {
            const baseId = `chapter-auto-id-${index + 1}`;
            heading.id = `heading-${baseId}`;
        }
        if (!content.id) {
             content.id = `content-${heading.id.replace('heading-', '')}`;
        }

      heading.setAttribute('role', 'button'); // Tell screen readers this is a clickable button.
      heading.setAttribute('tabindex', '0');    // Make it focusable via keyboard.
      heading.setAttribute('aria-controls', content.id); // Links the button to the content it controls.
      heading.setAttribute('aria-expanded', 'false'); // Initial state is collapsed.

      content.setAttribute('role', 'region'); // The content is a landmark region.
      content.setAttribute('aria-labelledby', heading.id); // Links the region back to its controlling button.
      content.setAttribute('aria-hidden', 'true'); // Hide from screen readers initially.
      content.setAttribute('tabindex', '-1'); // Make the content container itself unfocusable when closed.

      // Set initial styles via JS to ensure a consistent starting point for animations.
      content.style.display = 'none';
      content.style.maxHeight = '0';
      content.style.overflow = 'hidden';
      content.style.opacity = '0';
      content.style.paddingTop = '0';
      content.style.paddingBottom = '0';

       // Initially make all focusable elements inside the collapsed content unfocusable.
       const focusableElements = getFocusableElements(content);
       focusableElements.forEach(el => {
            if (!el.dataset.originalTabindex && el.getAttribute('tabindex') !== '-1') {
                 el.dataset.originalTabindex = el.getAttribute('tabindex') || '';
            }
           el.setAttribute('tabindex', '-1');
       });
    }
  });

  // Run the validation function after all other setup is complete.
  validateDocument();
});


/**
 * A custom validation function to check the document for common HTML and accessibility issues.
 * Logs warnings and errors to the console to help with development and maintenance.
 */
function validateDocument() {
    // 1. Check for a valid DOCTYPE.
    if (document.doctype === null || document.doctype.name.toLowerCase() !== 'html') {
      console.error('Validation Error: Missing or incorrect DOCTYPE. Must be <!DOCTYPE html>.');
    }

    // 2. Check for the 'lang' attribute on the <html> tag.
    const htmlElement = document.documentElement;
    const isTranslated = htmlElement.classList.contains('translated-ltr') || htmlElement.classList.contains('translated-rtl');
    if (!htmlElement.lang && !isTranslated) {
      console.warn(`Accessibility Warning: <html> element is missing the "lang" attribute.`);
    }

    // 3. Check for a non-empty <title>.
    if (!document.title || document.title.trim() === '') {
      console.warn('Accessibility Warning: Document <title> is missing or empty.');
    }

    // 4. Check for a <main> element.
    const mainElement = document.querySelector('main');
    if (!mainElement) {
      console.warn('HTML Structure Warning: Missing <main> element.');
    }

    // 5. Check if sections have headings or labels for screen reader navigation.
    document.querySelectorAll('section').forEach((section, index) => {
       const hasHeading = section.querySelector('h1, h2, h3, h4, h5, h6');
       const hasAriaLabel = section.hasAttribute('aria-label') || section.hasAttribute('aria-labelledby');
       const isMeaningful = section.children.length > 0 || section.textContent.trim().length > 10;
        if (isMeaningful && !hasHeading && !hasAriaLabel) {
           console.warn(`Accessibility Suggestion: Section #${index + 1} lacks a heading or ARIA label.`);
       }
    });

    // 6. Check that all images have meaningful 'alt' text or are marked as decorative.
     document.querySelectorAll('img').forEach(img => {
         const imgSrc = img.getAttribute('src');
         const imgAlt = img.getAttribute('alt');
         if (imgAlt === null) {
             console.warn(`Accessibility Warning: Image with src "${imgSrc}" is missing the 'alt' attribute.`);
         } else if (imgAlt.trim() === '' && img.getAttribute('role') !== 'presentation') {
             console.warn(`Accessibility Warning: Image with src "${imgSrc}" has an empty 'alt' but is not marked as decorative (role="presentation").`);
         }
     });

    // 7. Check that audio elements have a text description.
    document.querySelectorAll('audio').forEach((audio, index) => {
        const hasAriaDescription = audio.hasAttribute('aria-describedby');
        const isUserFacing = audio.hasAttribute('controls');
         if (isUserFacing && !hasAriaDescription) {
            console.warn(`Accessibility Warning: Interactive audio element #${index + 1} is missing an 'aria-describedby' attribute to link it to a text description.`);
         }
    });

    // 8. Check that tables have captions and headers have 'scope'.
    document.querySelectorAll('table').forEach((table, index) => {
        if (!table.querySelector('caption')) {
             console.warn(`Accessibility Warning: Table #${index + 1} is missing a <caption>.`);
        }
        table.querySelectorAll('th').forEach(th => {
            if (!th.hasAttribute('scope')) {
               console.warn(`Accessibility Suggestion: Add 'scope="col"' or 'scope="row"' to <th> element in Table #${index + 1}.`);
            }
        });
    });

    // 9. Check for invalid direct children in <ul> or <ol> lists.
    document.querySelectorAll('ul, ol').forEach((list, index) => {
        const allowedTags = ['LI', 'SCRIPT', 'TEMPLATE', 'STYLE'];
        const problematicChild = Array.from(list.children).find(child => !allowedTags.includes(child.tagName));
        if (problematicChild) {
             console.warn(`HTML Structure Warning: List #${index + 1} has a direct child <${problematicChild.tagName.toLowerCase()}> which is not an <li>.`);
        }
    });
  }