// Implemented 28. Text Animation(line 219) and 29. Average Speed Tracker (line 193)

// Event listeners for keyboard input and the reset button:
document.addEventListener("DOMContentLoaded", () => {

    // Random passages to type, with a variety of common words and punctuation to make the test more realistic and engaging:
    const passages = [
        "Did you know that every time 60 seconds pass, a minute passes?",
        "The better you get the hang of typing without looking at the keyboard, the faster you will become.",
        "Keep a consistent practice schedule to see the best results for typing. Have the correct hand position and posture to avoid fatigue and injury.",
        "Look at your progress regularly and you'll see improvements over time.",
        "Just focus on one thing at a time. Don't worry about speed or accuracy, just focus on typing the text correctly. Speed will come with time and practice.",
        "Practice does have to be perfect or else you fail the entire thing."
    ];

    // Constants for localStorage key and border colors to follow rubric:
    const SCORES_STORAGE_KEY = "typingTestTopScores";
    const ATTEMPTS_STORAGE_KEY = "typingTestRecentWpmAttempts";

    const DEFAULT_BORDER_COLOR = "grey";
    const ACTIVE_BORDER_COLOR = "#3f7df4";
    const ERROR_BORDER_COLOR = "#e95d0f";
    const SUCCESS_BORDER_COLOR = "#2bb673";

    const testWrapper = document.querySelector(".test-wrapper");
    const testArea = document.querySelector("#test-area");
    const originTextElement = document.querySelector("#origin-text p");
    const resetButton = document.querySelector("#reset");
    const theTimer = document.querySelector(".timer");
    const wpmDisplay = document.querySelector("#wpm");
    const errorsDisplay = document.querySelector("#errors");
    const averageWpmDisplay = document.querySelector("#average-wpm");
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

    // Update the timer and WPM display on each keystroke:
    function updateTimerDisplay() {
        theTimer.textContent = formatTime(elapsedMilliseconds);
    }

    // Update the timer and WPM display on each keystroke:
    function runTimer() {
        elapsedMilliseconds = Date.now() - startTime;
        updateTimerDisplay();
        updateWPM();
    }

    // Change the border color of the test wrapper based on the current state of the test:
    function setWrapperBorder(color) {
        testWrapper.style.borderColor = color;
    }

    // starts running the timer
    function startTimer() {
        if (timerRunning) {
            return;
        }

        startTime = Date.now() - elapsedMilliseconds;
        timerInterval = setInterval(runTimer, 10);
        timerRunning = true;
    }

    // stops the timer and prevents it from being started again until the next test:
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
    function getStoredArray(storageKey) {
        const storedValue = localStorage.getItem(storageKey);

        if (!storedValue) {
            return [];
        }

        try {
            const parsedValue = JSON.parse(storedValue);
            return Array.isArray(parsedValue) ? parsedValue : [];
        } catch (error) {
            return [];
        }
    }

    // Save the provided scores array to localStorage:
    function saveStoredArray(storageKey, values) {
        localStorage.setItem(storageKey, JSON.stringify(values));
    }

    // Render the top scores list on the page, showing a message if there are no scores:
    function getStoredScores() {
        return getStoredArray(SCORES_STORAGE_KEY);
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
        const updatedScores = [
            ...getStoredScores(),
            {
                time: elapsedMilliseconds,
                wpm: calculateWPM(),
                errors: errorCount
            }
        ]
            .sort((firstScore, secondScore) => firstScore.time - secondScore.time)
            .slice(0, 3);

        saveStoredArray(SCORES_STORAGE_KEY, updatedScores);
        renderScores();
    }

    // Get the recent WPM attempts from localStorage, or return an empty array if none exist:
    function getRecentAttempts() {
        return getStoredArray(ATTEMPTS_STORAGE_KEY);
    }

    // Save the provided WPM attempt to localStorage, keeping only the 5 most recent attempts:
    function saveRecentAttempt(wpm) {
        const updatedAttempts = [...getRecentAttempts(), wpm].slice(-5);
        saveStoredArray(ATTEMPTS_STORAGE_KEY, updatedAttempts);
        renderAverageWPM();
    }

    // Here us where 29. Average Speed Tracker is implemented. Calculate the average WPM from the recent attempts and update the display:
    function renderAverageWPM() {
        const attempts = getRecentAttempts();

        if (attempts.length === 0) {
            averageWpmDisplay.textContent = "0";
            return;
        }

        const total = attempts.reduce((sum, attempt) => sum + attempt, 0);
        const average = Math.round(total / attempts.length);
        averageWpmDisplay.textContent = average;
    }

    // Render the current passage on the page, wrapping each character in a span for styling based on user input:
    function renderPassage() {
        originTextElement.innerHTML = "";

        [...currentPassage].forEach((character) => {
            const span = document.createElement("span");
            span.textContent = character;
            span.className = "remaining-char";
            originTextElement.appendChild(span);
        });
    }

    // Here is where 28. Text Animation is implemented. Update the styling of each character in the passage based on whether it has been typed correctly, incorrectly, or is the current character to be typed:
    function updateOriginTextAnimation(typedText) {
        const characterSpans = originTextElement.querySelectorAll("span");
        let firstMismatchIndex = -1;

        for (let index = 0; index < typedText.length; index += 1) {
            if (typedText[index] !== currentPassage[index]) {
                firstMismatchIndex = index;
                break;
            }
        }

        characterSpans.forEach((span, index) => {
            span.className = "remaining-char";

            if (typedText === currentPassage) {
                span.className = "typed-correct";
                return;
            }

            if (firstMismatchIndex === -1) {
                if (index < typedText.length) {
                    span.className = "typed-correct";
                } else if (index === typedText.length) {
                    span.className = "current-char";
                }
            } else {
                if (index < firstMismatchIndex) {
                    span.className = "typed-correct";
                } else if (index === firstMismatchIndex) {
                    span.className = "typed-incorrect current-char";
                }
            }
        });

        if (typedText.length === 0 && characterSpans.length > 0) {
            characterSpans[0].className = "current-char";
        }
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
        renderPassage();
        updateOriginTextAnimation("");
    }

    // Handle the user's input on each keystroke, updating the timer, WPM, error count, and passage styling accordingly: Text animation is handled by updateOriginTextAnimation
    function handleTyping() {
        const typedText = testArea.value;
        const typedLength = typedText.length;
        const matchingText = currentPassage.substring(0, typedLength);

        if (typedLength > 0 && !timerRunning) {
            startTimer();
        }

        updateOriginTextAnimation(typedText);

        if (typedText === currentPassage) {
            stopTimer();
            updateTimerDisplay();
            updateWPM();
            setWrapperBorder(SUCCESS_BORDER_COLOR);
            testArea.disabled = true;
            saveScore();
            saveRecentAttempt(calculateWPM());
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

    // Reset the passage to start a new test, and reset all relevant variables and displays to their initial state:
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
    renderAverageWPM();
    resetTest();
});