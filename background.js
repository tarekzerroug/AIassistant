chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ASK_AI") {
    callWorker({
      prompt: message.text,
    })
      .then((answer) => {
        sendResponse({ answer });
      })
      .catch((err) => {
        console.error(err);
        sendResponse({ answer: "AI error" });
      });

    return true; 
  }

  if (message.type === "ASK_AI_SCREENSHOT") {
    captureCurrentTab(sender.tab)
      .then((image) =>
        callWorker({
          prompt: message.text,
          image,
        })
      )
      .then((answer) => {
        sendResponse({ answer });
      })
      .catch((err) => {
        console.error(err);
        sendResponse({
          answer: `Screenshot error: ${err.message || "Unknown error"}`,
        });
      });

    return true;
  }
});

function captureCurrentTab(tab) {
  const windowId = tab && tab.windowId ? tab.windowId : undefined;

  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(
      windowId,
      {
        format: "jpeg",
        quality: 45,
      },
      (image) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!image) {
          reject(new Error("Chrome did not return a screenshot."));
          return;
        }

        resolve(image);
      }
    );
  });
}

async function callWorker({ prompt, image }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(
      "https://backend-ai.tarekzerroug2.workers.dev",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          image,
        }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(typeof result === "string" ? result : "Worker request failed.");
    }

    return result;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("The AI request timed out after 45 seconds.");
    }

    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
