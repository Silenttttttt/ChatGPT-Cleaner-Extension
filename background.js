chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Relay the message to all tabs
    if (message.action === 'activate' || message.action === 'deactivate') {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, { action: message.action });
            }
        });
    }
});
