# ChatGPT Cleaner Extension

This browser extension is designed to enhance the user experience on `chat.openai.com`. Its main features include:

1. **Automatic Cleanup**: The extension routinely removes older chat elements to maintain a manageable chat log, ensuring you only see the most recent chat interactions.
1. **Custom User Buttons**: Two main buttons are introduced:

* `Provide full code`: Appends a standard request to the chat input for obtaining full, complete code from GPT-4.
* `Cleanup Chat`: An instant way to manually clear older chat elements. By default leaves only the last 30 messages.
1. **Message Counter**: Keeps track of the number of messages exchanged with GPT-4. It resets the counter periodically, and provides a visual indication of the reset time.
1. **Extension Toggle**: Allows you to activate or deactivate the extension's functionalities directly from the browser toolbar.
## File Breakdown:

* **background.js**: Contains the main background service worker that listens for extension state toggles and executes the extension script on the chat page accordingly.
* **injectButton.js**: Injects custom buttons (`Provide full code` and `Cleanup Chat`) into the chat UI for enhanced user control.
* **manifest.json**: The configuration file that dictates how the extension operates and interacts with the browser.
* **messageCounter.js**: Implements a counter to track message exchanges with GPT-4, resetting every three hours. It also provides visual feedback on the number of messages and the next reset time. Additionally, this script adds the MessageNumbersadder feature to highlight messages older than 4000 tokens.
* **popup.html & popup.js**: Creates the popup UI allowing users to toggle the extension's functionalities on or off. And to reset the message count and time.
## Installation:

1. Clone this repository.
1. Open Chrome (or any Chromium-based browser, like Brave) and go to the Extensions page (`chrome://extensions/`).
1. Enable Developer Mode.
1. Click on `Load unpacked` and select the directory of the cloned repository.
1. The extension should now be added to your browser!
