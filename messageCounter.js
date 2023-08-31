// Constants
const RESET_INTERVAL = 3 * 60 * 60 * 1000;  // Time interval (3 hours) to reset the counter
const CHECK_INTERVAL = 5 * 1000;  // Time interval (5 seconds) to periodically check certain conditions

// Function to check if the GPT-4 label is present on the webpage
const checkForGPT4 = () => {
    // Query the specific HTML element for the GPT-4 label
    const gptLabel = document.querySelector('div.flex.flex-1.flex-grow.items-center.gap-1.p-1.text-gray-600.dark\\:text-gray-200.sm\\:justify-center.sm\\:p-0 > span');
    console.log('Checking for GPT-4 label...');
    return gptLabel && gptLabel.innerText === 'GPT-4';  // Return true if the label exists and its text is 'GPT-4'
};

// Function to check if there's an error in the response message on the webpage
const checkForErrorMessage = () => {
    // Query the specific HTML element for error messages
    const errorMessage = document.querySelector(".text-red-500");
    // Check if the error message element exists and contains a specific error text
    if (errorMessage && errorMessage.textContent.includes("Only one message at a time")) {
        console.log('Error detected in response. Not incrementing counter.');
        return true;
    }
    return false;  // Return false if no error message is detected
};

// Function to display the message counter on the webpage
const displayCounter = (messageCounter) => {
    console.log(`Displaying counter: ${messageCounter}`);
    // Get the counter display element from the webpage
    const counterDisplay = document.getElementById('messageCounterDisplay');
    if (counterDisplay) {
        // Calculate the time the counter will reset
        const resetTime = new Date(parseInt(localStorage.getItem('lastResetTime')) + RESET_INTERVAL);
        // Format the time in HH:MM:SS format
        const formattedTime = `${resetTime.getHours()}:${resetTime.getMinutes().toString().padStart(2, '0')}:${resetTime.getSeconds().toString().padStart(2, '0')}`;
        // Set the counter display element's text content with the current message count and reset time
        counterDisplay.textContent = `Message exchanges: ${messageCounter}. Reset at: ${formattedTime}`;
    }
    // Store the message counter value in the browser's local storage
    localStorage.setItem('messageCounter', messageCounter);
};

// Timer function to periodically check and reset the counter
const startTimer = (messageCounter) => {
    console.log('Starting timer...');
    // Function to check and reset the message counter based on time conditions
    const checkAndReset = () => {
        // Get the current time
        const currentTime = new Date().getTime();
        // Check if the time elapsed since the last reset exceeds the reset interval
        if (currentTime - localStorage.getItem('lastResetTime') >= RESET_INTERVAL) {
            console.log('Time exceeded. Resetting counter.');
            if (parseInt(localStorage.getItem('messageCounter') || "0") === 0) {
                console.log('No messages. Resetting timer immediately.');
                localStorage.setItem('lastResetTime', currentTime);
            }
            // Reset the message counter to 0
            messageCounter = 0;
            displayCounter(messageCounter);
            localStorage.setItem('lastResetTime', currentTime);
            return true;  // Return true indicating a reset happened
        }
        return false;  // Return false indicating no reset happened
    };

    // Initial check for a reset on page load
    if (!checkAndReset()) {
        const timeSinceLastReset = new Date().getTime() - localStorage.getItem('lastResetTime');
        const remainingTime = RESET_INTERVAL - timeSinceLastReset;

        // Start a timer to check for reset after the remaining time from the last reset
        setTimeout(() => {
            checkAndReset();
            // Start a regular interval to check every RESET_INTERVAL
            setInterval(checkAndReset, RESET_INTERVAL);
        }, remainingTime);
    } else {
        // If reset happened immediately, start the regular interval
        setInterval(checkAndReset, RESET_INTERVAL);
    }
};

// Function to handle when a new response message is detected on the webpage
const handleNewResponse = () => {
    if (!checkForErrorMessage()) {
        let messageCounter = parseInt(localStorage.getItem('messageCounter') || "0") + 1;  // Increment the message counter by 1
        displayCounter(messageCounter);
    }
};

