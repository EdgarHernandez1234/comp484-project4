
// Event listeners for keyboard input and the reset button:
document.addEventListener("DOMContentLoaded", () => {
    // Random passages to type, with a variety of common words and punctuation to make the test more realistic and engaging:
    const passages = [
        "The quick brown fox jumps over the lazy dog while a gentle breeze moves through the trees behind the house.",
        "Learning to type with accuracy first and speed second usually leads to stronger results and much better habits over time.",
        "A small routine repeated every day can create impressive progress when you stay patient, focused, and consistent.",
        "Creative projects become easier to finish when you break the work into clear steps and celebrate each small win.",
        "Good user experiences come from thoughtful details, helpful feedback, and interfaces that respond clearly to every action.",
        "Practice does not need to be perfect to be useful, but it should be steady enough to help you improve week after week."
    ];
    
    // Constants for localStorage key and border colors to follow rubric:
    const STORAGE_KEY = "typingTestTopScores";
    const DEFAULT_BORDER_COLOR = "grey";
    const ACTIVE_BORDER_COLOR = "#3f7df4";
    const ERROR_BORDER_COLOR = "#e95d0f";
    const SUCCESS_BORDER_COLOR = "#2bb673";

    const testWrapper = document.querySelector(".test-wrapper");
    const testArea = document.querySelector("#test-area");
    const originTextElement = document.querySelector("#origin-text p"); // The passage to type is displayed in a paragraph element within the #origin-text container.
    const resetButton = document.querySelector("#reset");
    const theTimer = document.querySelector(".timer");
    const wpmDisplay = document.querySelector("#wpm");
    const errorsDisplay = document.querySelector("#errors");
    const topScoresList = document.querySelector("#top-scores");

    let timerInterval = null;
    let startTime = null;
    let elapsedMilliseconds = 0;
    let timerRunning = false;
    let errorCount = 0;
    let mistakeActive = false;
    let currentPassage = "";
    let previousPassageIndex = -1;

    // Add leading zero to numbers 9 or below (purely for aesthetics):
    function padTime(value) {
        return String(value).padStart(2, "0");
    }
    
    // Run a standard minute/second/hundredths timer:
    function formatTime(milliseconds) {
        const totalHundredths = Math.floor(milliseconds / 10);
        const minutes = Math.floor(totalHundredths / 6000);
        const seconds = Math.floor((totalHundredths % 6000) / 100);
        const hundredths = totalHundredths % 100;

        return `${padTime(minutes)}:${padTime(seconds)}:${padTime(hundredths)}`;
    }
    // Run a standard minute/second/hundredths timer:
    function updateTimerDisplay() {
        theTimer.textContent = formatTime(elapsedMilliseconds);
    }
    
    // Update the timer and WPM display on each keystroke:
    function runTimer() {
        elapsedMilliseconds = Date.now() - startTime;
        updateTimerDisplay();
        updateWPM();
    }
    
    // Change the border color of the test wrapper based on the typing state:
    function setWrapperBorder(color) {
        testWrapper.style.borderColor = color;
    }
    
    // Standard timer:
    function startTimer() {
        if (timerRunning) {
            return;
        }

        startTime = Date.now() - elapsedMilliseconds;
        timerInterval = setInterval(runTimer, 10);
        timerRunning = true;
    }

    // Stop the timer and prevent it from running multiple times:
    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        timerRunning = false;
    }

    // Calculate WPM based on the number of characters typed and the elapsed time:
    function calculateWPM() {
        if (elapsedMilliseconds <= 0) {
            return 0;
        }

        const totalSeconds = elapsedMilliseconds / 1000;
        const totalCharacters = testArea.value.length;
        const wordsTyped = totalCharacters / 5;
        return Math.round(wordsTyped / (totalSeconds / 60));
    }

    // Update the WPM display:
    function updateWPM() {
        wpmDisplay.textContent = calculateWPM();
    }

    // Update the error count display:
    function updateErrors() {
        errorsDisplay.textContent = errorCount;
    }
    
    // Retrieve stored scores from localStorage, or return an empty array if none exist:
    function getStoredScores() {
        const storedScores = localStorage.getItem(STORAGE_KEY);

        if (!storedScores) {
            return [];
        }

        try {
            const parsedScores = JSON.parse(storedScores);
            return Array.isArray(parsedScores) ? parsedScores : [];
        } catch (error) {
            return [];
        }
    }

    // Save the provided scores array to localStorage:
    function saveScores(scores) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    }

    // Render the top scores list on the page, showing a message if there are no scores:
    function renderScores() {
        const scores = getStoredScores();
        topScoresList.innerHTML = "";

        if (scores.length === 0) {
            topScoresList.innerHTML = `
                <li>No scores yet</li>
                <li>Finish a round to save one</li>
                <li>Your results stay after refresh</li>
            `;
            return;
        }

        scores.forEach((score) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${formatTime(score.time)} · ${score.wpm} WPM · ${score.errors} errors`;
            topScoresList.appendChild(listItem);
        });
    }

    // Save the current score to localStorage, keeping only the top 3 scores sorted by time:
    function saveScore() {
        const updatedScores = [...getStoredScores(), {
            time: elapsedMilliseconds,
            wpm: calculateWPM(),
            errors: errorCount
        }]
            .sort((firstScore, secondScore) => firstScore.time - secondScore.time)
            .slice(0, 3);

        saveScores(updatedScores);
        renderScores();
    }

    // Choose a random passage from the array and ensure it's not the same as the previous one:
    function chooseRandomPassage() {
        let randomIndex = Math.floor(Math.random() * passages.length);

        if (passages.length > 1) {
            while (randomIndex === previousPassageIndex) {
                randomIndex = Math.floor(Math.random() * passages.length);
            }
        }

        previousPassageIndex = randomIndex;
        currentPassage = passages[randomIndex];
        originTextElement.textContent = currentPassage;
    }
    
    // Match the text entered with the provided text on the page:
    function handleTyping() {
        const typedText = testArea.value;
        const typedLength = typedText.length;
        const matchingText = currentPassage.substring(0, typedLength);

        if (typedLength > 0 && !timerRunning) {
            startTimer();
        }

        if (typedText === currentPassage) {
            stopTimer();
            updateTimerDisplay();
            updateWPM();
            setWrapperBorder(SUCCESS_BORDER_COLOR);
            testArea.disabled = true;
            saveScore();
            mistakeActive = false;
            return;
        }

        if (typedText === matchingText) {
            setWrapperBorder(typedLength === 0 ? DEFAULT_BORDER_COLOR : ACTIVE_BORDER_COLOR);
            mistakeActive = false;
        } else {
            setWrapperBorder(ERROR_BORDER_COLOR);

            if (!mistakeActive) {
                errorCount += 1;
                updateErrors();
                mistakeActive = true;
            }
        }

        updateWPM();
    }
    
    // Reset everything:
    function resetTest() {
        stopTimer();
        elapsedMilliseconds = 0;
        startTime = null;
        errorCount = 0;
        mistakeActive = false;

        testArea.value = "";
        testArea.disabled = false;
        updateTimerDisplay();
        updateErrors();
        updateWPM();
        setWrapperBorder(DEFAULT_BORDER_COLOR);
        chooseRandomPassage();
        testArea.focus();
    }

    testArea.addEventListener("input", handleTyping);
    resetButton.addEventListener("click", resetTest);

    renderScores();
    resetTest();
});