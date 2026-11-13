# Forever 21 Homepage Front-End

A responsive, pixel-perfect front-end implementation of the Forever 21 homepage built with semantic HTML5, modern CSS3, and vanilla JavaScript.

## Features

- **Pixel-Perfect Responsive Layout**:
  - Desktop layout matching high-resolution viewports (> 1400px, 1600px, 1920px).
  - Mobile layout with image-first hero, 2x2 collections grid, and horizontal product swipe carousel.
- **Top Announcement Bar**: Includes active promotions, free shipping notices, and brand yellow bullet separators.
- **Header & Navigation**:
  - Search box positioned on the right before Login / Signup.
  - Custom SVG icons from `images/icons/` (`search.svg`, `user.svg`, `cart.svg`, `Dropdown.svg`).
  - Dropdown chevron icons on subcategories with hover animations.
  - Interactive Shopping Cart with item badge counter.
- **Hero Section**:
  - Desktop: Panoramic hero banner with yellow backdrop and text overlay.
  - Mobile: Framed hero image on top, solid yellow content card below.
- **Trending Collections & Categories**:
  - Responsive grids with hover zoom transitions and yellow badges.
- **Just In Section**:
  - Filter tabs for Women & Men.
  - Product cards with price, quick view modal, and "Add to cart" interaction.
- **Interactive Cart Slide-Over Drawer**:
  - Real-time subtotal, 20% discount calculation, and free shipping progress tracker.
  - LocalStorage persistence.
- **Footer**:
  - White inverted logo, category link lists, Google Play & App Store badges, and social media icons.

## Running Locally

Open `index.html` in any browser, or run the built-in Node server:

```bash
node server.js
```

Then visit `http://localhost:3000/`.
