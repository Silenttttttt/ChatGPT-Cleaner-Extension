document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('isActive', function(data) {
        const isActive = (data.isActive !== undefined) ? data.isActive : false;  // Default to false if undefined
        const btn = document.getElementById('toggleBtn');
        
        btn.textContent = isActive ? 'Deactivate' : 'Activate';
        
        btn.addEventListener('click', function() {
            const newState = btn.textContent === 'Activate';
            chrome.storage.local.set({ 'isActive': newState });
            chrome.runtime.sendMessage({ toggle: true, newState: newState });
            btn.textContent = newState ? 'Deactivate' : 'Activate';
        });
    });
});



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.toggle === true) {
            const btn = document.getElementById('toggleBtn');
            btn.textContent = (btn.textContent === 'Activate') ? 'Deactivate' : 'Activate';
        }
    }
);
