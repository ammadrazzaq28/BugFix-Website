# BugFix Technologies — website

Premium marketing site for a product studio shipping consumer iOS and Android apps.

## Two builds, same site

| File | Use it when |
|---|---|
| `index.html` + `assets/` | Real deployment. Cache-friendly, easy to edit. |
| `bugfix-technologies-single-file.html` | Quick share, email, or dropping into a preview tool. Everything inlined. |

Open either one directly in a browser. No build step, no npm, no dependencies except
Google Fonts (loaded from CDN).

## The signature element

The **iOS / Android toggle** in the nav is the core idea. Flipping it:

- swaps the accent ramp — azure→violet for iOS, ember→coral for Android
- morphs the phone frame from a notch to a punch-hole
- morphs every app icon from an iOS squircle to an Android circle
- flips every store label from "App Store" to "Google Play"

It's the two-platform positioning expressed as an interaction rather than a sentence.

## What to replace

**1. Numbers and ratings** — every placeholder is tagged `data-edit`:

    grep -n 'data-edit' index.html

Covers the hero stats, per-app ratings, the Voxa case-study results, and review attributions.

**2. App screens** — the three phone screens are pure HTML/CSS, no images.
To use a real screenshot instead, replace the contents of an `.appview` block:

    <div class="appview on" id="ap-wall">
      <img src="assets/img/wallhub.png" alt="WallHub home screen"
           style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
    </div>

Use a 1179×2556 (or any 9:19.5) PNG and it will fit the frame exactly.

**3. App icons** — each card icon is an inline SVG on a gradient. Swap the gradient in
the `style` attribute and the `<svg>` path, or drop in an `<img>`:

    <span class="icon" style="padding:0;overflow:hidden">
      <img src="assets/img/icon-imora.png" alt="">
    </span>

**4. Contact** — `hello@bugfixtechnologies.com` appears in `index.html` and `app.js`.
The form currently opens the user's mail client. To post to a real endpoint, replace the
`window.location.href = 'mailto:...'` line in `app.js` with your `fetch()` call.

**5. Legal links** — already pointed at `bugfixtechnologies.com/T&C.html` and `/privacy.html`.

## Design tokens

All in `:root` at the top of `assets/style.css`.

    --ink   #0A0C11   page base (graphite, not flat black)
    --surf  #12161F   card surface
    --a1/a2           accent ramp, swapped by .plat-android
    --dsp             Bricolage Grotesque (display)
    --body            Inter Tight
    --mono            JetBrains Mono (versions, labels, data)

To make Android the default, add `class="plat-android"` to the `<html>` tag and flip the
two `aria-pressed` values on the toggle buttons.

## Quality floor

- Responsive to 390px
- Visible keyboard focus on every control
- `prefers-reduced-motion` respected (preloader, reveals and marquee all collapse)
- Skip-to-content link
- Form validates inline before doing anything
- No external JS libraries
