# SPEC: Developer Portfolio Welcome Page
## 1. Purpose & Scope
- A personal portfolio welcome page for Catherine Parelli, a third-year biomedical engineering student minoring in software engineering.
- Non-Goals: no multi-page routing; no backend; no contact forms.

## 2. Invariants & Negative Constraints
- All styling MUST reside in `./style.css` (no inline style="..." attributes).
- The page MUST NOT load external CSS frameworks or CDNs (no Bootstrap, no Tailwind).
- The avatar image MUST use the relative path `./assets/avatar.png`.
- The layout MUST collapse into a single vertical column on screens narrower than 768px.

## 3. UI Content & Interface Contract
- Hero header: my full name "Catherine Parelli", the subtitle "Biomedical engineering student interested in research and technology", and this bio: "I am a third-year biomedical engineering student at Stevens Institute of Technology with a minor in software engineering. I plan to use my engineering degree to pursue a career in neuroimaging.".
- Action link: a button labelled "See my projects" that links to `#projects`.
- Projects section with id="projects": lists these items:  
- Laser Speckle Imaging: I used MATLAB to collect and analyze images while studying changes in blood flow.
- VR Myoelectric Control: I helped process muscle signal data for a virtual reality research project.
- Social link: GitHub (https://github.com/cparelli) MUST open in a new tab
(target="_blank").

- All text on the page MUST use Georgia as the font, with a serif fallback.



## 4. Acceptance Checklist
- [x] Valid semantic HTML5: the page uses <header>, <main>, and <footer>.
- [x] The avatar image has width, height, and alt attributes.
- [x] No horizontal scrollbar when the browser is narrowed to 375px.
- [x] The GitHub link opens in a new tab and has rel="noopener".
- [x] No placeholder links: href="#" appears nowhere.

## 5. Audit Protocol
- Inspect the generated code line by line with `git diff --staged` before committing.