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
 * Check if a character is an opening bracket/quote
 */
function isOpeningChar(char: string): boolean {
  return ["(", "[", "{", '"', "'", "`"].includes(char);
}

/**
 * Check if a character is a closing bracket/quote
 */
function isClosingChar(char: string): boolean {
  return [")", "]", "}", '"', "'", "`"].includes(char);
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
 * Get the matching closing character for an opening character
 */
function getClosingChar(openChar: string): string | null {
  const pairs: { [key: string]: string } = {
    "(": ")",
    "[": "]",
    "{": "}",
    '"': '"',
    "'": "'",
    "`": "`",
  };
  return pairs[openChar] || null;
}

/**
 * Find the matching closing bracket/quote for an opening character at a given offset
 */
function findMatchingCloseOffset(
  document: vscode.TextDocument,
  openOffset: number,
  openChar: string
): number {
  const lastLine = document.lineCount - 1;
  const lastLineRange = document.lineAt(lastLine).range;
  const docEnd = document.offsetAt(lastLineRange.end);
  const closeChar = getClosingChar(openChar);
  if (!closeChar) {
    return -1;
  }

  let pos = openOffset + 1;
  let depth = 1;

  // For quotes (same open and close char)
  if (openChar === closeChar) {
    while (pos < docEnd) {
      const char = document.getText(
        new vscode.Range(
          document.positionAt(pos),
          document.positionAt(pos + 1)
        )
      );

      if (char === "\\" && pos + 1 < docEnd) {
        pos += 2;
        continue;
      }

      if (char === closeChar) {
        return pos;
      }

      pos++;
    }
    return -1;
  }

  // For brackets (different open and close char)
  while (pos < docEnd) {
    const char = document.getText(
      new vscode.Range(
        document.positionAt(pos),
        document.positionAt(pos + 1)
      )
    );

    if (char === "\\" && pos + 1 < docEnd) {
      pos += 2;
      continue;
    }

    if (char === openChar) {
      depth++;
    } else if (char === closeChar) {
      depth--;
      if (depth === 0) {
        return pos;
      }
    }

    pos++;
  }

  return -1;
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

    // Handle escape sequences
    if (char === "\\" && pos + 1 < docEnd) {
      pos += 2;
      continue;
    }

    // If we find a closing character, return it
    if (isClosingChar(char)) {
      return document.positionAt(pos);
    }

    // If we find an opening character, skip to its matching closing
    if (isOpeningChar(char)) {
      const matchingClose = findMatchingCloseOffset(document, pos, char);
      if (matchingClose >= 0) {
        pos = matchingClose + 1;
        continue;
      }
    }

    pos++;
  }

  return undefined;
}

/**
 * Find the previous closing bracket/quote from the given position
 */
export function findPreviousClosingBracket(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Position | undefined {
  const startOffset = document.offsetAt(position);
  let pos = startOffset - 1;

  while (pos >= 0) {
    const char = document.getText(
      new vscode.Range(
        document.positionAt(pos),
        document.positionAt(pos + 1)
      )
    );

    // Handle escape sequences (check previous char)
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

    // If we find a closing character, return it
    if (isClosingChar(char)) {
      return document.positionAt(pos);
    }

    // If we find an opening character, skip to its matching opening
    if (isOpeningChar(char)) {
      const matchingOpen = findMatchingOpenOffset(document, pos, char);
      if (matchingOpen >= 0) {
        pos = matchingOpen - 1;
        continue;
      }
    }

    pos--;
  }

  return undefined;
}
