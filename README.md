# Polynomial Addition Visualizer

An interactive teaching tool and academic college project demonstrating how polynomials stored as singly linked lists are added step-by-step using three distinct algorithms:
1. **Two-pointer traversal** (O(m + n) time, O(1) space)
2. **Nested-loop traversal** (O(m × n) time, O(n) space)
3. **Insertion-based approach** (O(m × n) or O(m + n) with cursor optimisation, O(1) space)

Built strictly with **HTML5, CSS3, and vanilla JavaScript (ES modules)**. No backend, no dependencies, no external web fonts or CDN calls; runs 100% offline.

---

## Features

- **Linked List Node Anatomy:** Every term is represented as a singly linked list node with three visible compartments: coefficient, exponent, and next pointer, terminating with a `NULL` marker.
- **Three Core Algorithms:** Complete implementations using real linked-list pointer traversal (not array indexing).
- **Deterministic Playback & Frame Identity:** Play, pause, step forward, step backward, jump to end, adjust playback speed (0.25x to 4x), or scrub through any step. Re-stepping to any index yields an exact, identical frame.
- **Synchronized Step Narration & Pseudocode:** Each step highlights the exact executing line in the pseudocode panel with an accessible `aria-live` narration banner.
- **Predict Mode:** Allows students to quiz themselves before each comparison occurs.
- **Stress Test Presets & Benchmark Suite:** Dedicated 10-term stress presets (dense interleaved 20-term results, full 10-term cancellations to zero, extreme -999/999 boundaries, heavy multi-pass reverse sorting) plus an interactive in-browser benchmark runner modal testing 100 to 1,000 pairs with live progress and throughput metrics.
- **Step Log Exporter:** Export complete execution traces as `.txt` files with line-by-line step actions, line numbers, and counter summaries.
- **Side-by-Side Comparison:** Compare page executes all three algorithms simultaneously on the same polynomial input, with live counter graphs, complexity matrix, and automated self-checking result verification.
- **Complete Test Coverage:** 100% test pass rate with Node.js built-in test runner (`node --test`), verifying parsing, validation, all three algorithms across presets, step invariants, and 200 random seeded property test pairs.
- **Accessibility & Design:** Accessible focus indicators, keyboard shortcuts (Space, Arrow keys, Home, End, +, -, ?, Esc), screen-reader landmarks, light/dark theme toggle with system preference detection and localStorage persistence, and non-colour visual cues for all node states.

---

## Folder Structure

```
d:/Akash/PROJECTS/DSAVisuliser/
├── index.html               # Home page and algorithm overview
├── visualizer.html          # Main interactive visualizer workspace
├── compare.html             # Side-by-side three-way comparison workspace
├── learn.html               # Theory, pseudocode, complexity table, viva Q&A
├── package.json             # ES module declaration & test script
├── PRD.md                   # Complete Product Requirements Document
├── README.md                # Project documentation and guide
├── css/
│   ├── tokens.css           # Color tokens, themes, typography, and spacing
│   ├── base.css             # CSS reset, accessibility focus, and container
│   ├── components.css       # Header, navigation, buttons, badges, modals
│   └── visualizer.css       # SVG layout, node states, pseudocode, controls
├── js/
│   ├── core/
│   │   ├── node.js          # Singly linked list Node class
│   │   ├── polyList.js      # List creation, traversal, and formatting
│   │   ├── parser.js        # Mathematical polynomial text parser
│   │   ├── validate.js      # Form validation and algorithm requirements
│   │   ├── normalise.js     # Sorting and combining like terms
│   │   └── presets.js       # Standard presets and random generator
│   ├── algorithms/
│   │   ├── stepRecorder.js  # Immutable step snapshot engine
│   │   ├── twoPointer.js    # Approach 1: Two-pointer merge
│   │   ├── nestedLoop.js    # Approach 2: Nested loop with visited flags
│   │   ├── insertion.js     # Approach 3: Incremental list insertion
│   │   └── reference.js     # Independent Map-based verification
│   ├── player/
│   │   └── player.js        # Playback controller and state machine
│   ├── ui/
│   │   ├── renderer.js      # SVG node and arrow drawing engine
│   │   ├── pseudocode.js    # Pseudocode line highlighting
│   │   ├── counters.js      # Live performance counter updater
│   │   ├── narration.js     # Accessible step narration updater
│   │   ├── controls.js      # Playback buttons and keyboard shortcuts
│   │   ├── inputPanel.js    # Input forms, validation, and term builder
│   │   ├── nav.js           # Common header navigation bar
│   │   ├── helpModal.js     # Help and shortcut modal dialog
│   │   └── theme.js         # Light/dark theme & reduced motion manager
│   └── pages/
│       ├── visualizerPage.js# Controller for visualizer.html
│       ├── comparePage.js   # Controller for compare.html
│       └── learnPage.js     # Controller for learn.html
└── tests/
    ├── parser.test.js       # Unit tests for polynomial parsing & validation
    ├── algorithms.test.js   # Unit & property tests for the 3 algorithms
    ├── steps.test.js        # Invariant and snapshot immutability tests
    └── player.test.js       # Player state machine & frame identity tests
```

---

## How to Run Locally

Because the project uses modern ES modules (`import`/`export`), modern browsers enforce CORS security policies and do not allow module loading directly via double-clicking `file://` URLs.

To run locally:

### Option 1: Python HTTP Server (Recommended)
From the project directory:
```bash
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in Chrome, Edge, or Firefox.

### Option 2: VS Code Live Server
Open the project folder in VS Code, right-click `index.html`, and select **"Open with Live Server"**.

---

## Running the Automated Test Suite

The project includes full unit, property, and integration test coverage using the built-in Node.js test runner (`node:test`):

```bash
npm test
```
Or directly:
```bash
node --test tests/*.test.js
```

### Test Coverage Highlights
- **14.1 Parser Tests:** Valid and invalid algebraic inputs, negative signs, unicode minus (`\u2212`), empty strings, coefficient bounds ([-999, 999]), exponent bounds ([0, 99]), zero polynomials (`0`), term limits (<= 10), and duplicate exponent detection.
- **14.2 Algorithm & Preset Tests:** Verification of all seven standard presets (Basic, Full cancellation, Empty operand, Disjoint exponents, Different lengths, Identical, Unsorted) across all 3 algorithms against the reference Map calculation.
- **Reference Counters Verification:** Exact assertion of comparisons, nodes created, and pointer moves for the Basic preset matching PRD Section 7.4.
- **Property-Based Testing:** 200 pseudo-randomly generated polynomial pairs tested across all algorithms ensuring 100% equivalence with the reference calculation.
- **14.3 Steps & Player Tests:** Snapshot freezing and immutability checks, monotonically non-decreasing counters, deterministic identity of frames after `prev` -> `next` navigation, and player state transitions.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| <kbd>Space</kbd> | Play / Pause playback |
| <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> | Step backward / forward |
| <kbd>Home</kbd> / <kbd>End</kbd> | Restart from beginning / Jump to end |
| <kbd>+</kbd> / <kbd>-</kbd> | Increase / decrease playback speed |
| <kbd>?</kbd> | Open Help & Reference modal dialog |
| <kbd>Esc</kbd> | Close Help modal dialog |

*(Shortcuts are automatically suspended when the user is focused inside a text input field.)*
