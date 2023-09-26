document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('isActive', function(data) {
        const isActive = (data.isActive !== undefined) ? data.isActive : false;
        const btn = document.getElementById('toggleBtn');

        btn.textContent = isActive ? 'Deactivate' : 'Activate';

        btn.addEventListener('click', function() {
            const newState = btn.textContent === 'Activate';
            chrome.storage.local.set({ 'isActive': newState });
            
            // Send message to background script to broadcast the state change
            chrome.runtime.sendMessage({ action: newState ? 'activate' : 'deactivate' });

            btn.textContent = newState ? 'Deactivate' : 'Activate';
        });

        // Reset button logic
        const resetBtn = document.getElementById('resetBtn');

        resetBtn.addEventListener('click', function() {
            // Get the currently active tab
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                let currentTab = tabs[0];
                if (currentTab) {
                    // Execute script within the context of the active tab's page using Manifest V3 API
                    chrome.scripting.executeScript({
                        target: { tabId: currentTab.id },
                        func: clearLocalStorageItems
                    }, (injectionResults) => {
                        for (const frameResult of injectionResults) {
                            if (frameResult.error) {
                                console.error(`Failed to inject script into frame ${frameResult.frameId}: ${frameResult.error.message}`);
                            } else {
                                resetBtn.textContent = "Reset Successful!";
                                setTimeout(function() {
                                    resetBtn.textContent = "Reset Local Data";
                                }, 1000);
                            }
                        }
                    });
                }
            });
        });
    });
});

function clearLocalStorageItems() {
    localStorage.removeItem('lastResetTime');
    localStorage.removeItem('messageCounter');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.toggle === true) {
        const btn = document.getElementById('toggleBtn');
        btn.textContent = (btn.textContent === 'Activate') ? 'Deactivate' : 'Activate';
    }
});
