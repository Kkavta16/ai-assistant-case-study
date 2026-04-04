# Kirti's Assistant

# AI Assistant Case Study

## How To Run

This frontend does not need any setup,installation or build step.

1. Keep these files in the same folder:
   - `index.html`
   - `styles.css`
   - `script.js`
2. Open `index.html` directly in any modern browser such as Chrome, Edge or Firefox.

You can run it by double-clicking `index.html` or by right-clicking it and choosing a browser from `Open with`.

## What The Frontend Does

- Supports three response modes: `Friendly`, `Professional`, and `Concise`
- Shows different mock AI replies based on the selected mode
- Keeps the conversation visible during the current browser session
- Shows inline validation errors for empty messages and messages over 500 characters
- Disables the send button when the input is empty, too long, or while loading
- Shows a loading indicator only while the mock AI reply is being generated
- Shows a mode-change label immediately when the user changes the selected mode

## Key Decisions

- The AI response is mocked instead of using a real API because the task specifically allowed a simulated backend reply.
- The chat history is stored with `sessionStorage`, so the conversation remains available while the browser session is open.
- "A styled welcome popup appears when the chatbot opens. This was added to make the entry state clearer and to surface the assistant introduction immediately without using a browser alert."
- The popup uses the same brown, cream, and white theme as the chat interface so it feels like part of the product.
- The app uses plain HTML, CSS, and JavaScript so it can be opened directly in a browser without any setup.
