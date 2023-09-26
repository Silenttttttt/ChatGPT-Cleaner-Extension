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

// Function to display the timer and message counter on the webpage
const displayCounterAndTimer = () => {
    console.log('Displaying counter and timer...');

    // Get the counter display element from the webpage
    const counterDisplay = document.getElementById('messageCounterDisplay');
    const messageCounter = parseInt(localStorage.getItem('messageCounter') || "0");
    
    if (counterDisplay) {
        // Calculate the time the counter will reset
        const resetTime = new Date(parseInt(localStorage.getItem('lastResetTime')) + RESET_INTERVAL);
        
        // Format the time in HH:MM:SS format
        const formattedTime = `${resetTime.getHours()}:${resetTime.getMinutes().toString().padStart(2, '0')}:${resetTime.getSeconds().toString().padStart(2, '0')}`;
        
        // Set the inner HTML with message count and reset time in separate divs
        counterDisplay.innerHTML = `
            <div>Message count: ${messageCounter}</div>
            <div>Reset at: ${formattedTime}</div>
        `;
    }
};



// Timer function to periodically check and reset the counter
const startTimer = () => {
    console.log('Starting timer...');
    
    // Function to check and reset the message counter based on time conditions
    const checkAndReset = () => {
        // Get the current time
        const currentTime = new Date().getTime();
        // Check if the time elapsed since the last reset exceeds the reset interval
        if (currentTime - parseInt(localStorage.getItem('lastResetTime')) >= RESET_INTERVAL) {
            console.log('Time exceeded. Resetting counter.');
            // Reset the message counter to 0
            localStorage.setItem('messageCounter', "0");
            localStorage.setItem('lastResetTime', currentTime.toString());
            displayCounterAndTimer();
            return true;  // Return true indicating a reset happened
        }
        return false;  // Return false indicating no reset happened
    };

    // Initial check for a reset on page load
    if (!checkAndReset()) {
        const timeSinceLastReset = new Date().getTime() - parseInt(localStorage.getItem('lastResetTime'));
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
        let messageCounter = parseInt(localStorage.getItem('messageCounter') || "0");
        messageCounter++;  // Increment the message counter by 1
        localStorage.setItem('messageCounter', messageCounter.toString());
        
        displayCounterAndTimer();
    }
};

// Function to handle clicks on the 'Save & Submit', 'Continue Generating', and 'Regenerate' buttons.
const handleButtonClick = (event) => {
    const targetElement = event.target;

    // Check if the clicked element or its closest parent is the "Save & Submit" button.
    if (targetElement.closest("button.btn-primary")) {
        console.log('Save & Submit button clicked. Incrementing counter.');
        let messageCounter = parseInt(localStorage.getItem('messageCounter') || "0");
        messageCounter++;  // Increment the message counter by 1
        localStorage.setItem('messageCounter', messageCounter.toString());
        
        displayCounterAndTimer();
        return; // Exit function early since this button's action is already handled.
    }

    // Check if the clicked element or its closest parent is the "Continue Generating" or "Regenerate" button.
    const actionButton = targetElement.closest("button.btn-neutral");
    if (actionButton && (actionButton.innerText.includes("Continue generating") || actionButton.innerText.includes("Regenerate"))) {
        console.log(`${actionButton.innerText} button clicked. Incrementing counter.`);
        let messageCounter = parseInt(localStorage.getItem('messageCounter') || "0");
        messageCounter++;  // Increment the message counter by 1
        localStorage.setItem('messageCounter', messageCounter.toString());
        
        displayCounterAndTimer();
    }
};

