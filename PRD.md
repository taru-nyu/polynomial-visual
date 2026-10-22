# Polynomial Addition Visualizer: Product Requirements Document

Academic, non-commercial college project (Data Structures) | Version 1.0 | 16 October 2026 | Stack: HTML, CSS, vanilla JavaScript | No backend

## 1. Project Overview

**What it is.** A static, browser-based teaching tool that shows how two polynomials stored as singly linked lists are added. It animates three algorithms step by step on the same input, so a student can see how each one works and how their costs differ.

**The three approaches**

- **Two-pointer traversal:** walk both sorted lists together, like the merge step of merge sort.
- **Nested-loop traversal:** for every term of P, search all of Q for the same exponent.
- **Insertion-based:** copy P into the result, then insert each term of Q into it, merging when the exponent already exists.

**Why it exists.** Most students meet this topic only as code. Pointer movement, node comparison and re-linking are hard to picture from code alone. This tool makes each of them visible, with narration and highlighted pseudocode.

**Nature of the project.** Academic and non-commercial. No accounts, no database, no server, no tracking. It runs from a local folder (with a simple local server) or from free static hosting such as GitHub Pages.

### 1.1 Goals

- **G1** Show each polynomial as a linked list of nodes (coefficient, exponent, next).
- **G2** Animate all three approaches with step narration and a highlighted pseudocode panel.
- **G3** Let the user compare the approaches on the same input (live counters and a side-by-side page).
- **G4** Be correct: all three approaches give the same result as a reference calculation.
- **G5** Be easy to demo in a viva or practical exam in under 5 minutes.

### 1.2 Non-goals

Subtraction, multiplication or division; polynomials in more than one variable; decimal or fraction coefficients; accounts, saving or login; phone-sized screens (tablet and larger only); generating code in other languages.

### 1.3 Success criteria for submission

| Criterion | Target |
| --- | --- |
| All test cases in Section 14 pass for all three approaches | 100% |
| Step back then step forward shows the identical frame | 100% of tested cases |
| A classmate can enter a polynomial and finish an animation unaided | 5 of 5 in an informal test |
| Works in current Chrome, Edge and Firefox | Yes |
| Viva demo of one example per approach | Under 5 minutes |

## 2. Users and User Stories

Primary users are computer science students learning linked lists. Secondary users are teachers demonstrating in class and examiners checking the project.

| ID | As a | I want to | So that |
| --- | --- | --- | --- |
| US-1 | Student | type two polynomials and see them as linked lists | I understand how a polynomial is stored |
| US-2 | Student | pick an approach and step through it one move at a time | I can follow the pointers at my own pace |
| US-3 | Student | step backwards | I can re-watch a step I missed |
| US-4 | Student | read a one-line explanation of every step | I know why each move happened |
| US-5 | Student | see which pseudocode line is running | I connect the animation to the code |
| US-6 | Student | run all three approaches on the same input and compare counters | I see why their costs differ |
| US-7 | Student | guess the next step before it is shown | I can test myself before the exam |
| US-8 | Teacher | load ready-made examples, including edge cases | I can demonstrate without preparing |
| US-9 | Examiner | see the correct result and complexity for every run | I can verify the work |
| US-10 | Any user | use every control from the keyboard | the tool works without a mouse |

## 3. Scope, Assumptions and Constraints

**In scope:** polynomial addition only; three approaches; input, presets and random generator; playback controls; narration; pseudocode panel; counters; compare page; learn page; prediction mode; light and dark theme.

**Assumptions**

- One variable, x. Coefficients are non-zero integers from -999 to 999. Exponents are whole numbers from 0 to 99.
- At most 10 terms per polynomial, so every animation fits on screen and stays readable.
- Used on a laptop, desktop or tablet (width 768 px or more) in a current browser.

**Constraints**

- HTML, CSS and JavaScript only. No framework is required and there is no build step.
- ES modules are used, so the site must be opened through a local server (VS Code Live Server, or python -m http.server) or hosted. Opening files by double-click will not work in Chrome.
- Everything works offline after loading. No external fonts, CDNs or network calls.

## 4. Site Map and Navigation

| ID | Page | File | Purpose | Priority |
| --- | --- | --- | --- | --- |
| P1 | Home | index.html | Introduce the tool, link to each approach, quick-start example | Must |
| P2 | Visualizer | visualizer.html | Main workspace: input, animation, pseudocode, counters, result | Must |
| P3 | Compare | compare.html | Run all three approaches on one input, side by side, with a summary table | Should |
| P4 | Learn | learn.html | Theory, pseudocode, complexity table and viva questions | Must |
| M1 | Help (modal) | opens from any page | Input format, colour legend, keyboard shortcuts | Should |

**Navigation bar (every page):** logo (goes Home), Visualizer, Compare, Learn, theme toggle, Help (?). The current page is underlined and marked with aria-current.

**Shareable links (Should).** The Visualizer and Compare pages read and write the URL query, for example visualizer.html?p=5x^4%2B3x^2&q=2x^4&a=nl&step=6, where a is tp, nl or ins. Opening such a link rebuilds the same state.

**Main user flow**

1. Home, then click an approach card (or Try the example).
2. Visualizer opens with that approach and the Basic preset loaded.
3. User edits input if wanted, presses Build lists, then plays or steps.
4. At the end, the result and complexity are shown, with a button to Compare all three.
5. Compare page opens with the same input. Learn page is reachable from every page.

## 5. Core Concepts

**Data structure.** A polynomial is a singly linked list. Each term is one node with three parts: coefficient, exponent and a next pointer. The list has a head pointer. The zero polynomial is an empty list (head is NULL).

```
P(x) = 5x^4 + 3x^2 + 2x + 7

head -> [ 5 | 4 | next ] -> [ 3 | 2 | next ] -> [ 2 | 1 | next ] -> [ 7 | 0 | next ] -> NULL
          coef  exp           coef  exp
```

**Canonical form.** Terms in descending exponent order, no repeated exponent, no zero coefficient. The result R is always canonical.

**Glossary**

| Term | Meaning |
| --- | --- |
| P, Q | The two input polynomials (capital letters) |
| R | The result polynomial |
| p, q | Traversal pointers into P and Q (lower case) |
| tail | Pointer to the last node of R while it is being built |
| c, prev | Cursor and trailing pointer used by the insertion approach |
| visited flag | Marks a node of Q that has already been matched (nested loop) |
| lifted | A Q node picked up and held above its row before being inserted |
| normalise | Sort a polynomial by descending exponent |
| step record | One immutable snapshot of the whole screen state (Section 8) |

## 6. Input Specification

### 6.1 Ways to enter a polynomial

