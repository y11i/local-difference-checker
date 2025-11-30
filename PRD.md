Product Requirements Document (PRD)
Local-Only Diff Checker Desktop Application (Electron.js)
Use Electron + React + Vite + shadcn

1. Product Overview

A local-only desktop application built with Electron.js that allows users to compare two text inputs (JSON, plain text, code snippets, configuration files) and visualize the differences. The app highlights insertions (green), deletions (red), and modifications (yellow/blue depending on diff mode) using common diff algorithm conventions.

The application must remain fully offline, performing all operations locally with no network communication. Target users include engineers, writers, and analysts who need a fast, privacy-preserving diff tool.

2. Goals & Non-Goals
Goals

Provide a real-time diff comparison between two inputs.

Support text, code, and JSON-aware diff modes.

Provide a clean, modern, minimal UI.

Be privacy-first: no data leaves the user’s machine.

Allow line-by-line and unified diff views.

Allow keyboard navigation between differences (“Next change”, “Previous change”).

Support copy/export of the diff result.

Non-Goals

No cloud sync or history storage.

No multi-user collaboration.

3. Key Use Cases

Compare two versions of JSON files when debugging APIs.

Review code differences without opening a full IDE.

Compare text documents, paragraphs, or notes.

Quick diff while offline, e.g., during travel or with secure documents.

Locate specific changes using navigation tools.

4. Target Users

Software engineers

QA testers

Technical writers

Data analysts

Users dealing with sensitive data who need offline comparison tools

5. Features & Requirements
5.1 Core Functional Requirements
Input

Two side-by-side input panes:

Left: String A

Right: String B

Support for:

Raw text

JSON

Code (JavaScript, Python, C++, Java, etc.)

Ability to load data via:

Paste

Drag-and-drop file (.txt, .json, .js, .py, etc.)

“Open File” dialog

Diff Engine

Use a widely accepted diff algorithm (Myers diff, or Google's diff-match-patch).

Must support:

Character-level diff

Word-level diff

Line-level diff

JSON diff mode (optional toggle):

Ignores key ordering

Pretty-prints before comparing

Collapses unchanged branches

Visual Diff Output

Color conventions:

Added lines: green

Removed lines: red

Modified lines: highlight within the line (yellow/blue or custom theme)

Side-by-side view (default)

Unified view (single column diff)

Optional whitespace/tabs visualization

Collapsible unchanged sections (like GitHub)

Line numbers

Navigation

Jump between diffs:

“Next change”

“Previous change”

Scroll sync between panes

Quick search bar to find text inside either input

Output / Export

Copy diff result to clipboard (HTML or plain text)

Export to:

.txt unified diff file

.html colored diff output

Local-only storage (never uploaded)

5.2 Secondary Features

Themes: Light + Dark mode

Settings panel:

Toggle JSON formatting

Toggle whitespace sensitivity

Choose diff granularity (line/word/char)

Font size & font family

Undo/Redo for each input field

Auto-detect file type from extension

6. Non-Functional Requirements
Performance

Diffs must compute in ≤ 100ms for text up to 200k characters.

Memory usage should remain under 300MB for large JSON files.

Security & Privacy

App must make zero external network calls.

Ship with network access disabled unless user explicitly opts in.

Compatibility

Windows, macOS, Linux

Electron auto-updater optional (must also be local-only unless user opts in)

7. User Experience (UX) / UI
Layout

Top navigation bar:

File

Settings

View mode toggle (Side-by-side / Unified)

Diff granularity dropdown

Next / Previous diff

Left and right text panes with synchronized scrolling

Center vertical diff gutter showing:

deleted markers

added markers

modified markers

Interactions

When user types or pastes content, diff updates automatically.

Scroll to next difference animates to the diff block.

Hover over colored text yields tooltip:

“Removed”

“Added”

“Modified”

8. Technical Architecture
Electron Structure
/app
  /main      → Electron main process
  /renderer  → React/Vue/Svelte frontend
  /core      → Diff engine (JS or WASM)
  /styles
  /assets

Diff Engine Options

diff-match-patch (fast + mature)

jsdiff (simple, JSON support)

custom Myers diff implementation

Optionally integrate a WebAssembly diff engine for large files.

Local Storage

Store user preferences in local JSON config (Electron Store or filesystem).

Never store user content unless user manually saves a file.

9. Constraints

Must work entirely offline.

Must handle large JSON files efficiently.

Must avoid freezing UI during heavy diffs → use background workers.

10. Risks & Mitigations
Risk	Mitigation
Large JSON diff slows UI	Run diff in worker thread, stream results
Electron app size ~80MB	Minimize dependencies
Users mistake “local-only” for secure encryption	Clarify that data is not synced but also not encrypted at rest
11. Analytics / Telemetry

None. Fully offline app.

Error logs only saved locally if user enables it.

12. Success Metrics

Fast diff performance (<100ms for typical text)

No data ever leaves local machine

Side-by-side and unified diff modes both feel intuitive

Users can quickly jump between changes

13. Acceptance Criteria

AC1: App displays diff with clear coloring for additions, deletions, and modifications.
AC2: Inputs can be pasted or loaded from file.
AC3: JSON diff mode properly pretty-prints and normalizes objects.
AC4: Side-by-side and unified modes function correctly.
AC5: Navigation buttons move between diff blocks.
AC6: All operations work offline.
AC7: Export to .txt and .html is functional.
AC8: App handles at least 200k-character text.
AC9: Scroll synchronization works both ways.
AC10: File drag-and-drop loads content correctly.
