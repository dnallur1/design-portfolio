# Devi Priya Nalluri — Design Portfolio

An AI for Interdisciplinary Design Portfolio featuring **Winter Bear** album artwork, the **3D Studio** environment, and **Did You See That?**, a game proposal.

## Preview locally

Run `python3 -m http.server 4173` from this directory, then open http://localhost:4173/.

## Publish with GitHub Pages

In this repository’s **Settings → Pages**, set the source to **GitHub Actions**. The included workflow publishes the site after pushes to `main`, or can be run manually from the Actions tab. No build dependencies or secrets are required.

## Contents

- `index.html`: homepage and interactive fireworks
- `winter-bear.html`: album cover and process
- `studio.html`: studio imagery and camera walkthrough
- `game-proposal.html`: game proposal introduction and concept visual
- `assets/`: project images, illustrations, and video

The three starter fireworks animate automatically. Each click or tap adds one firework at the chosen position. Added fireworks fade after 40 seconds or clear when scrolling past the drawing area. Reduced-motion preferences are respected.
