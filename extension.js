// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

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
          selection.end.character
        );
        // store selected text to highlighted variable
        highlighted = editor.document.getText(selectionRange);
      }

      // store console log string into variable
      const consoleLogStatement = `console.log('${highlighted}', ${highlighted});`;

      // get line no of current curser position
      const lineEnd = selection.end.line;

      // store position of curser in variable
      const lineEndPosition = new vscode.Position(
        lineEnd,
        editor.document.lineAt(lineEnd).range.end.character
      );

      if (highlighted === "") {
        vscode.window.showInformationMessage(
          "Please select some value to console."
        );
      } else {
        // add console to text editor
        editor.edit((editBuilder) => {
          editBuilder.insert(lineEndPosition, "\n" + consoleLogStatement);
        });
        vscode.commands.executeCommand("editor.action.formatDocument");
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
