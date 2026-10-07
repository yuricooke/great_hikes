# Feature Specification: Landing & Navigation

**Feature Branch**: `002-landing-navigation`

**Created**: 2026-10-07

**Status**: Implemented on preview; scope expanded 2026-10-07 (see tasks.md T014–T022)

**Input**: Owner request: "We should have a landing page… a featured photo on top (the hero) and
under it cards such as Our top 10 / IG features / today's features / photographers… or a
horizontal slider with topics and a See more button (ref: norturaproff.no, which I designed).
Keep my visual identity. First-level pages under the landing show a grid of hike cards (not a
slider); clicking a card opens the second-level hike page."

## Context

**Business outcomes served**: O-1 (site becomes a destination — visitors from Instagram find more
to explore and view 2+ pages, hypothesis H3). It also prepares the slots where community content
appears (O-2) once the Instagram spec (006) delivers consented posts.

**Owner decisions (2026-10-07)**:
- `/` becomes the landing; the home video moves to the sign-in page (spec 003).
- Landing topics now: today's featured hike (hero), Our top 10, landscapes, explore by continent.
  Instagram topics (IG features, photographers, from the community) are added by spec 006;
  Journal (spec 004) and Shop (spec 005) add their own landing sections.
- Sign-in (spec 003): glass pop-up from any page + full page with video; email link + Google;
  favorites page for signed-in users; seeded test user for development.

**Information architecture**:

```
Landing (/)                       ← hero + horizontal topic rails, each with "See all"
├── Topic pages (/explore/<topic>) ← grid of hike cards (first level)
│     top-10 · mountains · forests · coasts · waterfalls · <continent> …
├── All hikes (/hikes)             ← grid of every hike, with topic shortcuts
└── Hike page (/hikes/<slug>)      ← second level (spec 001 layout)
```

Identity is unchanged: full-bleed photography, frosted-glass panels, dark pill controls, logo.
The Nortura reference contributes structure (hero, rails with tag badges, "see all"), not look.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Landing shows today's feature and topics (Priority: P1)

A visitor arriving from Instagram lands on a full-screen photo of today's featured hike, with a
glass panel (label "Today's feature", hike name, place, short description, "Let's hike!").
Scrolling down shows horizontal rails of hike cards by topic, each with a title and "See all".

**Why this priority**: It is the new front door and the core of the request.

**Independent Test**: Open `/`; confirm the hero and at least 6 rails render with cards; open a
card and a "See all".

**Acceptance Scenarios**:

1. **Given** the landing, **When** it loads, **Then** today's featured hike fills the hero with
   its photo, name, place, description, photo credit and a "Let's hike!" link to its page.
2. **Given** a different calendar day (UTC), **When** the landing is opened, **Then** a different
   hike is featured (rotation through all hikes, no repeats within a cycle).
3. **Given** the landing, **When** the visitor scrolls, **Then** rails appear in this order: Our
   top 10, Mountains & peaks, Forests & jungles, Coasts & islands, Waterfalls & lakes, Explore by
   continent — each with a "See all" link.
4. **Given** the "Our top 10" rail, **When** it renders, **Then** cards show rank badges #1–#10.

---

### User Story 2 - Rails are easy to browse on any device (Priority: P1)

On a phone the visitor swipes rails sideways; on desktop they use arrow buttons or a trackpad.
Cards snap into place and the next card peeks in to signal more content.

**Why this priority**: Horizontal rails fail if they can't be operated comfortably.

**Independent Test**: On 360px and 1440px screens, move through a rail by swipe/scroll, arrow
buttons and keyboard.

**Acceptance Scenarios**:

1. **Given** a rail wider than the screen, **When** the visitor presses its "next" arrow,
   **Then** it scrolls by about one screen of cards; arrows are disabled at the ends.
2. **Given** a keyboard user, **When** they Tab into a rail, **Then** each card is focusable in
   order and scrolls into view.
3. **Given** a phone, **When** the visitor swipes, **Then** cards snap and the next card is
   partially visible.

---

### User Story 3 - Topic pages show a grid of hikes (Priority: P1)

"See all" (or a continent card) opens a first-level page: a glass header with the topic name,
a one-line description and the number of hikes, over a topic photo, followed by a grid of hike
cards. Clicking a card opens the hike page.

**Independent Test**: Open each topic page; count matches the topic; cards open hike pages.

**Acceptance Scenarios**:

1. **Given** `/explore/top-10`, **When** it loads, **Then** 10 cards appear in rank order.
2. **Given** `/explore/south-america`, **When** it loads, **Then** only South American hikes
   appear.
