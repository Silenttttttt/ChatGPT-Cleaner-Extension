const removeTheElements = () => {
    const elements = [...document.querySelectorAll("[data-testid^='conversation-turn-']")];
    const elementsToDelete = elements.length - 30;

    for (let i = 0; i < elementsToDelete; i++) {
        elements[i].remove();
    }
}



const injectButtons = () => {


    if (!document.getElementById('guidedResponseButton')) {
        const guidedButtonDiv = document.createElement('div');
        guidedButtonDiv.className = "flex items-center md:items-end";
        guidedButtonDiv.innerHTML = `
            <div data-projection-id="44" style="opacity: 1;">
                <button id="guidedResponseButton" class="btn relative btn-neutral whitespace-nowrap -z-0 border-0 md:border" as="button">
                    <div class="flex w-full gap-2 items-center justify-center">
                        Guided Response
                    </div>
                </button>
            </div>
        `;

        guidedButtonDiv.querySelector('#guidedResponseButton').addEventListener('click', function() {
            const textarea = document.getElementById('prompt-textarea');
            if (textarea) {
                textarea.value += "\" Begin by outlining the requirements, followed by the proposed solution, and then implement it.";
            }
        });

        const targetDiv = document.querySelector(".h-full.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-4.gap-0.md\\:gap-2.justify-center");
        if (targetDiv) {
            targetDiv.appendChild(guidedButtonDiv);
        }
    }
    if (!document.getElementById('customExtensionButton')) {
        const buttonDiv = document.createElement('div');
        buttonDiv.className = "flex items-center md:items-end";
        buttonDiv.innerHTML = `
            <div data-projection-id="42" style="opacity: 1;">
                <button id="customExtensionButton" class="btn relative btn-neutral whitespace-nowrap -z-0 border-0 md:border" as="button">
                    <div class="flex w-full gap-2 items-center justify-center">
                        Provide full code
                    </div>
                </button>
            </div>
        `;

        buttonDiv.querySelector('#customExtensionButton').addEventListener('click', function() {
            const textarea = document.getElementById('prompt-textarea');
            if (textarea) {
                textarea.value += " \" Please Provide the full complete updated code with no omissions.";
            }
        });

        const targetDiv = document.querySelector(".h-full.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-4.gap-0.md\\:gap-2.justify-center");
        if (targetDiv) {
            targetDiv.appendChild(buttonDiv);
        }
    }

    if (!document.getElementById('cleanupChatButton')) {
        const cleanupButtonDiv = document.createElement('div');
        cleanupButtonDiv.className = "flex items-center md:items-end";
        cleanupButtonDiv.innerHTML = `
            <div data-projection-id="43" style="opacity: 1;">
                <button id="cleanupChatButton" class="btn relative btn-neutral whitespace-nowrap -z-0 border-0 md:border" as="button">
                    <div class="flex w-full gap-2 items-center justify-center">
                        Cleanup Chat
                    </div>
                </button>
            </div>
        `;

        cleanupButtonDiv.querySelector('#cleanupChatButton').addEventListener('click', function() {
            removeTheElements();
        });

        const targetDiv = document.querySelector(".h-full.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-4.gap-0.md\\:gap-2.justify-center");
        if (targetDiv) {
            targetDiv.appendChild(cleanupButtonDiv);
        }
    }




}

let isActive = false;

chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "activate") {
        isActive = true;
        initInjectButton();  // Call the function to start your logic
    } else if (message.action === "deactivate") {
        isActive = false;
    }
});

function initInjectButton() {
    if (isActive) {
        // Initially call the function to inject buttons
        injectButtons();
        // Set an interval to check and re-inject the buttons every 2 seconds
        setInterval(injectButtons, 2000);
    }
}

// Initial check
chrome.storage.local.get('isActive', function (data) {
    if (data.isActive) {
        isActive = true;
        initInjectButton();
    }
});
