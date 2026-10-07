# Feature Specification: Platform Rebuild with Preserved Identity

**Feature Branch**: `001-nextjs-migration`

**Created**: 2026-10-07

**Status**: Draft

**Input**: User description: "Move Great Hikes from Create React App to Next.js, keeping the same
visual identity (photo backgrounds, blur/glass panels) while improving UX/UI: design tokens, a
real URL per hike, search/social metadata, optimized images, better mobile navigation."

## Context

Great Hikes is relaunching as a community-fed hiking site. Today it is a three-screen prototype
(Home, Hikes browser, Hike details) with 32 hikes, placeholder buttons that do nothing, and a
hard-coded review. Hikes have numeric addresses (`/Hikes/1`), every page shares one generic
title, and large unoptimized photos load on phones. This feature rebuilds the site on a
foundation suitable for the roadmap (community submissions, Instagram, maps, gear) **without
changing how the brand looks and feels**: full-bleed nature imagery, frosted-glass panels, dark
pill buttons, the Great Hikes logo.

This is a rebuild, not a redesign: visitors who know the current site must recognize it
immediately; improvements are in usability, accessibility, speed and shareability.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Same experience, rebuilt (Priority: P1)

A visitor opens Great Hikes and gets the experience they know: the home screen with the hiking
video behind a frosted-glass welcome panel; the Hikes screen with a full-screen photo of the
selected hike, its description, and a list of hikes to pick from; and a detail page per hike
with the story, photo, location and other hikes in the same continent.

**Why this priority**: Everything else builds on a working rebuilt site. If only this story
ships, the site is already live on the new foundation with no loss for visitors.

**Independent Test**: Open home, browse hikes, open each of the 32 hike pages, and compare side
by side with the current production site: same content, same visual identity, nothing missing.

**Acceptance Scenarios**:

1. **Given** a visitor on the home page, **When** the page loads, **Then** the nature video plays
   muted in the background behind a frosted-glass panel with the logo, tagline and a
   "Let's Hike!" call to action.
2. **Given** the Hikes screen, **When** the visitor selects a hike from the list, **Then** the
   background changes to that hike's photo and the panel shows its continent, country, title
   and short description, with a button to open the hike.
3. **Given** any of the 32 hikes, **When** its page is opened, **Then** it shows the title,
   country, hiking write-up, photo, continent map and up to six other hikes in the same
   continent, over that hike's photo with the glass/blur treatment.
4. **Given** a visitor with reduced-motion enabled in their device settings, **When** the home
   page loads, **Then** the video does not autoplay and a still image is shown instead.

---

### User Story 2 - Each hike has its own shareable address (Priority: P1)

A hiker who finds a trail they love copies the address and shares it on Instagram, WhatsApp or
in a message. The link is readable (contains the hike name), and the preview card shows the
hike's photo, name and description. Search engines can index each hike individually.

**Why this priority**: Visitors arrive from Instagram and search; the growth loop of the project
depends on hikes being shareable and findable.

**Independent Test**: Paste a hike link into a link-preview checker or messaging app and confirm
the preview shows that hike's title, description and photo; confirm old links still work.

**Acceptance Scenarios**:

1. **Given** a hike page, **When** a visitor looks at the address, **Then** it contains a
   readable name for the hike (e.g. `/hikes/torres-del-paine-national-park`).
2. **Given** a hike link shared in a messaging or social app, **When** the preview renders,
   **Then** it shows that hike's photo, title and short description.
3. **Given** an old address from the current site (`/Hikes` or `/Hikes/1`), **When** it is
   opened, **Then** the visitor is permanently redirected to the matching new address.
4. **Given** an address for a hike that does not exist, **When** it is opened, **Then** a
   branded "trail not found" page appears (same identity) with a way back to all hikes.

---

### User Story 3 - Comfortable on a phone (Priority: P2)

A visitor coming from Instagram on a phone can read every page comfortably, reach the menu with
one thumb, scroll through hikes, and open a hike without zooming or fighting the layout.

**Why this priority**: Most traffic will come from Instagram on mobile; the current layout is
desktop-first.

**Independent Test**: Use the site on a 360px-wide phone screen and on a desktop; complete
"home → pick a hike → read it → go to another hike in the same continent → back to all hikes"
on both.

**Acceptance Scenarios**:

1. **Given** a phone-sized screen, **When** any page loads, **Then** no content is cut off or
   requires horizontal scrolling, and text is readable without zooming.
2. **Given** any page, **When** the visitor opens the menu, **Then** they can reach Home, Hikes,
   and the @great_hikes Instagram profile, each as a clearly labeled control.
3. **Given** text placed over a photo or blurred panel, **When** it is displayed with any of the
   32 hike photos behind it, **Then** it remains legible (meets accessibility contrast).
4. **Given** a keyboard-only visitor, **When** they tab through a page, **Then** every
   interactive element is reachable, shows visible focus, and has a descriptive label.

---

### User Story 4 - Honest interface: nothing that pretends to work (Priority: P2)

A visitor never taps a button that does nothing. Features that are not built yet (favorites,
ratings, groups, official site, GPS, contact, accounts, reviews) are not shown as working
controls, and the sample review by "John Muir" is removed.

**Why this priority**: Dead buttons and fake reviews hurt trust at launch, and the community
features will be designed properly in later specs.

**Independent Test**: Tap every control on every page; each one performs a visible action.

**Acceptance Scenarios**:

1. **Given** any page, **When** the visitor activates any button or link, **Then** it navigates
   or changes something visible.
2. **Given** a hike page, **When** it loads, **Then** no placeholder review is shown.

---

### User Story 5 - Photographers get credit (Priority: P3)