- **Text field (Must):** one field each for P and Q, for example 5x^4 + 3x^2 + 2x + 7.
- **Term builder (Should):** coefficient box, exponent box and an Add term button, which appends the term to the text field. The text field is always the source of truth.
- **Presets (Must)** and a **Random generator (Should)** fill both fields.

### 6.2 Accepted text format

- Terms are joined by + or - (the Unicode minus is also accepted). Spaces are optional. Case is ignored (x or X).
- Forms allowed: 5x^4, -3x^2, x (means 1x^1), -x, x^3 (means 1x^3), 7 (means 7x^0), 5x^0.
- Terms may be in any order. The spelling 0 alone means the zero polynomial (empty list).
- Not allowed: other letters, decimals, fractions, brackets, negative or decimal exponents.

### 6.3 Validation rules

| Rule | Kind | Message shown under the field |
| --- | --- | --- |
| Field is empty | Error | Enter a polynomial, or type 0 for the zero polynomial. |
| Unreadable text | Error | Could not read 3y^2. Use terms like 5x^3, -x or 7. |
| Zero coefficient term (0x^2) | Error | Terms with coefficient 0 are not allowed. Remove 0x^2. |
| Exponent negative, fractional or above 99 | Error | Exponents must be whole numbers from 0 to 99. |
| Coefficient not an integer or beyond 999 | Error | Coefficients must be whole numbers from -999 to 999. |
| More than 10 terms | Error | Maximum 10 terms per polynomial. |
| Same exponent twice in one polynomial | Error | Exponent 2 appears twice in P. Combine them, or press Combine like terms. |
| Not in descending order, and the chosen approach needs it | Warning | P is not sorted. This approach needs descending order. Normalise, or switch to Nested loop. |

Errors stop Build lists and mark the field red with an icon and text (never colour alone). A warning allows Build but blocks Play until the user presses Normalise or changes approach.

**Sorting requirements by approach**

| Approach | P must be sorted | Q must be sorted |
| --- | --- | --- |
| Two-pointer | Yes | Yes |
| Nested loop | No | No |
| Insertion | Yes (R starts as a copy of P) | Only when the cursor optimisation is on |

### 6.4 Presets

| Name | P | Q | Expected R | Tests |
| --- | --- | --- | --- | --- |
| Basic | 5x^4 + 3x^2 + 2x + 7 | 2x^4 + 4x^3 - 3x^2 + 6 | 7x^4 + 4x^3 + 2x + 13 | Match, cancel, unmatched |
| Full cancellation | 3x^2 + 2x | -3x^2 - 2x | 0 | Empty result |
| Empty operand | 4x^3 + 1 | 0 | 4x^3 + 1 | Zero polynomial input |
| Disjoint exponents | 6x^5 + 2x^3 | 7x^4 + x | 6x^5 + 7x^4 + 2x^3 + x | No matches |
| Different lengths | x^6 + x^3 + 1 | 2x^3 | x^6 + 3x^3 + 1 | m not equal to n |
| Identical | 2x^2 + 3 | 2x^2 + 3 | 4x^2 + 6 | All match |
| Unsorted input | 2x + 7 + 5x^4 + 3x^2 | 6 - 3x^2 + 4x^3 + 2x^4 | 7x^4 + 4x^3 + 2x + 13 | Warning and normalise |

The random generator takes a term count (1 to 10) for each polynomial, picks unique exponents from 0 to 12 and non-zero coefficients from -9 to 9.

**Zero result display:** R(x) = 0 is written, and the result row shows an empty list (NULL only).

## 7. The Three Approaches

### 7.0 Rules common to all approaches

- P and Q are drawn as given and never changed. Result nodes are new nodes, shown in row R.
- A sum of zero makes both source nodes flash red with a cross badge, and no result node is created.
- The algorithm code uses a real Node class with next pointers for all traversal, not array indexing.
- **Counter definitions (used by the code and the tests):**
  - **Comparison:** one check of exponents between a node under p (or the lifted term) and a node under q (or c). Skipping a visited node is not a comparison.
  - **Node created:** each new node added to R, including the initial copy of P in the insertion approach.
  - **Pointer move:** a traversal pointer (p, q or c) advancing to the next node, including advancing onto NULL.
  - **Sort comparison:** counted separately, only in the nested-loop sort phase.

### 7.1 Approach 1: Two-pointer traversal

**Idea.** p walks P and q walks Q together. The larger exponent is copied first, equal exponents merge, and R is built front to back with a tail pointer.

**Requires** P and Q sorted in descending order.

```
1  p = P.head; q = Q.head; R = empty
2  while p != NULL and q != NULL:
3    if p.exp == q.exp:
4      sum = p.coef + q.coef
5      if sum != 0: append(R, sum, p.exp)
6      p = p.next; q = q.next
7    else if p.exp > q.exp:
8      append(R, p.coef, p.exp); p = p.next
9    else:
10     append(R, q.coef, q.exp); q = q.next
11 copy every remaining node of P or Q into R
12 return R
```

**What the user sees**

- p and q appear on the two head nodes, both highlighted yellow. R is empty.
- The narration states each comparison, for example: 4 vs 3, p is larger, so copy 5x^4 into R.
- Larger exponent: a green copy appears at the end of R, tail moves to it, the source node turns grey, that pointer moves on.
- Equal exponents: both nodes merge into one green node with the summed coefficient and both pointers advance. A zero sum flashes red and adds nothing.
- One list ends: the other list's remaining nodes are copied one per step under a Leftover badge.
- Finish: tail rests on the last result node, whose next is NULL.

**Complexity:** time O(m + n), at most m + n comparisons; extra space O(1) apart from the output list.

### 7.2 Approach 2: Nested-loop traversal

**Idea.** An outer pointer p stays on one node of P while an inner pointer q scans Q for the same exponent. Matched Q nodes get a visited flag so they are not added twice. Unmatched terms are collected, then the result is sorted.

**Requires** only unique exponents within each polynomial. It works on unsorted input.

```
1  R = empty; mark every node of Q unvisited
2  for each node p in P:
3    found = false
4    for each unvisited node q in Q:
5      if p.exp == q.exp:
6        sum = p.coef + q.coef
7        if sum != 0: append(R, sum, p.exp)
8        mark q visited; found = true; break
9    if not found: append(R, p.coef, p.exp)
10 for each unvisited node q in Q: append(R, q.coef, q.exp)
11 sort R by exponent, descending
12 return R
```

**What the user sees**

