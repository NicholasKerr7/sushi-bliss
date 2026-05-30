# Sushi Bliss Asset Audit

Date: 2026-05-30

## Package

Primary source: `/Users/nick007/Downloads/sushi-bliss-final-app-assets.zip`
Icon refresh source: `/Users/nick007/Downloads/nextjs-icon-assets/public/assets.zip`

Copied into:

```txt
public/assets/
  ambience/
  brand/
  chefs/
  data/
  editorial/
  icons/
  ingredients/
  maps/
  menu/
  omakase/
  pairings/
  screenshots/
```

## Verified Counts

- `public/assets/data/data.json`: 38 menu items, 38 pairings, 4 chefs, 16 screenshot references, 4 master-chef omakase course sets.
- `public/assets/data/asset-manifest.json`: 198 audited package assets.
- Total copied files in `public/assets`: 201 including data files.
- Transparent icon assets now live directly in `public/assets/icons`; the old generated `icons-clean` folder was removed.
- Map and live-tracking imagery from the refresh package live in `public/assets/maps`.
- Brand assets are PNG-only; stale duplicate WebP logo variants were removed.
- Appetizer, specialty, and dessert photography now lives under `public/assets/omakase` and is reserved for the Master Chefs Omakase Experience.
- Duplicate menu IDs: none.
- Missing pairing references: none.
- Missing chef notes: none.
- Known standalone menu image fallback: `sushi-cone`, resolved through the app-level hero fallback after the removed pairing image.

## Integration Rules

- React components should use public URLs beginning with `/assets/...`.
- `data.json` is the menu, chef, pairing, brand, and featured-assets source of truth.
- Pairing images are visual assets only; all sake names and descriptive text are rendered dynamically.
- Screenshots remain design references and are not imported into production UI.
