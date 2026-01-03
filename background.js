chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ASK_AI") {
    callWorker(message.text)
      .then((answer) => {
        sendResponse({ answer });
      })
      .catch((err) => {
        console.error(err);
        sendResponse({ answer: "AI error" });
      });

    return true; 
  }
});

async function callWorker(text) {
  const response = await fetch(
    "https://backend-ai.tarekzerroug2.workers.dev",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: text,
      }),
    }
  );

  return await response.json();
}