- **Phase 1, Scan.** p lands on a node of P and turns blue with an Outer label. q starts at the head of Q. Each node q lands on flashes yellow and the comparison counter ticks up.
- Visited Q nodes are shown grey with a dashed outline and are skipped (a pointer move, not a comparison).
- Match: both nodes merge into a green result node, the Q node turns grey, the inner loop stops. Zero sum flashes red.
- No match: q reaches NULL, the narration says there is no match for that exponent in Q, and the P node is copied to R unchanged.
- **Phase 2, Leftover.** p disappears. Every Q node that is not grey is copied into R in turn.
- **Phase 3, Sort.** R is checked left to right. A node bigger than its predecessor is lifted (purple), the arrows reopen, and it drops into the right place. Sort comparisons show in their own counter.

**Complexity:** scan O(m x n) time. Sorting k result nodes adds up to O(k^2) in the worst case, shown by its own counter, and is small when P is already sorted. Extra space O(n) for visited flags, plus the output.

### 7.3 Approach 3: Insertion-based

**Idea.** Copy P into R. Then take each term of Q, find where it belongs in R, and either merge it into an existing node or link in a new node.

**Requires** P sorted. Q may be in any order, unless the cursor optimisation is on, which needs Q sorted too.

```
1  R = copy of P
2  for each node q in Q:
3    lift q out of its row
4    c = (optimised and cursor set) ? cursor : R.head; prev = node before c
5    while c != NULL and c.exp > q.exp: prev = c; c = c.next
6    if c != NULL and c.exp == q.exp:
7      c.coef = c.coef + q.coef
8      if c.coef == 0: unlink c (prev.next = c.next)
9    else:
10     insert new node (q.coef, q.exp) between prev and c
11   cursor = node where the term landed (its predecessor if it was unlinked)
12 return R
```

**What the user sees**

- R fades in as a copy of P, left to right.
- q picks up the first Q node, which lifts out of its row (purple). Cursor c (yellow) walks R with a trailing prev tag.
- Equal exponent: the coefficient merges into the existing node, which turns green. A zero sum flashes red, the node is unlinked and the arrows are redrawn.
- Otherwise the lifted term drops into the gap as a green node and the arrows before and after it rewire on screen.
- Next term: the cursor restarts at the head, or in optimised mode stays where it landed.
- A toggle switches the cursor optimisation on and off, and the counters show the difference.

**Complexity:** O(m x n) worst case (cursor restarts each time); O(m + n) with the cursor on sorted Q, because the cursor never moves backwards. Extra space O(1) apart from the output list.

### 7.4 Reference counters for the Basic preset

These values follow the counter definitions in 7.0 and are asserted by the tests.

| Approach | Comparisons | Nodes created | Pointer moves |
| --- | --- | --- | --- |
| Two-pointer | 5 | 4 | 8 |
| Nested loop | 7 (plus sort comparisons, counted separately) | 4 | Set after implementation |
| Insertion, cursor off | 10 | 5 (4 copied, 1 inserted) | Set after implementation |
| Insertion, cursor on | 8 | 5 | Set after implementation |

Two-pointer trace for Basic: 4 vs 4 merge to 7x^4; 2 vs 3 copy 4x^3; 2 vs 2 sum is 0 so dropped; 1 vs 0 copy 2x; 0 vs 0 merge to 13. In the nested loop, R is 7x^4, 2x, 13, 4x^3 before sorting, and 4x^3 is moved into second place during the sort phase.

## 8. Step Model

Every approach runs once and returns a list of step records. The player only moves an index through that list, and the screen is drawn as a pure function of one record. This is what makes step-back, speed changes, jump-to-end, prediction mode and the Compare page work without re-running any algorithm.

```
step = {
  id: 7,
  phase: 'scan',          // scan | leftover | sort | copy | insert | done
  action: 'MATCH_MERGE',
  line: 4,                // pseudocode line to highlight
  narration: '2 vs 2: exponents are equal, so add 3 + (-3) = 0.',
  lists: {
    P: [ { id: 'P1', coef: 5, exp: 4, state: 'visited' }, ... ],
    Q: [ ... ],
    R: [ ... ]
  },
  pointers: { p: 'P2', q: 'Q3', tail: 'R2', c: null, prev: null, lifted: null },
  counters: { comparisons: 3, created: 2, moves: 5, sortComparisons: 0 },
  predict: { question: '...', options: ['Copy from P', 'Copy from Q', 'Merge'], answer: 2 }  // COMPARE steps only
}
```

**Rules**

- Snapshots are deep copies and are never changed after creation.
- Node ids are stable across steps (P1, Q3, R2), so the renderer can slide a node from its old position to its new one.
- The first step is INIT and the last is DONE. Counters never decrease. The final R equals the reference result.
- A 10-term by 10-term run stays under about 500 steps, so memory is not a concern.

**Node states:** normal, compare, outer, created, visited, zero, lifted.

**Actions, narration templates and visuals** (text in braces is filled in by the code)

| Action | Emitted when | Narration template | Visual |
| --- | --- | --- | --- |
| INIT | Lists are built | Lists are ready. Press Play or step forward. | All nodes normal |
| SET\_POINTERS | Pointers placed on the heads | p starts at the head of P and q at the head of Q. | Pointer tags appear |
| COMPARE | Two exponents are compared | {a} vs {b}: {outcome in words}. | Yellow on both nodes, comparison counter +1 |
| MATCH\_MERGE | Equal exponents, non-zero sum | Exponents are equal. {c1} + {c2} = {s}, so add {s}x^{e} to R. | Green node in R, sources grey |
| ZERO\_DROP | Equal exponents, sum is zero | {c1} + {c2} = 0, so the x^{e} term disappears. | Red flash and cross badge on the sources, no new node |
| COPY\_NODE | A node is copied to R unchanged | Exponent {e} is only in {P or Q}. Copy it into R. | Green node appended, source grey |
| SKIP\_VISITED | q passes a used node (nested) | This node of Q was already used, so skip it. | Dashed grey node, pointer move +1 |
| NO\_MATCH | q reaches NULL (nested) | There is no exponent {e} in Q. Keep the term from P as it is. | q rests on the NULL marker |
| MARK\_VISITED | After a nested-loop match | Mark this node of Q as used. | Node turns grey |
| LEFTOVER | Leftover copying begins | One list is finished. Copy what is left of the other. | Leftover badge |
| SORT\_CHECK | Sort phase compares neighbours | Is exponent {b} bigger than {a}? {yes or no}. | Yellow neighbours, sort counter +1 |
| SORT\_LIFT | An out-of-order node is lifted | Exponent {e} is out of order. Lift it out of the list. | Node turns purple and rises |
| SORT\_PLACE | The lifted node is re-linked | Place it after exponent {x}. Arrows are re-linked. | Arrows redrawn, node drops in |
| COPY\_LIST | Insertion approach starts | R starts as a copy of P. | Nodes fade in left to right |
| LIFT\_TERM | A Q node is picked up | Pick up {c}x^{e} from Q. | Node turns purple and lifts |
| CURSOR\_STEP | c advances | Exponent {x} is bigger than {e}, so move on. | Cursor moves, pointer move +1 |
| INSERT\_NODE | A new node is linked in | No node has exponent {e}. Link a new node between {prev} and {c}. | Green drop, arrows rewire |
| UNLINK\_NODE | Zero sum in insertion | The sum is zero. Unlink the node so prev points past it. | Red flash, arrows redrawn |
| DONE | Run finished | Done. R(x) = {result}. | Result panel appears |

