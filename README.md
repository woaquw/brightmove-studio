# Brightmove Studio — Landing Page

A responsive landing page for a (fictional) Pilates studio: hero with a clear call to action, class overview, a weekly schedule filtered by day, pricing, testimonials, FAQ and a booking form with validation.

**Live demo:** https://woaquw.github.io/brightmove-studio/

![Desktop and mobile preview](docs/preview.png)

## Highlights

- **Fast:** plain HTML, CSS and JavaScript, no frameworks or build step. No images to download: all visuals are CSS and inline SVG.
- **Responsive:** tested at 375 px (phone), 768 px (tablet) and desktop widths, with a mobile menu.
- **Interactive schedule:** day tabs (opens on today), spots left, full classes disabled, keyboard arrow navigation. "Book" pre-fills the form with the chosen class.
- **Booking form:** inline validation with clear error messages, spam honeypot, loading and success states. Works in demo mode or sends real submissions to any form backend.
- **Accessible:** semantic HTML, labels on every field, visible focus, skip link, `aria` states, respects "reduce motion".
- **SEO basics:** meta description, Open Graph tags, schema.org `LocalBusiness` data.

## Receive real form submissions

Create a free form on [Formspree](https://formspree.io) (or a similar service) and put its URL in `index.html`:

```html
<form ... data-endpoint="https://formspree.io/f/your-id">
```

With an empty `data-endpoint` the form runs in demo mode and only shows the success message.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Customize

- Colors and fonts: CSS variables at the top of `styles.css`.
- Schedule: the `SCHEDULE` object in `script.js`.
- Texts and prices: `index.html`.

The studio, people and reviews are fictional; this is a portfolio project.
