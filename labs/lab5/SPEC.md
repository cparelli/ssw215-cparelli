# SPEC: Developer Portfolio Welcome Page
## 1. Purpose & Scope
- A personal portfolio welcome page for Catherine Parelli, a third-year biomedical engineering student minoring in software engineering.
- Non-Goals: no multi-page routing; no backend; no contact forms.

## 2. Invariants & Negative Constraints
- All styling MUST reside in `./style.css` (no inline style="..." attributes).
- The page MUST NOT load external CSS frameworks or CDNs (no Bootstrap, no Tailwind).
- The avatar image MUST use the relative path `./assets/avatar.png`.
- The layout MUST collapse into a single vertical column on screens narrower than 768px.

- style.css MUST begin with the universal reset:
  `*, *::before, *::after { box-sizing: border-box; }`
- Spacing and font sizes MUST use rem. px MAY be used only for borders.
- Styling MUST use class selectors. ID selectors MUST NOT be used for styling.

- All JavaScript MUST live in ./app.js. index.html MUST NOT contain inline onclick attributes or any <script> block with code inside it.
- app.js MUST be loaded from <head> with <script src="./app.js" defer></script>.
- Showing and hiding MUST be done by adding and removing a CSS class. app.js MUST NOT set styles directly through .style.

## 3. UI Content & Interface Contract
- Hero header: my full name "Catherine Parelli", the subtitle "Biomedical engineering student interested in research and technology", and this bio: "I am a third-year biomedical engineering student at Stevens Institute of Technology with a minor in software engineering. I plan to use my engineering degree to pursue a career in neuroimaging.".
- Action link: a button labelled "See my projects" that links to `#projects`.
- Projects section with id="projects": lists these items:  
- Laser Speckle Imaging: I used MATLAB to collect and analyze images while studying changes in blood flow.
- VR Myoelectric Control: I helped process muscle signal data for a virtual reality research project.
- Social link: GitHub (https://github.com/cparelli) MUST open in a new tab
(target="_blank").

- All text on the page MUST use Georgia as the font, with a serif fallback.

- The page MUST use semantic landmarks: one <header>, one <nav>, one <main>, one
<footer>, and each content group inside its own <section> with a heading.
- There MUST be exactly one <h1>, and heading levels MUST NOT skip (h1 then h2 then h3).
- <nav> MUST contain a link to the projects section and a link to my GitHub profile.
- Each project MUST be an <article class="card"> inside a container that uses display:
flex, flex-wrap: wrap and gap.

- The "See my projects" button MUST have four visually distinct states: :hover, :focus-
visible, :active, and :disabled.
- A second button labelled "Contact me (coming soon)" MUST be present with the HTML
disabled attribute, and MUST NOT look clickable.
- All four state rules MUST live in style.css.

- Above the projects there MUST be a text input with id="filter-input", and a <label>
bound to it reading "Filter projects".
- There MUST be an element with id="project-count" that reads "Showing X of Y projects".
- As the user types, cards whose text does not contain what was typed MUST be hidden by
adding the class "hidden", and the count MUST update immediately — no button, no page
reload.
- Emptying the box MUST bring every card back.
- style.css MUST define .hidden { display: none; }.

## 4. Acceptance Checklist
- [x ] app.js is loaded from <head> with defer, and index.html has no inline onclick and
no code inside a <script> tag.
- [x ] Typing in the filter box hides and shows cards live, without pressing anything.
- [ x] The "Showing X of Y projects" line updates as I type.
- [ x] Emptying the box brings every card back.
- [x ] app.js contains no .style assignments — hiding is done with the "hidden" class.
- [x ] The DevTools Console shows no red errors when the page loads.

## 5. Audit Protocol
- Inspect the generated code line by line with `git diff --staged` before committing.