**Prediction data.** Every COMPARE step carries a predict object. For two-pointer the options are Copy from P, Copy from Q or Merge. For nested loop they are Match found or No match yet. For insertion they are Move cursor on, Merge here or Insert before this node.

## 9. Visual Design System

### 9.1 Node anatomy

```
+--------+-------+--------+
|  coef  |  exp  |  next  |-----> next node (or NULL marker)
+--------+-------+--------+
    5        4
```

- Node: three cells, each 40 px wide and 44 px high (120 x 44 total). Gap between nodes 36 px, filled by an arrow with a filled triangle head.
- The last node's arrow ends at a NULL marker (small box labelled NULL).
- Each row has a label (P, Q or R) at the left and a head arrow into the first node. Pointer tags (p, q, tail, c, prev) sit under their node as rounded pills with a small up arrow.
- Numbers use a monospace font at 18 px. Negative coefficients show a minus sign, never brackets.

### 9.2 State colours with non-colour cues

Colour is never the only signal. Every state also has a shape or label cue.

| State | Meaning | Fill | Cue besides colour |
| --- | --- | --- | --- |
| normal | Untouched node | #FFFFFF, border #5F6B7A | None |
| compare | Nodes being compared now | #FFE27A | Thick 3 px border and a Compare tag |
| outer | Outer pointer node (nested) | #BBD3FF | Outer tag and a thick left bar |
| created | New node in R | #B7E4C7 | Check mark badge at top right |
| visited | Used or consumed node | #E3E6EA, text #6B7480 | Dashed border |
| zero | Sum of zero, term dropped | #F8B4B0 | Cross badge and two quick flashes |
| lifted | Node held above its row | #D9C6F2 | Raised 24 px with a drop shadow |

Node fills stay light in both themes, so dark text on them always has strong contrast. Check every pair with a contrast tool before release (target 4.5:1 or better).

### 9.3 Page tokens (CSS custom properties)

| Token | Light | Dark |
| --- | --- | --- |
| --bg | #F7F8FA | #12161C |
| --surface | #FFFFFF | #1B222B |
| --text | #1B2430 | #E8ECF1 |
| --muted | #5B6676 | #A7B1BF |
| --border | #D5DAE1 | #323C49 |
| --accent | #2F6FED | #7BA4FF |
| --error | #C5221F | #FF8A85 |
| --warning | #8A5A00 | #FFC857 |

Theme follows the system setting by default. The toggle in the nav bar overrides it and the choice is remembered with localStorage (wrapped in try and catch).

### 9.4 Motion

- Base animation time 600 ms divided by the speed setting, never below 100 ms. Auto-advance pause between steps is 900 ms divided by speed.
- Effects: fade-in for new nodes, slide for position changes, lift for lifted nodes, two 150 ms flashes for zero sums, arrows drawn with a stroke animation.
- Reduced motion (the system setting or an in-app toggle): no sliding or flashing, states change instantly, and the cue badges still show.

### 9.5 Typography, spacing and layout

- Fonts: system-ui stack for text, ui-monospace stack for numbers and pseudocode. No web fonts.
- Sizes: body 16 px, narration 18 px, page title 32 px. Spacing scale 4, 8, 12, 16, 24, 32. Corner radius 8 px. Minimum button size 40 x 40 px.
- Maximum content width 1280 px. At 1024 px and above the Visualizer has two columns (canvas about two thirds, pseudocode and counters one third). From 768 to 1023 px it is one column. Below 768 px a notice says the tool works best on a tablet or larger, but the page still scrolls.
- Each list row scrolls sideways inside its own box and auto-scrolls to keep the active node in view.

## 10. Pages and Wireframes

These are low-fidelity layouts. Numbers in square brackets refer to the component notes under each sketch. Everything is plain HTML and CSS. The sketches are drawn at desktop width.

### 10.1 Home (index.html)

```
+--------------------------------------------------------------------------------+
| (logo) Poly Visualizer          Visualizer   Compare   Learn      [theme] [?]  |
+--------------------------------------------------------------------------------+
|                                                                                |
|   [H1] Polynomial Addition, Made Visible                                       |
|   Watch linked-list nodes, pointers and sums move step by step.                |
|   [ Try the example ]   [ Open the visualizer ]                       [H2]     |
|                                                                                |
|   [5|4] -> [3|2] -> [2|1] -> [7|0] -> NULL        (decorative looping strip)   |
|                                                                                |
+--------------------------------------------------------------------------------+
|  Three ways to add polynomials                                        [H3]     |
|  +---------------------+  +---------------------+  +---------------------+     |
|  | 1 Two-pointer       |  | 2 Nested loop       |  | 3 Insertion         |     |
|  | Merge two sorted    |  | Search Q for every  |  | Copy P, then insert |     |
|  | lists together      |  | term of P           |  | each term of Q      |     |
|  | Time O(m + n)       |  | Time O(m x n)       |  | O(m x n), O(m + n)  |     |
|  | [ Open -> ]         |  | [ Open -> ]         |  | [ Open -> ]         |     |
|  +---------------------+  +---------------------+  +---------------------+     |
+--------------------------------------------------------------------------------+
|  How it works:  1 Enter   2 Build lists   3 Step through   4 Compare   [H4]    |
+--------------------------------------------------------------------------------+
|  Academic project | Course | Your name | Source link                    [H5]   |
+--------------------------------------------------------------------------------+
```

- **\[H2\]** Try the example opens visualizer.html with the Basic preset and Two-pointer selected. Open the visualizer opens it empty.
- **\[H3\]** Each card links to visualizer.html with a=tp, a=nl or a=ins and the Basic preset loaded.
- **\[H1, H4, H5\]** Static content. The decorative strip is hidden from screen readers and stops when reduced motion is on.

### 10.2 Visualizer (visualizer.html), main layout