// Function to inject the message counter display into the web page.
const injectCounterAndTimerDisplay = () => {
    console.log('Injecting counter and timer display...');
    
    const counterDiv = document.createElement('div');
    counterDiv.className = "flex items-center md:items-end mr-4";
    counterDiv.innerHTML = `
        <div data-projection-id="44" style="opacity: 1;">
            <div id="messageCounterDisplay" class="text-md text-gray-600 dark:text-gray-300"></div> 

        </div>
    `;

    const targetDiv = document.querySelector(".h-full.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-4.gap-0.md\\:gap-2.justify-center");
    if (targetDiv) {
        targetDiv.insertBefore(counterDiv, targetDiv.firstChild);
    }
    
    displayCounterAndTimer();
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

// Periodically check to ensure that the message counter and timer display are still visible on the page.
const ensureDisplayExists = () => {
    setInterval(() => {
        // Check if the counter and timer display element is present.
        const counterDisplay = document.getElementById('messageCounterDisplay');
        if (!counterDisplay) {
            console.log('Counter and timer display missing! Re-injecting...');
            // If not present, re-inject the counter and timer display.
            injectCounterAndTimerDisplay();
        }
    }, CHECK_INTERVAL);
};

// Function to add a click event listener to the entire body to detect button clicks.
const addClickListener = () => {
    document.body.addEventListener('click', handleButtonClick);
};




// Function to calculate tokens based on text length
const calculateTokens = (text) => {
    return Math.ceil(text.length / 4);
}

// Main function to add turn numbers and apply the required styling
const addMessageNumbers = () => {
    console.log("addMessageNumbers called");

    const elements = [...document.querySelectorAll("[data-testid^='conversation-turn-']")].reverse();
    console.log("Number of elements found:", elements.length);

    let tokenCount = 0;
    let messageNumbers = [];

    for (let element of elements) {
        // Skip if the element already has a messageNumber
        if (element.querySelector(".messageNumber")) {
            continue;
        }

        // Extract message turn number from the data-testid attribute
        const testId = element.getAttribute('data-testid');
        const turnNumber = parseInt(testId.replace('conversation-turn-', ''), 10);

        let targetAvatarContainer = null;

        // if (True) { // Odd, for SVG avatar
        targetAvatarContainer = element.querySelector("div[style*='background-color']").parentElement;
        // } else { // Even, for Image avatar
        //     targetAvatarContainer = element.querySelector("img[alt='User']").parentElement;

        //     // Rename class for the avatar container when it's an image
        //     targetAvatarContainer.className = "customRelative";
        // }

        if (!targetAvatarContainer) {
            console.warn("No avatar container found for element:", element);
            continue;
        }

        // Calculate the token count for the current element
        tokenCount += calculateTokens(element.textContent);

        // Create a new <span> element
        let numberSpan = document.createElement("span");
        // Add text content to the span indicating the current message number
        numberSpan.textContent = `#${turnNumber}`;

        // Add a class to the span for styling purposes
        numberSpan.classList.add("messageNumber");
        messageNumbers.push({ span: numberSpan, tokens: tokenCount });

        // Insert the new span at the beginning of the avatar container
        targetAvatarContainer.insertBefore(numberSpan, targetAvatarContainer.firstChild);
    }

    for (let item of messageNumbers) {
        if (item.tokens > 4000) {
            item.span.classList.add("fourThousandTokenMarker");
        }
    }
}


const injectCSS = () => {
    // Create a new <style> element
    const style = document.createElement('style');
    // Define the styles for our message numbers
    style.innerHTML = `
        .messageNumber {
            font-weight: bold;
            color: white;
            display: block;
            margin-bottom: 5px; // Add spacing between the counter and the avatar
            position: absolute;
            top: 0;
            left: 0;
            z-index: 10; // Ensure the message number appears on top
        }

        .fourThousandTokenMarker {
            color: yellow;
        }

        .customRelative {
            position: relative;
        }
    `;
    // Add the style to the document's head
    document.head.appendChild(style);
}





// const MessageNumbersadder = () => {
//     injectCSS();         // Inject the CSS first
//     addMessageNumbers(); // Then call the function to add message numbers
// }

// setInterval(MessageNumbersadder, 3000);






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
                displayCounterAndTimer();
                initObserver();
                
                if (!localStorage.getItem('lastResetTime')) {
                    // If there's no last reset time stored, initialize it.
                    localStorage.setItem('lastResetTime', new Date().getTime());
                }
        
                // Always start the reset timer, regardless of whether 'lastResetTime' exists.
                startTimer(messageCounter);
                
                // Ensure the counter display remains on the page.
                ensureDisplayExists();
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
