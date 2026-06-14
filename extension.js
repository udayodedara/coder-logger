// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

function getInsertIndex(document, selection) {
  const text = document.getText();
  const offset = document.offsetAt(selection.end);

  function isBlock(text, index) {
    let i = index - 1;
    while (i >= 0) {
      let c = text[i];
      if (c === " " || c === "\t" || c === "\n" || c === "\r") {
        i--;
        continue;
      }
      if (
        c === "=" ||
        c === ":" ||
        c === "," ||
        c === "(" ||
        c === "[" ||
        c === "?" ||
        c === "&" ||
        c === "|"
      )
        return false;
      let word = "";
      let j = i;
      while (j >= 0 && /[a-zA-Z0-9_]/.test(text[j])) {
        word = text[j] + word;
        j--;
      }
      if (word === "return" || word === "yield" || word === "await")
        return false;
      return true;
    }
    return true;
  }

  let stack = [];
  let inString = false;
  let stringChar = "";
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < offset; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (char === "\\") {
        i++;
        continue;
      }
      if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (char === "/" && nextChar === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (char === "/" && nextChar === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === "{") stack.push({ char, isBlock: isBlock(text, i) });
    else if (char === "(" || char === "[") stack.push({ char, isBlock: false });
    else if (char === "}") {
      if (stack.length > 0 && stack[stack.length - 1].char === "{") stack.pop();
    } else if (char === ")") {
      if (stack.length > 0 && stack[stack.length - 1].char === "(") stack.pop();
    } else if (char === "]") {
      if (stack.length > 0 && stack[stack.length - 1].char === "[") stack.pop();
    }
  }

  let targetDepth = 0;
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].isBlock) {
      targetDepth = i + 1;
      break;
    }
  }

  let currentDepth = stack.length;
  for (let i = offset; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inLineComment) {
      if (char === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (char === "\\") {
        i++;
        continue;
      }
      if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (char === "/" && nextChar === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (char === "/" && nextChar === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === "{" || char === "(" || char === "[") currentDepth++;
    else if (char === "}" || char === ")" || char === "]") currentDepth--;

    if (currentDepth <= targetDepth) {
      if (char === ";" || char === "\n") {
        if (char === "\n") {
          let j = i + 1;
          let continues = false;
          while (j < text.length) {
            let nc = text[j];
            if (nc === " " || nc === "\t" || nc === "\n" || nc === "\r") {
              j++;
              continue;
            }
            if ([".", ",", "+", "-", "*", "/", "%", "?", ":"].includes(nc))
              continues = true;
            break;
          }
          if (continues) continue;
        }
        return i + (char === ";" ? 1 : 0);
      }
      if (currentDepth < targetDepth) return i;
    }
  }
  return text.length;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "quick-console.printConsole",
    function () {
      // The code you place here will be executed every time your command is executed

      // variable for highlighted text
      let highlighted = "";

      // get editor instance
      const editor = vscode.window.activeTextEditor;
      // get curser line in selection
      const selection = editor.selection;
      if (selection && !selection.isEmpty) {
        const selectionRange = new vscode.Range(
          selection.start.line,
          selection.start.character,
          selection.end.line,
          selection.end.character,
        );
        // store selected text to highlighted variable
        highlighted = editor.document.getText(selectionRange);
      }

      // Read user-configurable settings
      const config = vscode.workspace.getConfiguration("coderLogger");
      const logPrefix = config.get("logPrefix", "");
      const quoteStyle = config.get("quoteStyle", "single");
      const includeLineNumber = config.get("includeLineNumber", false);

      // Resolve the quote character
      const q =
        quoteStyle === "double" ? '"' : quoteStyle === "backtick" ? "`" : "'";

      // Build the label (prefix + variable name + optional line number)
      const insertLine =
        editor.document.positionAt(getInsertIndex(editor.document, selection))
          .line + 1; // +1 for 1-based display
      const lineTag = includeLineNumber ? ` (line ${insertLine})` : "";
      const prefix = logPrefix ? `${logPrefix} ` : "";
      const label = `${prefix}${highlighted}${lineTag}`;

      // Build the console.log statement using chosen quote style
      const consoleLogStatement = `console.log(${q}${label}${q}, ${highlighted});`;

      // Find the robust insert position escaping expressions/objects
      const insertIndex = getInsertIndex(editor.document, selection);
      const lineEndPosition = editor.document.positionAt(insertIndex);

      if (highlighted === "") {
        vscode.window.showInformationMessage(
          "Please select some value to console.",
        );
      } else {
        // add console to text editor
        editor.edit((editBuilder) => {
          editBuilder.insert(lineEndPosition, "\n" + consoleLogStatement);
        });
        vscode.commands.executeCommand("editor.action.formatDocument");
      }
    },
  );

  // Register the "Change Quick Console Keybinding" command.
  // VS Code extensions cannot programmatically bind keys at runtime, but we
  // can open the built-in Keyboard Shortcuts editor filtered to our command
  // so the user can set any key they want with one click.
  let openKbDisposable = vscode.commands.registerCommand(
    "coder-logger.openKeybindingSettings",
    function () {
      // Opens Keyboard Shortcuts editor and searches for our command
      vscode.commands.executeCommand(
        "workbench.action.openGlobalKeybindings",
        "quick-console.printConsole",
      );
    },
  );
  context.subscriptions.push(openKbDisposable);

  const shownTipKey = "coderLogger.shownKeybindingTip";

  // Show a one-time tip so new users discover the keybinding setting.
  const hasShownTip = context.globalState.get(shownTipKey, false);
  if (!hasShownTip) {
    vscode.window
      .showInformationMessage(
        "Coder Logger: Press Ctrl+Shift+Space (Cmd+Shift+Space on Mac) to insert a console.log. You can customize this shortcut anytime.",
        "Change Shortcut",
      )
      .then((choice) => {
        if (choice === "Change Shortcut") {
          vscode.commands.executeCommand(
            "workbench.action.openGlobalKeybindings",
            "quick-console.printConsole",
          );
        }
      });
    context.globalState.update(shownTipKey, true);
  }

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
