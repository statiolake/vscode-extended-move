import * as vscode from "vscode";

/**
 * Find position of next whitespace occurrence
 */
export function findNextWhitespace(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Position | undefined {
  let lineAt = position.line;
  let characterAt = position.character;

  while (lineAt < document.lineCount) {
    const line = document.lineAt(lineAt).text;
    const match = /\s+/.exec(line.substring(characterAt));

    if (match) {
      return new vscode.Position(
        lineAt,
        characterAt + match.index + match[0].length
      );
    }

    lineAt++;
    characterAt = 0;
  }

  return undefined;
}

/**
 * Find position of previous whitespace occurrence
 */
export function findPreviousWhitespace(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Position | undefined {
  let lineAt = position.line;
  let characterAt = position.character;

  while (lineAt >= 0) {
    const line = document.lineAt(lineAt).text;
    if (characterAt < 0) {characterAt = line.length;}
    const substring = line.substring(0, characterAt).trimEnd();
    const match = /\s+(?=\S*$)/.exec(substring);

    if (match) {
      return new vscode.Position(lineAt, match.index + match[0].length);
    }

    lineAt--;
    characterAt = -1;
  }

  return undefined;
}

/**
 * Find position of next character occurrence
 */
export function findNextChar(
  document: vscode.TextDocument,
  position: vscode.Position,
  char: string
): vscode.Position | undefined {
  const line = document.lineAt(position.line).text;
  const index = line.indexOf(char, position.character + 1);
  return index !== -1 ? new vscode.Position(position.line, index) : undefined;
}

/**
 * Find position of previous character occurrence
 */
export function findPreviousChar(
  document: vscode.TextDocument,
  position: vscode.Position,
  char: string
): vscode.Position | undefined {
  const line = document.lineAt(position.line).text;
  const substring = line.substring(0, position.character);
  const index = substring.lastIndexOf(char);
  return index !== -1 ? new vscode.Position(position.line, index) : undefined;
}

/**
 * Check if a character is a closing bracket/quote
 */
function isClosingChar(char: string): boolean {
  return [")", "]", "}", '"', "'", "`"].includes(char);
}

/**
 * Check if a character is whitespace or punctuation
 * This includes spaces, tabs, commas, semicolons, colons, etc.
 */
function isWhitespaceOrPunctuation(char: string): boolean {
  // Whitespace: space, tab, newline, etc.
  // Punctuation: common punctuation marks excluding brackets/quotes
  return /^[\s,;:.\-+*/<>=!&|^~?@#$%\\]$/.test(char);
}

/**
 * Get the matching opening character for a closing character
 */
function getOpeningChar(closeChar: string): string | null {
  const pairs: { [key: string]: string } = {
    ")": "(",
    "]": "[",
    "}": "{",
    '"': '"',
    "'": "'",
    "`": "`",
  };
  return pairs[closeChar] || null;
}

/**
 * Find the matching opening bracket/quote for a closing character at a given offset
 */
function findMatchingOpenOffset(
  document: vscode.TextDocument,
  closeOffset: number,
  closeChar: string
): number {
  const openChar = getOpeningChar(closeChar);
  if (!openChar) {
    return -1;
  }

  let pos = closeOffset - 1;
  let depth = 1;

  // For quotes (same open and close char)
  if (openChar === closeChar) {
    while (pos >= 0) {
      const char = document.getText(
        new vscode.Range(
          document.positionAt(pos),
          document.positionAt(pos + 1)
        )
      );

      // Check if escaped
      if (pos > 0) {
        const prevChar = document.getText(
          new vscode.Range(
            document.positionAt(pos - 1),
            document.positionAt(pos)
          )
        );
        if (prevChar === "\\") {
          pos -= 2;
          continue;
        }
      }

      if (char === openChar) {
        return pos;
      }

      pos--;
    }
    return -1;
  }

  // For brackets (different open and close char)
  while (pos >= 0) {
    const char = document.getText(
      new vscode.Range(
        document.positionAt(pos),
        document.positionAt(pos + 1)
      )
    );

    // Check if escaped
    if (pos > 0) {
      const prevChar = document.getText(
        new vscode.Range(
          document.positionAt(pos - 1),
          document.positionAt(pos)
        )
      );
      if (prevChar === "\\") {
        pos -= 2;
        continue;
      }
    }

    if (char === closeChar) {
      depth++;
    } else if (char === openChar) {
      depth--;
      if (depth === 0) {
        return pos;
      }
    }

    pos--;
  }

  return -1;
}

/**
 * Find the next closing bracket/quote from the given position
 * Only returns a position if the characters between cursor and closing bracket
 * are all whitespace or punctuation. Returns undefined if any other character is found.
 */
export function findNextClosingBracket(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Position | undefined {
  const startOffset = document.offsetAt(position);
  const lastLine = document.lineCount - 1;
  const lastLineRange = document.lineAt(lastLine).range;
  const docEnd = document.offsetAt(lastLineRange.end);
  let pos = startOffset;

  while (pos < docEnd) {
    const char = document.getText(
      new vscode.Range(
        document.positionAt(pos),
        document.positionAt(pos + 1)
      )
    );

    // If we find a closing character, return it
    if (isClosingChar(char)) {
      return document.positionAt(pos);
    }

    // Only allow whitespace and punctuation between cursor and closing bracket
    if (!isWhitespaceOrPunctuation(char)) {
      return undefined;
    }

    pos++;
  }

  return undefined;
}

/**
 * Find the previous closing bracket/quote from the given position
 * Only works if the immediate previous character is a closing bracket/quote.
 * Returns the position to move to inside the bracket, skipping back through
 * whitespace and punctuation as far as possible.
 */
export function findPreviousClosingBracket(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Position | undefined {
  const startOffset = document.offsetAt(position);

  // Check if there's a character before the cursor
  if (startOffset <= 0) {
    return undefined;
  }

  // Check the immediate previous character
  const prevChar = document.getText(
    new vscode.Range(
      document.positionAt(startOffset - 1),
      document.positionAt(startOffset)
    )
  );

  // Only proceed if the immediate previous character is a closing bracket/quote
  if (!isClosingChar(prevChar)) {
    return undefined;
  }

  // Find the matching opening bracket
  const closingOffset = startOffset - 1;
  const openingOffset = findMatchingOpenOffset(document, closingOffset, prevChar);
  if (openingOffset < 0) {
    return undefined;
  }

  // Now scan backwards from just before the closing bracket,
  // skipping whitespace and punctuation, stopping at other characters or the opening bracket
  let pos = closingOffset - 1;

  while (pos > openingOffset) {
    const char = document.getText(
      new vscode.Range(
        document.positionAt(pos),
        document.positionAt(pos + 1)
      )
    );

    // Stop if we find a non-whitespace, non-punctuation character
    if (!isWhitespaceOrPunctuation(char)) {
      break;
    }

    pos--;
  }

  // Return position after the last non-skippable character (or after opening bracket)
  return document.positionAt(pos + 1);
}
