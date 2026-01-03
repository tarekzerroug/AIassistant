

// 1. Crréate the pop up 
const popup = document.createElement("div");
popup.style.position = "absolute";
popup.style.background = "#ffffffff";
popup.style.color = "#000000ff";
popup.style.padding = "8px 12px";
popup.style.borderRadius = "6px";
popup.style.fontSize = "14px";
popup.style.maxWidth = "300px";
popup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
popup.style.zIndex = "999999";
popup.style.display = "none";
popup.style.pointerEvents = "auto";

document.body.appendChild(popup);

// 2. Listener fot the tab touch 
document.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  event.preventDefault();

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  currentText = selection.toString().trim();
  if (!currentText) return;

  currentRect = selection.getRangeAt(0).getBoundingClientRect();

  popup.innerHTML = `
    <select id="ai-action">
      <option value="explain">Explain</option>
      <option value="summarize">Summarize</option>
      <option value="simplify">Simplify</option>
      <option value="translate-in-french">Translate in french</option>
    </select>
    <button id="run-ai">Run</button>
    <div id="result"></div>
  `;

  popup.style.top = `${currentRect.bottom + window.scrollY + 8}px`;
  popup.style.left = `${currentRect.left + window.scrollX}px`;
  popup.style.display = "block";

  const result = popup.querySelector("#result");

  popup.querySelector("#run-ai").onclick = () => {
    const action = popup.querySelector("#ai-action").value;
    result.textContent = "Thinking...";

    chrome.runtime.sendMessage(
      {
        type: "ASK_AI",
        text: action + ": " + currentText,
      },
      (response) => {
        if (!response) {
          result.textContent = "Error";
          return;
        }
        result.textContent = response.answer;
      }
    );
  };
});


document.addEventListener("mousedown", (event) => {
  if (!popup.contains(event.target)) {
    popup.style.display = "none";
  }
});