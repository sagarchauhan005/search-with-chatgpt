// Listen for right-click events and send selected text to the background script
document.addEventListener("contextmenu", () => {
  console.log("Right-click detected."); // Log to check if content script is running

  const selectedText = window.getSelection().toString().trim();
  console.log("Selected text: ", selectedText); // Log the selected text

  if (selectedText) {
    chrome.runtime.sendMessage({
      action: "updateContextMenu",
      selectedText: selectedText
    });
  }
});