```
+--------------------------------------------------------------------------------+
| NAV: logo | Visualizer* | Compare | Learn                        [theme] [?]   |
+--------------------------------------------------------------------------------+
| [1] INPUT PANEL                                                                |
|  P(x) [ 5x^4 + 3x^2 + 2x + 7                        ]  Preset [Basic       v]  |
|  Q(x) [ 2x^4 + 4x^3 - 3x^2 + 6                      ]  [Random][Swap][Clear]   |
|  (message line: error or warning, with [Normalise] / [Combine like terms])     |
|  Approach: (o) Two-pointer  ( ) Nested loop  ( ) Insertion    [ Build lists ] |
+----------------------------------------------------+---------------------------+
| [2] CANVAS                        Phase: Scan      | [3] PSEUDOCODE            |
|  P  head -> [5|4] -> [3|2] -> [2|1] -> [7|0] -> NULL|  1 p = P.head; q = Q.head |
|              ^p                                    |  2 while p and q:         |
|  Q  head -> [2|4] -> [4|3] -> [-3|2] -> [6|0] -> NULL  3 > if p.exp == q.exp   |
|              ^q                                    |  4     sum = ...          |
|  R  head -> [7|4] -> NULL                          |  5     ...                |
|              ^tail                                 +---------------------------+
|                                                    | [4] COUNTERS              |
|                                                    |  Comparisons      1       |
|                                                    |  Nodes created    1       |
|                                                    |  Pointer moves    2       |
|                                                    |  Time O(m+n) Space O(1)   |
+----------------------------------------------------+---------------------------+
| [5] NARRATION  Step 3 of 14 - 4 vs 4: exponents are equal, so add 5 + 2 = 7.   |
+--------------------------------------------------------------------------------+
| [6] CONTROLS  [|<] [<] [ Play ] [>] [>|]   Speed [0.25][0.5][1][2][4]          |
|      Step 3 / 14 [=========-------------]    [ ] Predict mode  [x] Cursor opt. |
+--------------------------------------------------------------------------------+
| [7] LEGEND  yellow comparing | blue outer | green new | grey used | red zero |   |
|             purple lifted                                                      |
+--------------------------------------------------------------------------------+
| [8] RESULT  R(x) = 7x^4 + 4x^3 + 2x + 13           (appears when finished)     |
|      [ Compare all three -> ]   [ Copy result ]   [ Copy share link ]          |
+--------------------------------------------------------------------------------+
```

**Component notes**

- **\[1\] Input panel.** Two labelled text fields, preset dropdown, Random, Swap P and Q, Clear, approach radio group and the primary Build lists button. A message line under each field (aria-live polite) shows errors and warnings with their fix buttons. The Cursor optimisation checkbox appears only when Insertion is selected, and is disabled with a tooltip when Q is unsorted.
- **\[2\] Canvas.** Three rows, P, Q and R, drawn as SVG. A phase badge (Scan, Leftover, Sort, Copy, Insert) sits at the top right. R shows an empty placeholder (R is empty) until the first node appears. Rows scroll sideways when they overflow.
- **\[3\] Pseudocode.** Monospace with line numbers. The active line has a tinted background, a left bar and a marker, so it does not rely on colour. Only the selected approach is shown. The panel scrolls to keep the active line visible.
- **\[4\] Counters.** Comparisons, nodes created and pointer moves update every step. Sort comparisons appear only for Nested loop. Time and space labels show the approach's complexity.
- **\[5\] Narration.** One plain sentence per step in an aria-live polite region, with the step number.
- **\[6\] Controls.** Restart, step back, play or pause, step forward, jump to end, a speed segmented control and a step scrubber (range input). Every button has a text label or aria-label and a tooltip showing its shortcut.
- **\[7\] Legend.** Swatch, cue icon and text for every state.
- **\[8\] Result.** Appears on the DONE step. Shows the polynomial as text, with R(x) = 0 and an empty list for a zero result, plus a one-line summary of the counters.

**Screen states**

| State | Enabled controls | What the user sees |
| --- | --- | --- |
| Empty | Input and Build lists | Canvas placeholder: Enter two polynomials and press Build lists. |
| Input changed after a build | Build lists only | Banner: Input changed. Press Build lists to update. The animation is dimmed. |
| Ready (step 0) | Play, step forward, scrubber | Lists drawn, nothing highlighted. |
| Playing | Pause, step buttons, speed | Steps advance automatically. Any step button pauses first. |
| Paused | Everything | Same as Ready, at the current step. |
| Finished | Restart, step back, Play (restarts) | Result panel visible. |

### 10.3 Visualizer: error and warning states

```
 P(x) [ 5x^4 + 3x^2 + 2x^2 + 7                       ]    red border + icon
      (x) Exponent 2 appears twice in P.  [ Combine like terms ]
 Q(x) [ 6 - 3x^2 + 4x^3 + 2x^4                       ]    amber border + icon
      (!) Q is not sorted. Two-pointer needs descending order.
          [ Normalise ]   [ Switch to Nested loop ]
 Approach: (o) Two-pointer  ( ) Nested loop  ( ) Insertion      [ Build lists ]
                                                           (disabled while an error shows)
```

- Errors: red border, error icon and text. Build lists is disabled until all errors are fixed.
- Warnings: amber border, warning icon and text. Build is allowed, Play is blocked until the user presses Normalise or changes approach.
- Focus moves to the first invalid field when Build lists is pressed with errors.

### 10.4 Visualizer: finished state (canvas and result only)

```
 P  head -> [5|4] -> [3|2] -> [2|1] -> [7|0] -> NULL       (all grey, dashed)
 Q  head -> [2|4] -> [4|3] -> [-3|2] -> [6|0] -> NULL      (all grey, dashed)
 R  head -> [7|4] -> [4|3] -> [2|1] -> [13|0] -> NULL      (green, check badges)

 R(x) = 7x^4 + 4x^3 + 2x + 13
 Done in 5 comparisons, 4 nodes created, 8 pointer moves.   Time O(m + n), space O(1)
```

### 10.5 Visualizer: prediction mode

```
| [5] PREDICT   p.exp = 2, q.exp = 3. What happens next?                        |
|      ( ) Copy from P    ( ) Copy from Q    ( ) Merge both        [ Check ]    |
|      Score so far: 3 of 4                                                     |
```

When Predict mode is on, playback pauses at every COMPARE step and the narration is hidden. The user picks an option and presses Check. A correct answer shows a tick and plays the step with its narration. A wrong answer shakes the panel once, shows the narration as a hint and plays the correct step. There is no penalty other than the score. At the end the result panel adds: Predicted 7 of 9 correctly.

### 10.6 Compare page (compare.html)

