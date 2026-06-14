# Coder Logger

A lightweight VS Code extension that instantly inserts `console.log` statements for any selected text — so you can debug faster and type less.

## ✨ Features

- **One-shortcut logging** — Select a variable or expression, press the shortcut, and a formatted `console.log` is inserted on the next line.
- **Smart placement** — Logs are inserted at the correct statement boundary, even inside nested objects, arrays, or function calls.
- **Custom prefix** — Add a label like `[DEBUG]` to all your logs via settings.
- **Quote style** — Choose between single quotes, double quotes, or backticks.
- **Optional line numbers** — Append the insertion line number to each log label.
- **Customizable keybinding** — Change the shortcut directly from the command palette.

## 🚀 Usage

1. **Select** any variable, value, or expression in your editor.
2. **Press** `Ctrl+Shift+Space` (Mac: `Cmd+Shift+Space`).
3. A `console.log` statement is inserted on the next line and the file is auto-formatted.

```js
// Select `user` and press the shortcut ↓
const user = getUser();
console.log("user", user);
```

## ⚙️ Settings

| Setting                         | Default  | Description                                        |
| ------------------------------- | -------- | -------------------------------------------------- |
| `coderLogger.logPrefix`         | `""`     | Prefix added to the log label (e.g. `[DEBUG]`)     |
| `coderLogger.quoteStyle`        | `single` | Quote character: `single`, `double`, or `backtick` |
| `coderLogger.includeLineNumber` | `false`  | Append the line number to the log label            |

## 🔧 Commands

| Command                                           | Description                                       |
| ------------------------------------------------- | ------------------------------------------------- |
| **Coder Logger: Quickly Print Console**           | Insert a `console.log` for the current selection  |
| **Coder Logger: Change Quick Console Keybinding** | Open Keyboard Shortcuts to customize the shortcut |

## 📜 License

MIT
