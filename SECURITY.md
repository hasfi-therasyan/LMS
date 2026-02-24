# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

- **Do not** open a public GitHub issue for security vulnerabilities.
- Report by contacting the repository maintainer privately (e.g. via GitHub account **hasfi-therasyan** or your preferred channel).
- Include a clear description and steps to reproduce if possible.
- We will acknowledge and respond as soon as we can.

## Supported Versions

Security updates are considered for the current default branch (`main`). Older branches are not officially supported.

---

## Repository Security & Contribution Policy

### Commit attribution

- **No Co-authored-by: Cursor / cursoragent.**  
  All commits must be attributed only to human contributors. Do **not** add `Co-authored-by: Cursor <cursoragent@cursor.com>` (or similar) to commit messages. If you use Cursor or other AI-assisted tools, ensure your Git/IDE is configured so that only your own identity appears as author and no Cursor/cursoragent co-author is added.
- This keeps the contributor list accurate and avoids unintended bot attribution on GitHub.

### Checks

- CI may reject pushes or pull requests if any commit message contains Co-authored-by Cursor or cursoragent, so fix the commit message (e.g. amend or rebase) before pushing.
