// This script handles the accordion functionality for the FAQ page.

// Wait for the initial HTML document to be fully loaded and parsed before running the script.
document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with the class 'faq-item'. Each of these is a question-answer pair.
    const faqItems = document.querySelectorAll('.faq-item');

    // Iterate over each FAQ item to attach an event listener to it.
    faqItems.forEach(item => {
        // Find the question and answer elements within the current item.
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        // Only proceed if both the question and answer elements exist.
        if (question && answer) {
            // Add a click event listener to the question part of the item.
            question.addEventListener('click', () => {
                // --- Close other active items ---
                // This part ensures that only one FAQ item is open at a time.
                faqItems.forEach(otherItem => {
                    // Check if the item is NOT the one we just clicked AND if it's currently open.
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        // Remove the 'active' class to change the icon back from '×' to '+'.
                        otherItem.classList.remove('active');
                        // Get the answer panel of the other item.
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        // Collapse the other answer panel by setting its max-height back to null (or 0).
                        otherAnswer.style.maxHeight = null;
                    }
                });

                // --- Toggle the current item ---
                // Add or remove the 'active' class on the clicked item.
                item.classList.toggle('active');
                
                // Check if the item is now active (i.e., it was just opened).
                if (item.classList.contains('active')) {
                    // To make the CSS transition work, we set the max-height to the full height of the content.
                    // 'answer.scrollHeight' gives us the total height of the hidden content.
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    // If the item is not active (i.e., it was just closed), collapse it by resetting max-height.
                    answer.style.maxHeight = null;
                }
            });
        }
    });
});
