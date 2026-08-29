# StudentHub — UI/UX Design Guidelines

## 1. Product Identity

**StudentHub** is a modern, GitHub-inspired knowledge platform for students.

The UI should communicate:

- Learning
- Organization
- Knowledge sharing
- Collaboration
- Trust
- Simplicity
- Modern technology

The product should feel like a **premium productivity platform**, not a traditional school-management website.

### Design Keywords

> Modern · Premium · Clean · Smart · Friendly · Professional · Focused · Trustworthy

Avoid designs that feel:

- Childish
- Overly colorful
- Template-like
- AI-generated
- Cluttered
- Excessively rounded
- Like a generic school portal

---

# 2. Core Design Direction

Use a visual language inspired by high-quality products such as modern developer tools, productivity apps, knowledge platforms, and cloud software.

The design should balance:

**Professional + Student-friendly**

Use strong visual hierarchy, generous whitespace, subtle depth, crisp typography, and purposeful color.

Every component should look intentional and polished.

---

# 3. Brand Style

## Primary Brand

**StudentHub**

The brand identity should use a confident blue/navy foundation with fresh supporting colors.

Suggested palette:

| Purpose | Color |
|---|---|
| Primary | `#2563EB` |
| Primary Dark | `#1D4ED8` |
| Navy | `#0F172A` |
| Background | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Text | `#0F172A` |
| Secondary Text | `#64748B` |
| Border | `#E2E8F0` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |

Do not use every color everywhere.

Blue should be the main brand/action color. Green, yellow, and red should primarily communicate states or secondary emphasis.

---

# 4. Typography

Use a modern, highly readable sans-serif font.

Preferred options:

- Inter
- Geist
- Manrope
- Plus Jakarta Sans

Use one primary font consistently throughout the application.

### Typography Hierarchy

- Page title: bold, large, strong hierarchy
- Section title: semibold
- Body: regular and highly readable
- Metadata: smaller, muted
- Buttons: medium/semibold

Avoid excessive font sizes, excessive font weights, and decorative fonts.

---

# 5. Layout Principles

Use a clean application shell.

```text
┌─────────────────────────────────────────────┐
│ Logo       Search              Actions User │
├──────────────┬──────────────────────────────┤
│              │                              │
│ Sidebar      │ Main Content                 │
│              │                              │
│ Navigation   │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

### Desktop

Use:

- Persistent sidebar where appropriate
- Maximum readable content width
- Clear content sections
- Consistent spacing
- Sticky navigation when useful

### Mobile

The application must be genuinely mobile-first.

Use:

- Compact header
- Bottom navigation or collapsible navigation
- Full-width content
- Touch-friendly controls
- Responsive cards
- Mobile-friendly file browser

Never simply shrink the desktop UI.

---

# 6. Spacing System

Use a consistent spacing scale.

Preferred base:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Avoid random margins and padding.

Components should have consistent internal spacing and alignment.

---

# 7. Border Radius

Use moderate, consistent rounding.

Recommended:

- Buttons: `8–10px`
- Inputs: `8–10px`
- Cards: `12–16px`
- Large containers: `16–20px`
- Avatars: fully rounded

Avoid making every element extremely rounded or pill-shaped.

Pills should mainly be used for:

- Tags
- Status indicators
- Filters
- Small badges

---

# 8. Shadows & Depth

Use subtle shadows.

The interface should feel layered without looking heavy.

Preferred approach:

```text
Subtle border
+
Very soft shadow
+
Clean white surface
```

Avoid:

- Strong drop shadows
- Neumorphism
- Excessive glow
- Heavy gradients
- Fake 3D effects

---

# 9. Navigation

The navigation should make the application immediately understandable.

Suggested primary navigation:

```text
🏠 Dashboard
📓 My Notebooks
🌎 Explore
🔍 Search
👥 Shared With Me
⚙️ Settings
```

The active navigation item should be visually obvious using:

- Brand color
- Soft background
- Strong text weight
- Clear icon

Do not rely on color alone.

---

# 10. Dashboard

The dashboard should provide a quick overview rather than overwhelming the user.

Suggested structure:

```text
Good morning, [Name]

[ Create Notebook ]

