/**
 * @file accessibility.js
 * @description Enhances keyboard navigation accessibility by adding a 'using-keyboard' class to the body when the user interacts with the page via keyboard.
 * This allows for distinct focus styles for keyboard users versus mouse users, improving the visual experience for all.
 */

/**
 * @function
 * @name anony-mouse-event
 * @description Removes the 'using-keyboard' class on mouse down.
 * @param {event} mousedown - The event object.
 */
document.body.addEventListener('mousedown', () => {
    document.body.classList.remove('using-keyboard');
}, true);

/**
 * @function
 * @name anony-key-event
 * @description Adds the 'using-keyboard' class on key down.
 * @param {event} keydown - The event object.
 */
document.body.addEventListener('keydown', (event) => {
    if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) {
        document.body.classList.add('using-keyboard');
    }
}, true);