```
+--------------------------------------------------------------------------------+
| NAV                                                                            |
+--------------------------------------------------------------------------------+
| INPUT PANEL (same as the Visualizer, no approach selector)   [ Run all three ] |
+--------------------------------------------------------------------------------+
| SHARED CONTROLS  [|<] [<] [ Play ] [>] [>|]   Speed [..]    Step n / longest run |
+------------------------+------------------------+------------------------------+
| 1 Two-pointer          | 2 Nested loop          | 3 Insertion  [x] cursor opt. |
| Phase badge            | Phase badge            | Phase badge                  |
| P  [..] [..] [..]      | P  [..] [..] [..]      | P  [..] [..] [..]            |
| Q  [..] [..] [..]      | Q  [..] [..] [..]      | Q  [..] [..] [..]            |
| R  [..] [..]           | R  [..] [..]           | R  [..] [..]                 |
| narration line         | narration line         | narration line               |
| Cmp n  New n  Mv n     | Cmp n  New n  Mv n     | Cmp n  New n  Mv n           |
+------------------------+------------------------+------------------------------+
| SUMMARY (a row fills in when that run finishes)                                |
|  Approach      Comparisons   Nodes created   Moves    Time        Space        |
|  Two-pointer        ..            ..           ..     O(m + n)    O(1)         |
|  Nested loop        ..            ..           ..     O(m x n)    O(n)         |
|  Insertion          ..            ..           ..     O(m x n)    O(1)         |
|  Bar chart of comparisons: one labelled horizontal bar per approach            |
|  Self-check: all three produced the same result  R(x) = ...                    |
+--------------------------------------------------------------------------------+
```

**Behaviour**

- All three runs are computed up front. One shared step index drives all three panels. A panel that finishes early shows a Finished badge and holds its last frame.
- The same renderer is used at a smaller scale (nodes about 64 px wide).
- If the input is unsorted, panels 1 and 3 show the sorted-input warning, and one Normalise button in the input panel fixes the input for all three. The Nested loop panel runs regardless.
- Bars are plain CSS with the number written on each bar. A one-line explanation under the chart says why the counts differ for this input.
- The self-check compares the three result lists. A mismatch shows an error banner (this should never happen and is a signal of a bug).

### 10.7 Learn page (learn.html)

```
+--------------------------------------------------------------------------------+
| NAV                                                                            |
+----------------------+---------------------------------------------------------+
| ON THIS PAGE         | 1 Polynomials as linked lists                           |
|  1 Linked lists      |   short text, node diagram, canonical form              |
|  2 Two-pointer       | 2 Two-pointer          [ Idea ] [ Pseudocode ] [ Complexity ]  |
|  3 Nested loop       |   text, copyable pseudocode block, small diagram        |
|  4 Insertion         | 3 Nested loop         (same layout)                     |
|  5 Comparison        | 4 Insertion           (same layout)                     |
|  6 Viva questions    | 5 Comparison table                                      |
|                      | 6 Viva questions (accordion)                            |
|  (sticky, highlights |   [ Try it in the visualizer -> ] at the end of each     |
|   the current part)  |   approach section                                      |
+----------------------+---------------------------------------------------------+
```

**Content to write for this page**

- Section 1: what a polynomial node holds, the NULL end, canonical form, and the Basic example.
- Sections 2 to 4: for each approach, the idea in 3 to 4 sentences, when it is a good choice, the pseudocode from Section 7 (with a Copy button) and the time and space complexity with one sentence of reasoning.
- Section 5, the comparison table, is below.
- Section 6 uses the viva questions in Appendix A.

| Approach | Time | Extra space | Needs sorted input | Good at | Weak at |
| --- | --- | --- | --- | --- | --- |
| Two-pointer | O(m + n) | O(1) | Both lists | Speed and simplicity | Wrong on unsorted input |
| Nested loop | O(m x n) plus sort | O(n) | Neither | Works on any order | Slowest, needs a final sort |
| Insertion | O(m x n), or O(m + n) with cursor | O(1) | P (and Q for the cursor mode) | Updating an existing polynomial, shows re-linking | Rescans from the head unless optimised |

### 10.8 Help modal (opens from any page)

```
+------------------------------ Help ---------------------------------- [x] +
| Tabs:  Input format   Colours   Shortcuts                                   |
|                                                                             |
| Input format   Valid: 5x^4 + 3x^2 - x + 7     Invalid: 3y^2, 2.5x, x^-1      |
| Colours        each swatch with its cue icon and name                       |
| Shortcuts      Space  play or pause        Left / Right  step back or forward|
|                Home   restart              End  jump to the end              |
|                + / -  speed up or down     ?  open help       Esc  close     |
+-----------------------------------------------------------------------------+
```

Shortcuts are ignored while a text field has focus (except Esc). The modal traps focus while open and returns it to the Help button on close.

### 10.9 Tablet layout (768 to 1023 px)

One column in this order: input panel, approach and Build lists, canvas, controls, narration, pseudocode, counters, legend, result. The controls bar sticks to the bottom of the screen while the user scrolls. Compare shows the three panels as tabs with a shared control bar, and the summary table below.

## 11. Functional Requirements

Must items are needed for submission. Should items are built if time allows. Could items are optional extras.

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| F-01 | Parse polynomial text | Must | Every valid form in 6.2 parses to the right terms |
| F-02 | Validate input with clear messages | Must | Each rule in 6.3 shows its message; focus moves to the first invalid field |
| F-03 | Build lists: draw P and Q as node rows | Must | Each node shows coefficient, exponent and a next arrow; head arrow and NULL marker present |
| F-04 | Seven presets | Must | Choosing a preset fills both fields; the result matches 6.4 |
| F-05 | Approach selector with three approaches | Must | Switching rebuilds the steps and swaps the pseudocode |
| F-06 | Two-pointer animation | Must | Follows 7.1; counters match 7.4 |
| F-07 | Nested-loop animation with visited flags, leftover and sort phases | Must | Follows 7.2; counters match 7.4 |
| F-08 | Insertion animation with cursor toggle | Must | Follows 7.3; Basic gives 10 comparisons with the cursor off and 8 with it on |
| F-09 | Playback: play, pause, step forward, step back, restart, jump to end, speed 0.25x to 4x, scrubber | Must | Step back then step forward gives an identical frame |
| F-10 | One narration sentence per step | Must | Every step has narration, announced to screen readers |
| F-11 | Pseudocode panel with active line highlighted | Must | The highlighted line equals step.line on every step |
| F-12 | Live counters | Must | Defined as in 7.0; never decrease |
| F-13 | Result display including the zero polynomial | Must | Shows R(x) text and result list; zero shows R(x) = 0 and an empty list |
| F-14 | Complexity labels | Must | Time and space shown on the Visualizer and the Learn page |
| F-15 | Learn page | Must | Contains everything listed in 10.7 |
| F-16 | Home page | Must | Matches 10.1; all links work |
| F-17 | Navigation bar on every page | Must | Current page marked; fully keyboard operable |
| F-18 | Normalise and Combine like terms | Should | Normalise sorts descending; Combine adds equal exponents and removes zero sums |
| F-19 | Random generator | Should | Respects the limits in 6.4 and always gives valid input |
| F-20 | Term builder | Should | Add term appends a valid term to the text field |
| F-21 | Compare page | Should | Matches 10.6; the self-check passes on all presets |
| F-22 | Prediction mode | Should | Behaves as in 10.5; score shown at the end |
| F-23 | Shareable URL | Should | Opening a copied link restores input, approach and step |
| F-24 | Light and dark theme | Should | Follows the system setting; toggle works and is remembered |
| F-25 | Help modal | Should | Three tabs; focus trapped and returned on close |
| F-26 | Keyboard shortcuts | Should | All shortcuts in 10.8 work and are ignored inside text fields |
| F-27 | Reduced-motion setting | Should | No sliding or flashing; cue badges still show |
| F-28 | Copy result and copy pseudocode buttons | Could | Text is placed on the clipboard |
| F-29 | Export the step log as a text file | Could | One line per step: number, action, narration |
| F-30 | Practice quiz page | Could | Ten multiple-choice questions based on Appendix A |