Recent
────────────────────────

My Notebooks
────────────────────────

Shared With Me
────────────────────────

Recent Activity
────────────────────────
```

Prioritize:

1. Continue working
2. Recent notebooks
3. Important activity
4. Quick actions

Avoid filling the dashboard with unnecessary statistics.

---

# 11. Notebook UI

Notebooks are the most important product object.

A notebook page should clearly communicate:

- Notebook name
- Description
- Owner
- Visibility
- Collaborators
- Files/folders
- Actions

Example:

```text
← My Notebooks

📓 Class 9 Science
Complete science study material
🌎 Public · 👥 4 collaborators

[ Share ] [ Add ] [ More ]

────────────────────────────

📁 Physics
📁 Chemistry
📁 Biology
📄 Important Questions.pdf
```

The file/folder area should be the visual focus.

---

# 12. File Browser

The file browser should feel familiar to users of modern cloud storage and developer tools.

Use:

- Breadcrumb navigation
- Folder icons
- File-type icons
- File names
- Metadata
- Context menus
- Search/filter where useful

Example:

```text
Class 9 Science / Physics

📁 Motion
📁 Gravitation
📄 Motion Notes.pdf
📄 Formula Sheet.pdf
```

Do not make the file browser visually noisy.

---

# 13. Cards

Cards should be used selectively.

Good card content:

- Notebook preview
- File information
- User profile
- Activity item
- Explore result

A card should have a clear purpose.

Avoid:

- Card inside card inside card
- Excessive borders
- Excessive shadows
- Huge empty cards
- Decorative cards with no useful information

---

# 14. Buttons

Buttons must have a clear hierarchy.

### Primary

Used for the most important action.

Example:

```text
+ Create Notebook
```

### Secondary

Used for supporting actions.

Example:

```text
Share
```

### Destructive

Used for irreversible actions.

Example:

```text
Delete Notebook
```

Do not make every button visually dominant.

---

# 15. Forms & Inputs

Forms should be simple and easy to scan.

Use:

- Clear labels
- Helpful placeholders
- Proper error messages
- Consistent spacing
- Visible focus states

Example:

```text
Notebook Name
[ Class 9 Science                  ]

Description
[ Complete science notes...        ]

Visibility
[ 🌎 Public ▼                     ]

                 [ Cancel ] [ Create ]
```

Errors should appear close to the relevant field.

---

# 16. Explore Page

Explore should feel like a knowledge marketplace/discovery system.

Users should quickly understand:

- What is popular
- What is new
- What is relevant
- What they can explore

Suggested sections:

```text
Explore Student Knowledge

[ Search notebooks, topics, files... ]

Trending
Popular
Recently Added

Subjects
Mathematics · Science · Computer Science
English · Hindi · Projects
```

Use visual variety without creating clutter.

---

# 17. Search

Search is a major part of StudentHub.

The search interface should be prominent but not intrusive.

Use:

- Keyboard shortcut where appropriate
- Search suggestions
- Recent searches
- Filters
- Clear empty states
- Useful result metadata

Search results should make it easy to identify:

- Notebook
- Author
- Subject
- Visibility
- Relevance

---

# 18. Collaboration UI

Collaboration should be obvious but not distracting.

Display collaborators using:

- Avatars
- Names
- Role labels
- Permission information

Example:

```text
Collaborators

👤 Raj       Owner
👤 Aman      Editor
👤 Priya     Editor

[ Invite Collaborator ]
```

Invitation flows should be simple and understandable.

---

# 19. Comments

Comments should feel lightweight.

Use:

```text
Avatar  Name · 2h ago
        This note helped me understand the topic.

        Reply
```

Avoid making comments look like a social-media feed.

Keep the focus on educational discussion.

---

# 20. Public vs Private

Visibility should always be clear.

Use recognizable status indicators:

- 🌎 Public
- 🔒 Private

Do not hide important privacy information inside menus.

Before destructive or privacy-sensitive actions, provide clear confirmation.

---

# 21. Empty States

Never leave blank screens.

Every empty state should explain:

1. What is missing
2. Why it matters
3. What the user can do next

Example:

```text
📓
No notebooks yet

