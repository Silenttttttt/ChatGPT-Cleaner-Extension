let isActive = true;  // Initial state

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.toggle === true) {
        isActive = request.newState;

        if (isActive) {
            // Find the currently active tab to execute the script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs.length > 0 && tabs[0].url.includes('chat.openai.com')) {
                    executeContentScript(tabs[0].id);
                }
            });
        }
    }
});

function executeContentScript(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
    });
}

