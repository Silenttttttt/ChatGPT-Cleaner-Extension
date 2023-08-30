const removeElements = () => {
    const elements = [...document.querySelectorAll("[data-testid^='conversation-turn-']")];
    const elementsToDelete = elements.length - 50;

    for (let i = 0; i < elementsToDelete; i++) {
        elements[i].remove();
    }
}

removeElements();
setInterval(removeElements, 300000);  // Run every 5 minutes (300000 milliseconds)