Create your first notebook to start
organizing your study materials.

[ Create Notebook ]
```

Empty states should be helpful, not decorative.

---

# 22. Loading States

Use skeleton loaders for content-heavy pages.

Example:

```text
████████████████
██████████

████████████████████
████████████
```

Avoid showing spinners everywhere.

Use skeletons when the structure of the upcoming content is known.

---

# 23. Error States

Errors should be human-readable.

Bad:

```text
Error 500
```

Better:

```text
Something went wrong

We couldn't load this notebook.
Please try again.

[ Try Again ]
```

Never expose raw stack traces or technical errors to normal users.

---

# 24. Micro-interactions

Use subtle animations to make the application feel polished.

Good examples:

- Button hover
- Card hover
- Sidebar transitions
- Modal entrance
- Dropdown animation
- File upload progress
- Toast notifications
- Drag-and-drop feedback

Animations should generally be fast and subtle.

Avoid excessive animation.

---

# 25. Icons

Use one consistent icon library throughout the application.

Recommended:

- Lucide
- Phosphor

Icons should support the interface, not replace important labels.

Keep icon sizing consistent.

Typical sizes:

```text
14px — metadata
16px — buttons
18–20px — navigation
24px — prominent actions
```

---

# 26. Responsive Behaviour

Design for these ranges:

```text
Mobile      < 640px
Tablet      640–1024px
Desktop     1024px+
Large       1440px+
```

Important rules:

- No horizontal scrolling for normal content
- Tables should adapt or become scrollable
- Long file names should truncate gracefully
- Buttons should remain touch-friendly
- Dialogs should fit mobile screens
- Sidebars should collapse on smaller screens

---

# 27. Accessibility

The application should be accessible by default.

Follow:

- Strong text/background contrast
- Visible keyboard focus
- Semantic HTML
- Proper labels
- Accessible buttons
- Alt text for meaningful images
- Keyboard navigation
- Reduced-motion support

Do not communicate important information using color alone.

---

# 28. Dark Mode

If dark mode is implemented, it should be intentionally designed rather than simply inverting colors.

Dark mode should use:

- Dark surfaces
- Slightly lighter borders
- Muted text
- Carefully adjusted brand colors

Avoid pure black backgrounds everywhere.

---

# 29. Design System Rules

Create reusable components instead of designing every page independently.

Build a consistent component system for:

- Buttons
- Inputs
- Dropdowns
- Dialogs
- Cards
- Tabs
- Badges
- Avatars
- Tooltips
- Toasts
- File items
- Folder items
- Notebook cards
- Navigation
- Empty states
- Loading states

Changing a component should update the visual language consistently across the application.

---

# 30. AI Code Editor Instructions

When implementing StudentHub UI:

### DO

- Follow this document consistently.
- Build reusable components.
- Keep layouts clean and spacious.
- Prioritize usability over decoration.
- Use subtle animations.
- Maintain consistent spacing.
- Make every page responsive.
- Use realistic content for UI previews.
- Handle loading, error, and empty states.
- Keep accessibility in mind.
- Make the interface feel production-ready.

### DON'T

- Do not create generic AI-looking dashboards.
- Do not use excessive gradients.
- Do not use random colors.
- Do not make everything glassmorphic.
- Do not overuse rounded cards.
- Do not add unnecessary animations.
- Do not use huge headings everywhere.
- Do not overcrowd pages with statistics.
- Do not create inconsistent components between pages.
- Do not sacrifice usability for visual effects.
- Do not redesign the brand differently on every screen.

---

# 31. Final Quality Standard

Before considering any UI complete, check:

- Does it look like a real modern SaaS product?
- Is the primary action obvious?
- Is the hierarchy clear?
- Is there enough whitespace?
- Are components consistent?
- Does it work beautifully on mobile?
- Are loading and empty states handled?
- Are errors understandable?
- Is the design accessible?
- Does it feel like **StudentHub**, rather than a generic template?

## Final Design Goal

> **StudentHub should feel like a premium, modern knowledge workspace where students can organize, discover, share, and collaborate on learning resources.**

The design should be **clean enough to trust, attractive enough to remember, and simple enough to use immediately.**
