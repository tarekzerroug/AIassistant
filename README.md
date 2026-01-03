# ChromeExtension

Chrome extension that allows users to interact with an AI language model directly from any webpage.  
The user selects a piece of text, presses the **Tab** key, chooses an action (explain, summarize, simplify, or translate), and instantly receives an AI-generated response in a contextual popup.

The goal of this project is to explore how AI can be integrated into a lightweight, non-intrusive productivity tool.

---

## Features

- Text selection on any webpage
- Popup triggered via the **Tab** key
- AI actions available:
  - Explain
  - Summarize
  - Simplify
  - Translate (to French)
- AI-powered responses via a serverless backend
- Contextual popup displayed near the selected text

---

## Architecture Overview

The project is composed of three main parts:

### 1. Chrome Extension (Frontend)
- Content script injected into web pages
- Handles text selection and keyboard events
- Dynamically creates and positions the popup
- Sends requests to the background script

### 2. Background Script
- Listens for messages from the content script
- Calls the backend API using `fetch`
- Manages asynchronous communication
- Sends the AI response back to the content script

### 3. Backend (Cloudflare Worker)
- Serverless REST API
- Receives user prompts
- Calls the Mistral AI API (chat completions)
- Returns a simplified JSON response

---

## Technologies Used

- JavaScript (ES6+)
- Chrome Extensions (Manifest V3)
- Cloudflare Workers
- Mistral AI API
- Fetch API
- Async / Await
- JSON

---

## Installation and Usage

### 1. Chrome Extension
1. Clone the repository
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the project folder

### 2. Backend
- The backend is deployed using Cloudflare Workers
- The Mistral API key is stored as an environment variable (`MISTRALKEY`)
- The extension communicates with the public Worker endpoint

---

## Example Usage

1. Select a text on any webpage
2. Press the **Tab** key
3. Choose an AI action from the dropdown
4. Click **Run**
5. The AI response appears in a popup next to the selected text

---

## Learning Objectives

This project helped me gain experience with:

- Communication between content scripts and background scripts
- Asynchronous JavaScript and execution flow
- Serverless backend architecture
- Integrating and consuming AI APIs
- Structuring a frontend/backend system
- Understanding the full request lifecycle from user input to AI response

---

## Possible Improvements

- Support for additional languages
- Custom prompt configuration
- Improved UI/UX styling and animations
- Request history and caching
- Advanced API security and rate limiting

---

## Author

Developed by **Tarek Zerroug**  
Computer Science student  
Université de Montréal