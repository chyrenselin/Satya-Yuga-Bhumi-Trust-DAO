/**
 * @file print.js
 * @description This file contains functionality related to the print version of the page.
 * It sets a CSS custom property with the current date, which is then used in the print stylesheet
 * to display the print date.
 */

/**
 * @function setPrintDate
 * @description Generates the current date and sets it as a CSS custom property (`--print-date`)
 * on the root element. This allows the print stylesheet to display the date using CSS content.
 */
function setPrintDate() {
    const date = new Date().toLocaleDateString(document.documentElement.lang || 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    // Sets the --print-date CSS custom property for use in the print stylesheet.
     document.documentElement.style.setProperty('--print-date', `'${date}'`);
     console.log(`Set --print-date CSS variable to "${date}" for print stylesheet.`);

    // The corresponding CSS rule is defined in the print stylesheet.
}
