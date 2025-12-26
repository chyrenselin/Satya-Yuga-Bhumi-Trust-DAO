/**
 * Finds all potentially focusable elements within a given container.
 * This is crucial for accessibility, allowing us to manage tab order when showing/hiding content.
 * @param {HTMLElement} container - The element to search within.
 * @returns {NodeListOf<HTMLElement>} - A NodeList of focusable elements.
 */
function getFocusableElements(container) {
    // Selects a comprehensive list of elements that are typically interactive.
    return container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );
}

/**
 * Toggles the expanded/collapsed state of a chapter section.
 * This function handles the accordion logic, including animations, ARIA attributes for accessibility, and focus management.
 * @param {HTMLElement} chapterDiv - The .chapter element to toggle.
 */
function toggleChapter(chapterDiv) {
  const heading = chapterDiv.querySelector('h2');
  const content = chapterDiv.querySelector('.content');
  const isActive = chapterDiv.classList.contains('active');
  const allChapters = document.querySelectorAll('#chapters .chapter');

  // Safety check to ensure the required elements exist.
  if (!heading || !content) {
    console.error('toggleChapter called on an element without a h2 or .content child:', chapterDiv);
    return;
  }

  // --- LOGIC TO CLOSE THE CURRENTLY ACTIVE CHAPTER ---
  if (isActive) {
    // Accessibility: If focus is currently inside the content being closed, move it to the heading before hiding it.
    if (document.activeElement && content.contains(document.activeElement)) {
      setTimeout(() => { // Use a small timeout to prevent conflicts with other events.
           heading.focus({ preventScroll: true }); // Move focus without scrolling the page.
      }, 50);
    }

    chapterDiv.classList.remove('active'); // This class change will trigger CSS styles.
    heading.setAttribute('aria-expanded', 'false'); // Inform screen readers that the section is collapsed.
    content.setAttribute('aria-hidden', 'true'); // Hide the content from screen readers.

    // Make all focusable children inside the content unreachable via keyboard.
    const focusableElements = getFocusableElements(content);
    focusableElements.forEach(el => {
        // Store the original tabindex value (if any) so it can be restored later.
        if (el.getAttribute('tabindex') !== '-1') {
             if (!el.dataset.originalTabindex) { // Avoid overwriting if already set.
                 el.dataset.originalTabindex = el.getAttribute('tabindex') || '';
             }
        }
        el.setAttribute('tabindex', '-1'); // Make the element unfocusable.
    });

    // --- Start Collapse Animation ---
    // 1. Set a specific max-height to start the CSS transition from.
    content.style.maxHeight = content.scrollHeight + 'px';
    // 2. Use requestAnimationFrame to ensure the browser has processed the above style change before starting the transition.
    requestAnimationFrame(() => {
        // 3. Set max-height to 0 to trigger the smooth collapse animation defined in the CSS.
        content.style.maxHeight = '0';
        content.style.opacity = '0'; // Fade out simultaneously.
    });

    // 4. After the transition finishes, set display to 'none' to fully remove it from the layout.
    const handleTransitionEnd = () => {
         if (!chapterDiv.classList.contains('active')) {
            content.style.display = 'none';
         }
         content.removeEventListener('transitionend', handleTransitionEnd); // Clean up the listener.
    };
    content.addEventListener('transitionend', handleTransitionEnd);

    return; // Exit the function after closing the chapter.
  }

  // --- LOGIC TO CLOSE ANY *OTHER* OPEN CHAPTER ---
  // This ensures only one chapter is open at a time.
  allChapters.forEach(otherChapter => {
    if (otherChapter !== chapterDiv && otherChapter.classList.contains('active')) {
      // This block runs the same closing logic as above, but on the *other* open chapter.
      const otherHeading = otherChapter.querySelector('h2');
      const otherContent = otherChapter.querySelector('.content');
      if (otherHeading && otherContent) {
        // Move focus if necessary.
        if (document.activeElement && otherContent.contains(document.activeElement)) {
             setTimeout(() => { otherHeading.focus({ preventScroll: true }); }, 50);
        }
        // Update classes and ARIA attributes.
        otherChapter.classList.remove('active');
        otherHeading.setAttribute('aria-expanded', 'false');
        otherContent.setAttribute('aria-hidden', 'true');
        // Make content unfocusable.
        const otherFocusableElements = getFocusableElements(otherContent);
        otherFocusableElements.forEach(el => {
             if (el.getAttribute('tabindex') !== '-1') {
                 if (!el.dataset.originalTabindex) { el.dataset.originalTabindex = el.getAttribute('tabindex') || ''; }
             }
             el.setAttribute('tabindex', '-1');
        });
        // Start collapse animation.
        otherContent.style.maxHeight = otherContent.scrollHeight + 'px';
        requestAnimationFrame(() => {
            otherContent.style.maxHeight = '0';
            otherContent.style.opacity = '0';
        });
        // Set display to none after transition.
        const otherHandleTransitionEnd = () => {
             if (!otherChapter.classList.contains('active')) { otherContent.style.display = 'none'; }
             otherContent.removeEventListener('transitionend', otherHandleTransitionEnd);
        };
        otherContent.addEventListener('transitionend', otherHandleTransitionEnd);
      }
    }
  });

  // --- LOGIC TO OPEN THE CLICKED CHAPTER ---
  chapterDiv.classList.add('active');
  heading.setAttribute('aria-expanded', 'true');
  content.setAttribute('aria-hidden', 'false');

  // --- Start Expand Animation ---
  // 1. Make the content visible but with 0 height so we can measure its full height.
  content.style.display = 'block';
  content.style.maxHeight = '0';
  content.style.opacity = '0';
  
  // 2. Use requestAnimationFrame to ensure the browser has applied the 'display: block' and can calculate scrollHeight correctly.
  requestAnimationFrame(() => {
      // 3. Get the natural height of the content.
      const naturalHeight = content.scrollHeight;
      // 4. Set max-height to the natural height to trigger the expansion animation.
      content.style.maxHeight = naturalHeight + 'px';
      content.style.opacity = '1'; // Fade in simultaneously.

      // --- Restore Focusability ---
      const focusableElements = getFocusableElements(content);
      focusableElements.forEach(el => {
           const originalTabindex = el.dataset.originalTabindex;
           if (originalTabindex !== undefined) { // Check if the data attribute was set.
               // Restore the original tabindex value.
               el.setAttribute('tabindex', originalTabindex === '' ? '0' : originalTabindex);
               delete el.dataset.originalTabindex; // Clean up the data attribute.
           }
      });

      // 5. After the transition ends, remove the max-height property. This allows the content
      //    to resize dynamically if the window size changes.
      const handleOpenTransitionEnd = () => {
            if (chapterDiv.classList.contains('active')) {
               content.style.maxHeight = 'none';
               content.style.overflow = ''; // Restore default overflow.
            }
           content.removeEventListener('transitionend', handleOpenTransitionEnd); // Clean up.
       };
       content.addEventListener('transitionend', handleOpenTransitionEnd);
  });

  // --- Scrolling and Focusing for better UX ---
  // Use a short timeout to ensure the scroll happens after the animation has started.
  setTimeout(() => {
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Use another short timeout to set focus after the scroll has settled.
     setTimeout(() => {
        if (chapterDiv.classList.contains('active')) {
             heading.focus({ preventScroll: true }); // Set focus without causing another scroll.
        }
    }, 300);
  }, 50);
}
