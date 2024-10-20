// Create a context menu item when text is selected
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchWithChatGPT",
    title: "Search with ChatGPT",
    contexts: ["selection"]
  });
});

// When the context menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchWithChatGPT") {
    const selectedText = info.selectionText;
    console.log("Selected text: ", selectedText); // Log selected text

    // Open a new tab with ChatGPT website
    chrome.tabs.create({ url: "https://chatgpt.com" }, (newTab) => {
      //console.log("New tab opened with ID: ", newTab.id); // Log tab ID

      // Wait for the tab to fully load before injecting the script
      chrome.tabs.onUpdated.addListener(function injectScript(tabId, changeInfo) {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          //console.log("Tab fully loaded, injecting script...");

          // Inject the script once the page is fully loaded
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            func: injectTextIntoPageAndSend, // Function to inject into page
            args: [selectedText]      // Pass the selected text to the function
          }).then(() => {
            //console.log("Script injected successfully"); // Log success of script injection
          }).catch((error) => {
            console.error("Extension execution failed: ", error); // Log error if injection fails
          });

          // Remove the listener to avoid injecting multiple times
          chrome.tabs.onUpdated.removeListener(injectScript);
        }
      });
    });
  }
});

// Function to inject text, click the button, and handle failure notifications
function injectTextIntoPageAndSend(text) {

  console.log("%cSearch with ChatGPT : Build by: Sagar Chauhan, AVP - Tech with 8+ years of experience in product development and leadership. More info: https://sagarchauhan005.github.io/",
      "color: black; font-size: 12px; background-color: #eee; padding: 8px; border-radius: 5px; border: 0.5px solid black;");
  // Injected script must have its context isolated within the page, so functions must be inside
  function showToast(message) {
    const toast = document.createElement('div');
    
    // Clear any existing toasts before adding a new one
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Add class for identification
    toast.classList.add('custom-toast');

    // Styling for the toast
    toast.style.position = 'fixed';
    toast.style.top = '20px';           // Position it 20px from the top
    toast.style.right = '20px';         // Position it 20px from the right
    toast.style.backgroundColor = '#ea8444';
    toast.style.color = '#fff';
    toast.style.padding = '10px 15px';  // Adjust padding
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '10000';
    toast.style.fontSize = '14px';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.maxWidth = '300px';
    toast.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)'; // Add slight shadow

    // Add the message to the toast
    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    toast.appendChild(messageElement);

    // Add the close button (cross "×") to the toast
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.marginLeft = '10px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.fontSize = '40px'; // Larger button size
    closeButton.style.cursor = 'pointer';

    // Close toast when the button is clicked
    closeButton.addEventListener('click', () => {
      toast.remove();
    });
    
    // Append the close button to the toast
    toast.appendChild(closeButton);
    
    // Append the toast to the body
    document.body.appendChild(toast);

    // Automatically remove the toast after 4 seconds if not manually closed
    setTimeout(() => {
      toast.remove();
    }, 10000);
  }


  function copyToClipboard(text) {
  // Check for clipboard-write permission
    navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
      if (result.state === "granted") {
        // Permission granted: attempt to write to clipboard
        navigator.clipboard.writeText(text).then(() => {
          // Successfully copied text (show success message)
          showToast("Text successfully copied to clipboard.");
        }).catch(err => {
          // If clipboard write fails despite permission being granted, show an error toast
          console.error('Failed to copy text to clipboard:', err);
          // showToast(
          //   "Failed to copy text to clipboard. Please try manually copying the text."
          // );
        });
      } else if (result.state === "prompt") {
        // If permission is in "prompt" state, notify the user about clipboard access
        showToast(
          "Search with ChatGPT is requesting clipboard access to copy selected text. If you deny, text won’t be copied automatically."
        );

        // Attempt to write to clipboard after permission prompt
        navigator.clipboard.writeText(text).then(() => {
          showToast("Text successfully copied to clipboard.");
        }).catch(err => {
          console.error('Failed to copy text to clipboard:', err);
          if (err.name === 'NotAllowedError') {
            showToast(
              "Clipboard write permission was denied. You can manually copy the text if needed."
            );
          } else {
            showToast("Failed to copy text to clipboard.");
          }
        });
      } else if (result.state === "denied") {
        // If permission is denied, show a toast and encourage manual copying
        showToast(
          "Clipboard write permission is denied. You can manually copy the text."
        );
      }
    }).catch((error) => {
      // Handle permission query errors
      console.error('Error querying clipboard permission:', error);
      showToast("Unable to query clipboard permission.");
    });
  }



  //console.log("Injecting text: ", text);
  copyToClipboard(text);

  let inputCheck=0;
  const waitForPromptDiv = setInterval(() => {
    
    const promptDiv = document.querySelector('div[contenteditable="true"]');
    if (promptDiv) {
      clearInterval(waitForPromptDiv);

      promptDiv.focus();
      const range = document.createRange();
      range.selectNodeContents(promptDiv);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      const inputEvent = new InputEvent('input', {
        data: text,
        bubbles: true,
        cancelable: true
      });
      promptDiv.dispatchEvent(inputEvent);
      promptDiv.innerHTML = text;
      //console.log("Text injected into ProseMirror div");

      promptDiv.dispatchEvent(new Event('focus', { bubbles: true }));
      promptDiv.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

      document.title = text;
      //console.log("Page title changed to: ", text);

      const waitForSendButton = setInterval(() => {
        const sendButton = document.querySelector('button[data-testid="send-button"]');
        if (sendButton && !sendButton.disabled) {
          clearInterval(waitForSendButton);
          sendButton.click();
          //console.log("Send button clicked");
        } else if (sendButton && sendButton.disabled) {
          console.log("Send button is disabled");
          clearInterval(waitForSendButton);
          showToast('Send button is disabled. Text is copied to clipboard, you can paste it manually.');
          promptDiv.focus();
        } else {
          console.log("Waiting for send button to be enabled...");
        }
      }, 500);
    } else {
      console.log("Waiting for div to load...");
      if(inputCheck>=3){
        clearInterval(waitForPromptDiv);
        showToast('Failed to paste the text, but it\'s copied to clipboard. Please paste it manually.');
      }
      inputCheck++;
    }
  }, 500);
}