**Definition of done for any feature:** it works in current Chrome, Edge and Firefox; it can be used with the keyboard; it has a unit test or a line in the manual checklist (Section 14); and it causes no console errors.

## 12. Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| Correctness | All three approaches match the reference calculation on every preset and on 200 seeded random pairs |
| Performance | Animation holds 60 frames per second for lists up to 10 terms; building all steps for the largest input takes under 50 ms; the whole site is under 300 KB with no images |
| Accessibility | Every action works from the keyboard; narration is an aria-live region; visible focus outline (2 px); text contrast at least 4.5:1; state cues are never colour-only; reduced-motion respected; Lighthouse accessibility score of 90 or more |
| Browsers | Current Chrome, Edge and Firefox; Safari on a best-effort basis |
| Responsive | Desktop and tablet as in 9.5 |
| Privacy and offline | No network requests after the first load; no cookies; localStorage only for theme and reduced-motion choices, always inside try and catch |
| Maintainability | ES modules; algorithm code never touches the DOM; JSDoc on every exported function; a README with run, test and deploy steps |
| Robustness | No uncaught exception for any input, including empty or random text |

## 13. Technical Architecture

### 13.1 Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Markup | HTML5 with semantic landmarks | Accessible structure |
| Styling | Plain CSS with custom properties (tokens) | No build step; easy theming |
| Logic | Vanilla JavaScript, ES modules | Matches the course stack; no dependencies |
| Drawing | Inline SVG for lists, CSS transitions for movement | Sharp at any zoom, selectable text, no animation library |
| Tests | Node built-in test runner (node --test) for core and algorithm modules; a manual checklist for the UI | Core code has no DOM, so it can run in Node |
| Hosting | GitHub Pages | Free, and gives a link that opens anywhere |

### 13.2 Data flow

```
Input text --> parser --> validate --> terms for P and Q
                                            |
               +----------------------------+----------------------------+
               v                            v                            v
        twoPointer.run               nestedLoop.run                insertion.run
   (build real Node lists, traverse with next pointers, record steps)
               |                            |                            |
               +-----------> { steps[], result, stats } <---------------+
                                            |
                                   player (index, speed, timer)
                                            |
          +-----------+-----------+---------+---------+--------------+
          v           v           v         v         v              v
      renderer    narration   pseudocode  counters  result panel  scrubber
```

### 13.3 Folder structure

```
polynomial-visualizer/
  index.html  visualizer.html  compare.html  learn.html
  css/    tokens.css  base.css  components.css  visualizer.css
  js/
    core/        node.js  polyList.js  parser.js  validate.js  normalise.js
    algorithms/  stepRecorder.js  twoPointer.js  nestedLoop.js  insertion.js  reference.js
    player/      player.js
    ui/          renderer.js  controls.js  narration.js  pseudocode.js
                 counters.js  inputPanel.js  nav.js  helpModal.js  theme.js
    pages/       visualizerPage.js  comparePage.js  learnPage.js
  tests/         parser.test.js  algorithms.test.js  steps.test.js  player.test.js
  README.md
```

### 13.4 Module contracts

| Module | Responsibility | Key exports |
| --- | --- | --- |
| core/node.js | The linked-list node | class Node(coef, exp, next = null) |
| core/polyList.js | List helpers | fromTerms, toTerms, toText, cloneList, isSortedDesc, append |
| core/parser.js | Text to terms | parsePoly(text) returns { terms, errors } |
| core/validate.js | Rules from 6.3 | validatePair(termsP, termsQ, approach) returns { errors, warnings } |
| core/normalise.js | Sort and combine | normalise(terms), combineLikeTerms(terms) |
| algorithms/stepRecorder.js | Builds immutable snapshots | record(action, line, narration, extra) |
| algorithms/twoPointer.js, nestedLoop.js, insertion.js | One approach each | run(termsP, termsQ, options) returns { steps, result, stats } |
| algorithms/reference.js | Independent check using a Map | addReference(termsP, termsQ) |
| player/player.js | Playback state | next, prev, goTo, restart, play, pause, setSpeed, on(event) |
| ui/renderer.js | Draws one step | renderStep(svgRoot, step, { scale, reducedMotion }) |

### 13.5 Player states

States: **empty** (no build yet), **ready** (step 0), **playing**, **paused**, **finished**, **stale** (input changed after a build). Events: build, play, pause, next, prev, goTo, reachEnd, inputChanged, restart. A step button pressed while playing pauses first. Play pressed in finished restarts from step 0. inputChanged moves any state to stale until Build lists is pressed.

### 13.6 Rendering approach

- One SVG per row. A node sits at x = index times (node width + gap). Elements are reused by node id, so a changed position becomes a CSS transition on transform.
- State colours come from classes (node--compare, node--created and so on), and the cue badges are part of the same SVG group.
- Arrows are recalculated from the node positions for every step. A new or rewired arrow plays a stroke-draw animation. A removed arrow fades out.
- The renderer reads only the step record and never the algorithm's internal state.

### 13.7 Running it locally

ES modules do not load from file URLs in Chrome. Use VS Code Live Server or run python -m http.server in the project folder and open the printed address. Test the GitHub Pages build before any demo.

## 14. Test Plan

### 14.1 Parser (unit tests)

