# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Summary

Personal portfolio of Yahir Eduardo Bravo (domain: yebt.dev), positioned as a software architect. It hosts projects, references to projects, and a small digital garden of notes.

## Primary user

Recruiters and hiring teams at companies. They arrive from a CV, LinkedIn or a job application, scan quickly, and decide whether to reach out.

## Job and success

- Understand within seconds who the developer is and what they build.
- See recent projects, then browse all projects filtered by stack.
- Open a project and find its explanation (video or playlist about its design system), stack, and links.
- Contact the developer or get the CV.

## Content model

- Projects: title, summary, stack[], year, type, cover, video or playlist URL, repo/live links.
- Garden notes: title, stage (seedling, budding, evergreen), tags, links between notes.

## Constraints

- Light and dark themes are both required.
- Home hero: the developer's portrait rendered as ASCII with a progressive effect (few large characters resolving into many small ones). Source photo: references/78061402.jpg.
- Content is Markdown in the repo for now; a git-based CMS (Keystatic) may be added later.
- Must respect prefers-reduced-motion.

## Stack

Astro 7 (portfolio-base/), static output.

## Brand commitments

- The user describes the feel as a minimalist encyclopedia mixing magic and consoles: cutouts that merge, ASCII, overlays, text that wraps images. Reference images live in references/.
- An earlier "Nomicon" visual proposal was rejected; do not reuse it.

## Open decisions

- Final display and body typefaces.
- Exact projects and copy.
