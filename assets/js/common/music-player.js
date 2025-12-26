/**
 * @file music-player.js
 * @description Provides a reusable and robust function to set up and control a simple music player.
 * It handles cross-browser autoplay policies by remembering the user's intent within a session.
 */

/**
 * Attaches play and stop functionality to buttons for a given audio element and handles session-based autoplay.
 * @param {string} audioId The ID of the HTML <audio> element to be controlled.
 */
function setupMusicPlayer(audioId) {
    const audio = document.getElementById(audioId);
    const startButton = document.getElementById('startJourneyBtn');
    const stopButton = document.getElementById('stopMusicBtn');

    if (!audio || !startButton || !stopButton) {
        // Silently return if the necessary elements are not on the page.
        return;
    }

    /**
     * Handles the logic for starting the audio playback and remembering the user's choice.
     */
    function playAudio() {
        if (audio.paused) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Playback started successfully.
                    sessionStorage.setItem('userWantsMusic', 'true');
                    startButton.style.display = 'none';
                    stopButton.style.display = 'inline-block';
                }).catch(error => {
                    // Autoplay was prevented by the browser.
                    // We don't set 'userWantsMusic' because the user hasn't explicitly clicked play yet.
                    console.log('Autoplay was prevented by browser policy.');
                    startButton.style.display = 'inline-block';
                    stopButton.style.display = 'none';
                });
            }
        }
    }

    /**
     * Handles the logic for stopping the audio playback and remembering the user's choice.
     */
    function stopAudio() {
        sessionStorage.setItem('userWantsMusic', 'false');
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            startButton.style.display = 'inline-block';
            stopButton.style.display = 'none';
        }
    }

    // Assign the functions to be executed when the corresponding buttons are clicked.
    startButton.onclick = playAudio;
    stopButton.onclick = stopAudio;

    // --- Session-Based Autoplay Logic ---
    // Check if the user has explicitly stopped the music.
    // If 'userWantsMusic' is 'false', we respect that and do not play.
    // If it is 'true' (already playing) OR null (first visit/default), we attempt to play.
    if (sessionStorage.getItem('userWantsMusic') !== 'false') {
        // Attempt to play the audio automatically.
        // The catch block within playAudio will handle browsers that still block it (e.g., waiting for interaction).
        playAudio();
    } else {
        // Otherwise, ensure the UI is in the "stopped" state.
        startButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
    }
}