// Function to handle clicks on the 'Save & Submit', 'Continue Generating', and 'Regenerate' buttons.
const handleButtonClick = (event) => {
    const targetElement = event.target;

    // Check if the clicked element is closest to the "Save & Submit" button.
    if (targetElement.closest("button.btn-primary")) {
        console.log('Save & Submit button clicked. Incrementing counter.');
        // Get the message counter value from local storage, increment it, and then display.
        let messageCounter = parseInt(localStorage.getItem('messageCounter') || "0") + 1;
        displayCounter(messageCounter);
        return; // Exit function early since this button's action is already handled.
    }

    // Attempt to find the closest parent element matching the selector.
    const closestElement = targetElement.closest(".h-full.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-4.gap-0.md\\:gap-2.justify-center");

    let actionButton;  // Either the "Continue generating" or "Regenerate" button.

    // If the closest element is found, proceed to find the action button within it.
    if (closestElement) {
        actionButton = Array.from(closestElement.querySelectorAll("button")).find(btn => 
            btn.innerText.includes("Continue generating") || btn.innerText.includes("Regenerate")
        );
    }

    // Only execute the following block if the action button is found.
    if (actionButton) {
        console.log(`${actionButton.innerText} button clicked. Incrementing counter.`);
        let messageCounter = parseInt(localStorage.getItem('messageCounter') || "0") + 1;
        displayCounter(messageCounter);
    }
};

// Function to inject the message counter display into the web page.
const injectCounterDisplay = (messageCounter) => {
    console.log('Injecting counter display...');
    // Create a new div element for the counter display.
    const counterDiv = document.createElement('div');
    counterDiv.className = "flex items-center md:items-end mr-4";
    counterDiv.innerHTML = `
        <div data-projection-id="44" style="opacity: 1;">
            <div id="messageCounterDisplay" class="text-sm text-gray-600 dark:text-gray-300">
                Message exchanges: ${messageCounter}
            </div>
        </div>
    `;

    // Insert the created counter display element at the beginning of the target div.
    const targetDiv = document.querySelector(".h-full.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-4.gap-0.md\\:gap-2.justify-center");
    if (targetDiv) {
        targetDiv.insertBefore(counterDiv, targetDiv.firstChild);
    }
};

// Function to initialize an observer that detects new messages in the chat area.
const initObserver = () => {
    console.log('Initializing observer...');
    
    // Identify the first message in the chat area.
    const firstMessage = document.querySelector("[data-testid^='conversation-turn-']");
    const chatArea = firstMessage ? firstMessage.parentElement : null;

    if (chatArea) {
        // Create an observer to monitor changes (additions) in the chat area.
        const chatObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.matches("[data-testid^='conversation-turn-']")) {
                            const messageId = parseInt(node.getAttribute('data-testid').replace('conversation-turn-', ''), 10);
                            // If the message ID is even, it indicates a response.
                            if (messageId % 2 === 0) {
                                handleNewResponse();
                            }
                        }
                    });
                }
            });
        });
        // Start observing the chat area for changes.
        chatObserver.observe(chatArea, { childList: true });
    } else {
        console.log('Chat area not found. Retrying in 1 second...');
        setTimeout(initObserver, 1000);
    }
};

// Periodically check to ensure that the message counter display is still visible on the page.
const ensureCounterExists = () => {
    setInterval(() => {
        // Check if the counter display element is present.
        const counterDisplay = document.getElementById('messageCounterDisplay');
        if (!counterDisplay) {
            console.log('Counter display missing! Re-injecting...');
            const messageCounter = localStorage.getItem('messageCounter') || 0;
            // If not present, re-inject the counter display.
            injectCounterDisplay(messageCounter);
        }
    }, CHECK_INTERVAL);
};

// Function to add a click event listener to the entire body to detect button clicks.
const addClickListener = () => {
    document.body.addEventListener('click', handleButtonClick);
};


let isActivetoo = false;

chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "activate") {
        isActivetoo = true;
        initMessageCounter();  // Call the function to start your logic
    } else if (message.action === "deactivate") {
        isActivetoo = false;
    }
});

// Main code execution starts here.
// Introduce a delay before checking for the presence of the GPT-4 label
function initMessageCounter() {
    if (isActivetoo) {
        setTimeout(() => {
            if (checkForGPT4()) {
                console.log('GPT-4 label found. Initializing message counter...');
                let messageCounter = localStorage.getItem('messageCounter') || 0;
                // Inject the counter display and initialize the observer.
                injectCounterDisplay(messageCounter);
                initObserver();
                
                if (!localStorage.getItem('lastResetTime')) {
                    // If there's no last reset time stored, initialize it.
                    localStorage.setItem('lastResetTime', new Date().getTime());
                }
        
                // Always start the reset timer, regardless of whether 'lastResetTime' exists.
                startTimer(messageCounter);
                
                // Ensure the counter display remains on the page.
                ensureCounterExists();
                // Add the click event listener.
                addClickListener();
            }
        }, 5000);
    }
}

// Initial check
chrome.storage.local.get('isActive', function (data) {
    if (data.isActive) {
        isActivetoo = true;
        initMessageCounter();
    }
});