3. **Given** an unknown topic, **When** opened, **Then** the branded not-found page appears.

---

### User Story 4 - Hike page fits the new hierarchy (Priority: P2)

On a hike page the visitor sees where they are (breadcrumb: Home › continent › hike) and can
return to the landing or the continent page; "More hikes in <continent>" remains.

**Acceptance Scenarios**:

1. **Given** a hike page, **When** it loads, **Then** a breadcrumb links Home and the continent
   topic page.

---

### User Story 5 - All hikes page (Priority: P2)

`/hikes` lists every hike in a grid with shortcuts to each topic, replacing the previous
selection-style browser.

**Acceptance Scenarios**:

1. **Given** `/hikes`, **When** it loads, **Then** all 32 hikes appear as cards and topic
   shortcut chips link to topic pages.
2. **Given** an old filter link `/hikes?continent=asia`, **When** opened, **Then** the visitor is
   redirected to `/explore/asia`.

### Edge Cases

- A topic with fewer cards than fit on screen: no arrows shown, no empty gaps.
- A topic with zero hikes (data edit): its rail is hidden on the landing; its page shows an empty
  state linking to all hikes.
- Featured hike photo missing credit (e.g. Amazon Rainforest): still shows "Photo: Unknown" until
  replaced; that hike is excluded from the hero rotation.
- Very long hike names on cards: wrap to 2 lines max with ellipsis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `/` MUST be the landing: hero with today's featured hike + topic rails.
- **FR-002**: The featured hike MUST change daily (UTC) and rotate through all hikes with a
  credited photo, without repeats within a cycle.
- **FR-003**: Topics MUST be data-driven (title, description, cover photo, list or rule), so new
  topics (e.g. Instagram features, Journal, Shop) can be added without layout changes.
- **FR-004**: Initial topics: Our top 10 (owner-ranked list), Mountains & peaks, Forests &
  jungles, Coasts & islands, Waterfalls & lakes (by hike landscape tags), and one per continent.
- **FR-005**: Each landing rail MUST show up to 10 cards, a "See all" link to its topic page,
  previous/next controls on pointer devices, swipe/scroll snapping, and keyboard access.
- **FR-006**: The "Explore by continent" rail MUST show one card per continent (photo, name,
  number of hikes) linking to that continent's topic page.
- **FR-007**: Topic pages (`/explore/<topic>`) MUST show a glass header (name, description,
  count) over a cover photo and a responsive grid of hike cards (1 column phone → 4 desktop).
- **FR-008**: Cards MUST show photo, hike name, place, and a badge where relevant (rank for top
  10, landscape for others); the whole card is one link to the hike page.
- **FR-009**: `/hikes` MUST show all hikes in a grid with links to every topic page; old
  `?continent=` links MUST redirect to the matching topic page.
- **FR-010**: Hike pages MUST show a breadcrumb (Home › continent › hike).
- **FR-011**: Every topic page and the landing MUST have their own title, description, canonical
  URL and social preview image; all are in the sitemap.
- **FR-012**: Each hike MUST carry one or more landscape tags; the owner can edit tags and the top
  10 order in data files without code changes.
- **FR-013**: All spec 001 guarantees remain: identity, photo credits, accessibility (WCAG 2.2
  AA), no horizontal page scroll, no dead controls, legacy redirects.

### Key Entities

- **Topic**: slug, title, description, cover photo, kind (ranked list | landscape | continent),
  ordered hikes.
- **Landscape**: mountains, forests, coasts, waterfalls (a hike may have several).
- **Hike** (extended): adds `landscapes[]`.

## Success Criteria *(mandatory)*

- **SC-001**: From the landing, a visitor reaches any hike in ≤ 2 clicks.
- **SC-002**: ≥ 40% of visitors from Instagram view 2+ pages (H3; measured once analytics land).
- **SC-003**: Landing main content appears within 2.5 s on a mid-range phone (LCP), CLS ≤ 0.1.
- **SC-004**: Zero serious/critical accessibility issues on landing, a topic page and `/hikes`.
- **SC-005**: Owner confirms the landing feels like Great Hikes and reflects the reference layout.

## Assumptions

- Top 10 initial order is proposed by Claude from the 32 hikes; the owner reorders it.
- Landscape tags are proposed by Claude per hike; the owner reviews.
- Sign-in and the video move to spec 003; until then the menu shows no sign-in control.
- Instagram rails (spec 006), Journal section (spec 004) and Shop section (spec 005) are out of
  scope here; FR-003 keeps the landing ready for them.
