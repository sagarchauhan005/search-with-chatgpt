// Create a context menu item when text is selected
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchWithChatGPT",
    title: "Search with ChatGPT",
    contexts: ["selection"]
  });
});


// Listen for messages from the content script
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "updateContextMenu") {
//     const selectedText = request.selectedText;
//     const truncatedText = selectedText.length > 25 ? selectedText.substring(0, 25) + "..." : selectedText;
//
//     // Update the context menu with the selected text
//     chrome.contextMenus.update("searchWithChatGPT", {
//       title: `Search ChatGPT with "${truncatedText}"`
//     });
//   }
// });


// When the context menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchWithChatGPT") {
    const selectedText = info.selectionText;
    console.log("Build by : Sagar Chauhan, AVP - Tech with 8+ years of experience in product development and leadership. More info: https://sagarchauhan005.github.io/");
    console.log("Selected text: ", selectedText); // Log selected text

    // Open a new tab with ChatGPT website
    chrome.tabs.create({ url: "https://chatgpt.com" }, (newTab) => {
      console.log("New tab opened with ID: ", newTab.id); // Log tab ID

      // Wait for the tab to fully load before injecting the script
      chrome.tabs.onUpdated.addListener(function injectScript(tabId, changeInfo) {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          console.log("Tab fully loaded, injecting script...");
          
          // Inject the script once the page is fully loaded
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            func: injectTextIntoPageAndSend, // Function to inject into page
            args: [selectedText]      // Pass the selected text to the function
          }).then(() => {
            console.log("Script injected successfully"); // Log success of script injection
          }).catch((error) => {
            console.error("Script injection failed: ", error); // Log error if injection fails
          });
          
          // Remove the listener to avoid injecting multiple times
          chrome.tabs.onUpdated.removeListener(injectScript);
        }
      });
    });
  }
});

// Function to inject text, click the button, and change the page title
function injectTextIntoPageAndSend(text) {
  console.log("Injecting text: ", text); // Log the text to be injected
  
  // Find the textarea
  const textarea = document.querySelector('textarea[placeholder="Message ChatGPT"]');
  if (textarea) {
    // Focus on the textarea and set its value
    textarea.focus();
    textarea.value = text;
    console.log("Text injected into textarea"); // Log success if text is injected

    // Trigger a keydown event to simulate user typing the message (optional)
    const inputEvent = new Event('input', { bubbles: true });
    textarea.dispatchEvent(inputEvent);

    // Change the title of the page to the selected text
    document.title = text;
    console.log("Page title changed to: ", text); // Log the page title change

    // Find the send button
    const sendButton = document.querySelector('button[data-testid="send-button"]');
    if (sendButton) {
      // Ensure the button is not disabled
      if (!sendButton.disabled) {
        sendButton.click();
        console.log("Send button clicked"); // Log success if the button is clicked
      } else {
        console.error("Send button is disabled!"); // Log error if the button is disabled
      }
    } else {
      console.error("Send button not found!"); // Log error if the button is not found
    }
  } else {
    console.error("Textarea not found!"); // Log error if textarea is not found
  }
}
