// Constants
const RESET_INTERVAL = 3 * 60 * 60 * 1000;  // 3 hours
const CHECK_INTERVAL = 5 * 1000;  // 5 seconds


// Function to check if GPT-4 label exists
const checkForGPT4 = () => {
    const gptLabel = document.querySelector('div.flex.flex-1.flex-grow.items-center.gap-1.p-1.text-gray-600.dark\\:text-gray-200.sm\\:justify-center.sm\\:p-0 > span');
    console.log('Detected element:', gptLabel);

  //  const gptLabel = document.querySelector('div.flex.flex-1.flex-grow.items-center.gap-1.p-1.text-gray-600.dark\\:text-gray-200.sm\\:justify-center.sm\\:p-0 > span');
    console.log('Checking for GPT-4 label...');
    return gptLabel && gptLabel.innerText === 'GPT-4';
};

// Function to check for error in the response message
const checkForErrorMessage = () => {
    const errorMessage = document.querySelector(".text-red-500");
    if (errorMessage && errorMessage.textContent.includes("Only one message at a time")) {
        console.log('Error detected in response. Not incrementing counter.');
        return true;
    }
    return false;
};

// Function to display the message counter
const displayCounter = (messageCounter) => {
    console.log(`Displaying counter: ${messageCounter}`);
    const counterDisplay = document.getElementById('messageCounterDisplay');
    if (counterDisplay) {
        const resetTime = new Date(parseInt(localStorage.getItem('lastResetTime')) + RESET_INTERVAL);
        const formattedTime = `${resetTime.getHours()}:${resetTime.getMinutes().toString().padStart(2, '0')}:${resetTime.getSeconds().toString().padStart(2, '0')}`;
        counterDisplay.textContent = `Message exchanges: ${messageCounter}. Reset at: ${formattedTime}`;
    }
    localStorage.setItem('messageCounter', messageCounter);
};

// Timer function
const startTimer = (messageCounter) => {
    console.log('Starting timer...');
    const checkAndReset = () => {
        const currentTime = new Date().getTime();
        if (currentTime - localStorage.getItem('lastResetTime') >= RESET_INTERVAL) {
            console.log('Time exceeded. Resetting counter.');
            if (parseInt(localStorage.getItem('messageCounter') || "0") === 0) {
                console.log('No messages. Resetting timer immediately.');
                localStorage.setItem('lastResetTime', currentTime);
            }
            messageCounter = 0;
            displayCounter(messageCounter);
            localStorage.setItem('lastResetTime', currentTime);
            // Return true to indicate that reset happened
            return true;
        }
        return false;
    };

    // Check for reset on page load
    if (!checkAndReset()) {
        // If reset did not happen, start a timer for the remaining duration
        const timeSinceLastReset = new Date().getTime() - localStorage.getItem('lastResetTime');
        const remainingTime = RESET_INTERVAL - timeSinceLastReset;

        setTimeout(() => {
            checkAndReset();
            // After the timeout, start a regular interval to check every RESET_INTERVAL
            setInterval(checkAndReset, RESET_INTERVAL);
        }, remainingTime);
    } else {
        // If reset happened immediately, start a regular interval
        setInterval(checkAndReset, RESET_INTERVAL);
    }
};


// Function to handle new response messages
const handleNewResponse = () => {
    if (!checkForErrorMessage()) {
        let messageCounter = parseInt(localStorage.getItem('messageCounter') || "0") + 1;  // Adding 1 for the user message
        displayCounter(messageCounter);
    }
};

// Function to handle Save & Submit button click
const handleSaveSubmitClick = (event) => {
    const targetElement = event.target;
    const saveSubmitButton = targetElement.closest("button.btn-primary");
    
    if (saveSubmitButton) {
        console.log('Save & Submit button clicked. Incrementing counter.');
        let messageCounter = parseInt(localStorage.getItem('messageCounter') || "0") + 1;
        displayCounter(messageCounter);
    }
};

// Function to inject counter display
const injectCounterDisplay = (messageCounter) => {
    console.log('Injecting counter display...');
    const counterDiv = document.createElement('div');
    counterDiv.className = "flex items-center md:items-end mr-4";
    counterDiv.innerHTML = `
        <div data-projection-id="44" style="opacity: 1;">
            <div id="messageCounterDisplay" class="text-sm text-gray-600 dark:text-gray-300">
                Message exchanges: ${messageCounter}
            </div>
        </div>
    `;

    const targetDiv = document.querySelector(".h-full.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-4.gap-0.md\\:gap-2.justify-center");
    if (targetDiv) {
        targetDiv.insertBefore(counterDiv, targetDiv.firstChild);
    }
};

// Function to initialize observer
const initObserver = () => {
    console.log('Initializing observer...');
    
    const firstMessage = document.querySelector("[data-testid^='conversation-turn-']");
    const chatArea = firstMessage ? firstMessage.parentElement : null;

    if (chatArea) {
        const chatObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.matches("[data-testid^='conversation-turn-']")) {
                            const messageId = parseInt(node.getAttribute('data-testid').replace('conversation-turn-', ''), 10);
                            if (messageId % 2 === 0) {  // Check if it's an even message, meaning a response
                                handleNewResponse();
                            }
                        }
                    });
                }
            });
        });
        chatObserver.observe(chatArea, { childList: true });
    } else {
        console.log('Chat area not found. Retrying in 1 second...');
        setTimeout(initObserver, 1000);
    }
};

// Periodic check to ensure counter display exists
const ensureCounterExists = () => {
    setInterval(() => {
       // console.log('Checking if counter display exists...');
        const counterDisplay = document.getElementById('messageCounterDisplay');
        if (!counterDisplay) {
            console.log('Counter display missing! Re-injecting...');
            const messageCounter = localStorage.getItem('messageCounter') || 0;
            injectCounterDisplay(messageCounter);
        }
    }, CHECK_INTERVAL);
};


// Updated function to add event listener
const addSaveSubmitListener = () => {
    // Using event delegation to detect button click
    document.body.addEventListener('click', handleSaveSubmitClick);
};

// Main code execution
// Add a delay before checking for GPT-4 label
setTimeout(() => {
    if (checkForGPT4()) {
        console.log('GPT-4 label found. Initializing message counter...');
        let messageCounter = localStorage.getItem('messageCounter') || 0;
        injectCounterDisplay(messageCounter);
        initObserver();
        
        if (!localStorage.getItem('lastResetTime')) {
            localStorage.setItem('lastResetTime', new Date().getTime());
        }

        // Always start the timer regardless of whether 'lastResetTime' exists
        startTimer(messageCounter);
        
        ensureCounterExists();
        addSaveSubmitListener();
    }
}, 5000);