Every hike photo shows a small, unobtrusive credit with the photographer's name linking to the
original source, so the site respects creators from day one.

**Why this priority**: Required by the project's consent & attribution principle and sets the
pattern for featuring community photos later; low effort because credit data already exists.

**Independent Test**: Open any hike; the photo credit is visible and its link opens the source.

**Acceptance Scenarios**:

1. **Given** a hike page or the Hikes screen, **When** a hike photo is shown, **Then** a credit
   ("Photo: <name>") is visible and links to the photo's source page.

---

### User Story 6 - Find hikes by continent (Priority: P3)

On the Hikes screen, a visitor can narrow the list to one continent (Africa, Asia, Europe, North
America, Oceania, South America) or see all.

**Why this priority**: Cheap usability gain with 32 hikes and a natural base for future filters;
not needed for parity.

**Independent Test**: Choose each continent and confirm only matching hikes are listed; choose
"All" to restore the full list.

**Acceptance Scenarios**:

1. **Given** the Hikes screen, **When** the visitor chooses a continent, **Then** only hikes in
   that continent are listed and the selection is reflected in the address so it can be shared.

### Edge Cases

- A hike photo fails to load: the page still renders with a neutral dark background and readable
  text.
- Background video cannot play (data saver, unsupported, reduced motion): a still image is shown.
- Very slow connection: text content and layout appear before large imagery finishes loading,
  without content jumping around.
- A continent filter with zero hikes (via a hand-edited address): show a friendly empty state
  with a link to all hikes.
- Two hikes with the same or similar names: each still gets a unique address.
- Old numeric addresses for ids that never existed: show the "trail not found" page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST present the Home, Hikes and Hike detail experiences with the same
  content as today for all 32 hikes.
- **FR-002**: Every screen MUST use the established identity: full-bleed nature imagery or video
  background, frosted-glass panels, dark rounded pill controls, the Great Hikes logo.
- **FR-003**: Visual properties of the identity (colors, blur strength, panel transparency,
  corner radii, spacing, typography) MUST be defined once and reused across all screens.
- **FR-004**: Each hike MUST have a unique, human-readable, stable address derived from its name.
- **FR-005**: Old addresses (`/Hikes`, `/Hikes/<id>`) MUST permanently redirect to their new
  equivalents.
- **FR-006**: Each page MUST have its own title, description and social preview image; hike
  pages use the hike's own title, short description and photo.
- **FR-007**: The site MUST provide a sitemap listing all public pages and allow search engines
  to index them.
- **FR-008**: Unknown addresses MUST show a branded "not found" page with navigation back.
- **FR-009**: Images MUST be delivered in sizes appropriate to the visitor's screen; images not
  in view MUST NOT delay the first view.
- **FR-010**: The home video MUST NOT autoplay for visitors who prefer reduced motion; a still
  image MUST be shown instead.
- **FR-011**: A navigation menu MUST be available on every page with Home, Hikes and a link to
  the @great_hikes Instagram profile.
- **FR-012**: Controls for features that do not exist yet MUST NOT be displayed; the placeholder
  review MUST be removed.
- **FR-013**: Every hike photo MUST display a visible photographer credit linking to the source.
- **FR-014**: The Hikes screen MUST allow filtering by continent, reflected in a shareable address.
- **FR-015**: All text and controls MUST meet WCAG 2.2 AA (contrast over imagery, keyboard
  access, visible focus, accessible names, image alternative text).
- **FR-016**: Layouts MUST work from 360px-wide phones to large desktop screens without
  horizontal scrolling.
- **FR-017**: Hike descriptions MUST be displayed as plain text (no embedded markup executed).
- **FR-018**: The production address `great-hikes.vercel.app` MUST keep working, and the switch
  MUST happen without downtime.
- **FR-019**: Hike data MUST be stored in a structured, typed form that later features can extend
  (coordinates, distance, difficulty, community media) without restructuring.

### Key Entities

- **Hike**: a trail/destination featured on the site. Attributes today: id, readable address
  name (slug), title, continent, country, biome, short description, hiking write-up, official
  link (currently empty), continent map, main photo. Designed to be extended later.
- **Photo credit**: who took an image and where it came from (name, source link, license). Every
  displayed image has one.
- **Continent**: grouping used for "hikes in the same continent" and filtering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 32 hikes are reachable at a readable address, and 100% of old addresses
  redirect correctly.
- **SC-002**: On a mid-range phone over a typical 4G connection, the main content of the home and
  hike pages appears within 2.5 seconds, with no visible layout jumping.
- **SC-003**: Total data transferred to view the Hikes screen on a phone is at least 60% lower
  than on the current production site.
- **SC-004**: An automated accessibility audit reports zero serious or critical issues on Home,
  Hikes, a hike page and the not-found page.
- **SC-005**: 100% of interactive controls perform a visible action (zero dead buttons).
- **SC-006**: Shared hike links show a correct preview (title, description, photo) in at least two
  major messaging/social apps.
- **SC-007**: The site owner, comparing old and new side by side, confirms the visual identity is
  preserved.

## Assumptions

- The 32 existing hikes, their texts and photos are reused as-is; content expansion is a later
  feature.
- The current Pexels photo credits are accurate; photos are self-hosted as today.
- Maps stay as the existing continent images; interactive trail maps come in a later feature.
- Favorites, ratings, groups, reviews, accounts, contact and GPS are out of scope and will be
  specified later (roadmap phases 2–5).
- The site stays English-only and is hosted on Vercel at the current address; a custom domain is
  a later decision.
- The "Share your hike" flow and Instagram feed are out of scope; the menu links to the
  @great_hikes Instagram profile for now.
- Readable addresses use lowercase words from the hike title (e.g. `/hikes/machu-picchu`).