| Input | Expected |
| --- | --- |
| 5x^4+3x^2 | Terms (5,4) and (3,2) |
| -x | Term (-1,1) |
| x | Term (1,1) |
| 7 | Term (7,0) |
| X^3 - 2 | Terms (1,3) and (-2,0) |
| 0 | Empty list, no error |
| Empty text | Error: enter a polynomial |
| 3y^2 | Error: unreadable |
| 0x^2 | Error: zero coefficient |
| 2.5x | Error: coefficient must be a whole number |
| x^-1 | Error: exponent out of range |
| x^100 | Error: exponent out of range |
| 1000x | Error: coefficient out of range |
| 2x^2 + 3x^2 | Error: duplicate exponent |
| Eleven terms | Error: too many terms |

### 14.2 Algorithms (unit tests)

- Each approach on each of the seven presets gives the expected result from 6.4. For the Unsorted preset, Nested loop runs directly and the other two run after normalise.
- Property test: 200 seeded random pairs, and all three approaches equal the reference result. Input lists are unchanged afterwards.
- Counters for Basic equal the table in 7.4.
- Edge cases: both inputs zero, one input a single term, equal polynomials, all terms cancelling.

### 14.3 Steps and player (unit tests)

- The first step is INIT and the last is DONE. Every step has a narration string and a valid line number.
- Counters never decrease between steps.
- Snapshots are frozen: changing a later step does not change an earlier one.
- goTo(i), then prev, then next returns a frame deep-equal to the one at i.
- Compare page: three runs share one index, and a finished run holds its last frame.

### 14.4 Manual checklist (UI)

- Run Basic with each approach in Chrome, Edge and Firefox.
- Complete a full run using only the keyboard. Check that every control has a visible focus outline.
- Check narration is announced with a screen reader (NVDA or VoiceOver) for at least one run.
- Open Chrome DevTools, Rendering, and emulate each colour-blindness type. Every node state must still be distinguishable by its cue.
- Turn on reduced motion and confirm nothing slides or flashes.
- Resize to 1280, 1024 and 768 px wide and confirm the layouts in 10.2 and 10.9.
- Check text contrast in light and dark themes.
- Trigger every message in 6.3 and confirm the fix buttons work.
- Run Lighthouse accessibility and aim for 90 or more.

## 15. Build Plan and Deliverables

About 15 to 16 working days for one developer. **Build one vertical slice first:** Two-pointer from input to playback, then add Nested loop and Insertion.

| Phase | Days | Work | Done when |
| --- | --- | --- | --- |
| 0 Setup | 0.5 | Repo, folders, tokens.css, nav bar, README skeleton | Empty pages share one nav and theme |
| 1 Core | 2 | Node, polyList, parser, validate, normalise, reference, parser tests | 14.1 tests pass |
| 2 Algorithms | 3 | Step recorder, Two-pointer (1 day), Nested loop (1), Insertion (1) | 14.2 and 14.3 tests pass |
| 3 Renderer and player | 3 | Static lists, node states, arrows, player, controls, narration, pseudocode, counters | Basic plays end to end for Two-pointer |
| 4 Visualizer page | 2 | Input panel, presets, random, normalise, states, result panel | All Must items for the Visualizer work |
| 5 Other pages | 3 | Compare, prediction mode, Home, Learn, Help modal | Pages match Section 10 |
| 6 Polish and release | 2 | Accessibility pass, responsive layouts, theme, share links, cross-browser, deploy | Manual checklist passes |

**If time runs short, cut in this order:** Could items, shareable URL, term builder, dark theme, prediction mode, Compare page. Never cut Nested loop or Insertion, as the project is built on all three approaches.

**Deliverables for submission**

- Source code (repository or zip) and the hosted link.
- README: what it is, how to run it, how to run tests, folder map.
- Project report: problem, objectives, design (reuse Sections 5 to 10 of this document), the three algorithms with complexity, screenshots, test results, limitations and future work.
- Presentation of 8 to 10 slides.
- Demo script of about 5 minutes: Home and the Basic preset; a full Two-pointer run (1.5 min); Nested loop, pointing out the visited nodes and the sort phase (1.5 min); Insertion with the cursor toggle (1 min); the Compare summary table (1 min).
- Viva answers (Appendix A).

## 16. Risks and Open Questions

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Animation work takes longer than planned | Missed deadline | Vertical slice first; use the cut order in Section 15 |
| Pointer and arrow redrawing bugs | Wrong visuals | The renderer draws only from snapshots; test with fixed step lists |
| Step back drifts from forward play | Wrong frames | Snapshots, never undo logic; test in 14.3 |
| Nested-loop sort phase confuses learners | Lost viewers | Phase badge, clear narration, slow speed by default |
| Colour-only cues | Accessibility failure | Cue badges and shapes; colour-blind emulation in 14.4 |
| ES modules fail when files are double-clicked | Demo fails | Demo from GitHub Pages; document the local server in the README |
| No internet at the viva | Demo fails | No external dependencies; keep a local copy and screenshots |
| Course requires another language | Rework | Confirm now; algorithms are isolated and the pseudocode is language-neutral |

**Open questions, with the default this PRD assumes**

1. Does your course or guide require a specific language or tools? Default: HTML, CSS and JavaScript, as in your earlier PRD.
2. Are a report and slides required, and is the deadline fixed? Default: the 3-week plan in Section 15.
3. Should the pseudocode follow a style your syllabus uses (C-like or Python-like)? Default: language-neutral.
4. Are decimal coefficients needed? Default: integers only.
5. Should the project be one page with tabs or several pages? Default: four pages as in Section 4.

## Appendix A: Viva Questions and Short Answers

| Question | Short answer |
| --- | --- |
| Why use a linked list instead of an array for a polynomial? | A sparse polynomial like x^1000 + 1 would waste almost all of an array. A list stores only the non-zero terms, and inserting or removing a term needs no shifting. |
| What does a node hold? | A coefficient, an exponent and a pointer to the next node. |
| Why does the two-pointer approach need sorted input? | It decides which pointer to move by comparing exponents. If a list is unsorted, a matching exponent can be skipped and the result is wrong. |
| What is the time complexity of two-pointer? | O(m + n), because every comparison moves at least one pointer. |
| Why is the nested loop O(m x n)? | For each of the m nodes of P, the inner loop may scan all n nodes of Q. |
| Why does the nested loop mark Q nodes as visited? | So that a matched term is not added again when the leftover Q terms are copied, and so that each Q term is used once. |
| How does the cursor optimisation help the insertion approach? | When Q is sorted, each term belongs at or after the previous one, so the cursor never moves back and the total movement is at most m + n. |
| What happens when two coefficients add to zero? | The term is left out. In the insertion approach the node is unlinked. If everything cancels, the result is the zero polynomial, an empty list. |
| How would you extend this to multiplication? | Multiply every term of P by every term of Q to get partial products, then add them together with one of these approaches. |
