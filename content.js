

let currentText = "";

// 1. Create the pop up
const popup = document.createElement("div");
popup.style.position = "fixed";
popup.style.left = "16px";
popup.style.bottom = "16px";
popup.style.width = "fit-content";
popup.style.minWidth = "120px";
popup.style.maxWidth = "220px";
popup.style.maxHeight = "160px";
popup.style.background = "transparent";
popup.style.color = "inherit";
popup.style.padding = "0";
popup.style.borderRadius = "0";
popup.style.fontSize = "12px";
popup.style.boxShadow = "none";
popup.style.border = "none";
popup.style.backdropFilter = "none";
popup.style.webkitBackdropFilter = "none";
popup.style.zIndex = "999999";
popup.style.display = "none";
popup.style.pointerEvents = "auto";
popup.style.overflow = "hidden";

document.body.appendChild(popup);

// 2. Listener for the Tab key
document.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  currentText = selection.toString().trim();
  if (!currentText) return;

  event.preventDefault();

  popup.innerHTML = `
    <div id="result" style="padding:0; margin:0; background:transparent; border:none; min-height:20px; max-height:140px; overflow-y:auto; white-space:pre-wrap; font-size:11px; line-height:1.3; color:inherit; text-shadow:none; max-width:220px;"></div>
  `;

  popup.style.left = "16px";
  popup.style.bottom = "16px";
  popup.style.display = "block";

  const result = popup.querySelector("#result");
  result.textContent = "Thinking ...";

  chrome.runtime.sendMessage(
    {
      type: "ASK_AI",
      text: "Explain: " + currentText,
    },
    (response) => {
      if (!response) {
        result.textContent = "Error";
        return;
      }
      result.textContent = response.answer;
    }
  );
});


document.addEventListener("mousedown", (event) => {
  if (!popup.contains(event.target)) {
    popup.style.display = "none";
  }
});