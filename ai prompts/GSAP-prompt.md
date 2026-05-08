```
I'm building a Quinceañera website using Next.js 15, React 19, and TypeScript with Tailwind CSS. 
GSAP is NOT yet installed — include installation and setup steps.

The site has these sections in order:
1. CloudsIntro — two cloud panels that currently split apart with CSS transitions to reveal the page
2. Hero — title text, floating emoji decorations, sparkle dots, scroll chevron
3. MusicPlayer
4. EventInfo — 3 cards (date, time, venue)
5. Padrinos — sponsor cards in a grid
6. Court — damas and chambelanes photo grid
7. Gallery — image grid with hover effects
8. GuestGallery
9. Footer

Design aesthetic: elegant, romantic, gold/mint palette, script fonts (Great Vibes, Playfair Display).

Please create GSAP animations for this site with:

**Page Load / Intro:**
- Upgrade the CloudsIntro cloud-split reveal to use GSAP instead of CSS transitions
- After clouds exit, stagger-animate the Hero elements in (title, subtitle, decorations, chevron)

**Scroll-triggered entrance animations (ScrollTrigger):**
- EventInfo cards: stagger in from below as user scrolls to that section
- Padrinos cards: stagger in with a slight rotation + fade
- Court photos: stagger in row by row
- Gallery images: stagger in with scale + fade
- GuestGallery: fade in as a group
- Footer: slide up gently

**Ambient / continuous animations:**
- Replace the CSS float animations on Hero emoji decorations with GSAP timelines (smoother, looping)
- Subtle parallax on the Hero background as the user scrolls

**Requirements:**
- Use `gsap` + `@gsap/react` (useGSAP hook) for React integration
- Use ScrollTrigger plugin
- All animations must be wrapped properly to avoid hydration issues in Next.js (client components, useEffect or useGSAP)
- Respect `prefers-reduced-motion` — skip or reduce animations if the user has that setting
- TypeScript-safe code
- Don't remove existing Tailwind classes; just layer GSAP on top

For each component, give me the full updated file with GSAP code integrated.
Start with: 1) installation, 2) CloudsIntro, 3) Hero, then continue through the sections.
```
