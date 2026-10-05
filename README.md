# Spinspire

**Find an idea. Make it yours.**

Spinspire is a project-discovery website for students who know what they study but do not always know what to build next.

Choose a degree, choose a difficulty, and spin. Spinspire returns a project idea tailored to your selection, then gives you a practical project brief with technologies, core features, a build plan, and useful skills.

## Features

- Degree-based project discovery
- Beginner, intermediate, and advanced difficulty filters
- Random project roulette
- Similar and different project discovery
- Detailed project Explore pages
- Project-specific features, roadmap, skills, and technologies
- Saved projects stored locally in the browser
- Responsive mobile layout
- Keyboard controls
- Lightweight sound feedback
- No account required

## Project structure

```text
Spinspire/
├── index.html
├── style.css
├── script.js
├── data/
│   └── projects.json
└── assets/
    ├── favicon.ico
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── apple-touch-icon.png
    ├── icon-192.png
    └── spinspire-icon.png
```

## Run locally

Spinspire loads its project database with `fetch()`, so run it through a local web server rather than opening `index.html` directly.

In VS Code, install **Live Server**, right-click `index.html`, and choose **Open with Live Server**.

## Deploy with GitHub Pages

1. Push the latest project files to the `main` branch.
2. Open the repository on GitHub.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Click **Save**.
7. Wait for the first deployment to finish.

The live URL will appear in the GitHub Pages settings.

## Tech

HTML, CSS, vanilla JavaScript, JSON, Web Audio API, and localStorage.

## License

MIT
