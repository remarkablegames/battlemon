# Querystring Scene Testing

Add querystring support to jump directly to specific scenes and override game state for testing.

## Summary

Parse `window.location.search` to support `?scene=shop&coins=100&wave=5` — apply overrides to `runState` and jump to the specified scene, falling back to default preload if the scene name is invalid.

## Implementation

### 1. Add querystring parser utility

- **File:** `src/utils/querystring.ts` (new)
- Create `applyQuerystringOverrides()` function that:
  - Parses `window.location.search`
  - Supports parameters: `scene`, `coins`, `wave`
  - Validates `scene` against `SCENE` constants
  - Applies valid overrides to `runState`
  - Returns the target scene name (or `null` to use default)

### 2. Integrate into preload scene

- **File:** `src/scenes/preload.ts`
- Import `applyQuerystringOverrides` from `../utils/querystring`
- Call it after loading sprites
- If it returns a valid scene name, use that instead of `SCENE.TITLE`

### 3. Document in README

- **File:** `README.md`
- Add a "Development" section after "Available Scripts"
- Document querystring parameters with examples:
  - `?scene=shop` — jump to shop
  - `?scene=shop&coins=100` — shop with 100 coins
  - `?scene=waveStart&wave=5` — wave start at wave 5

## Behavior

- `?scene=shop` — jump directly to shop scene
- `?scene=shop&coins=100` — shop with 100 coins
- `?scene=waveStart&wave=5` — wave start at wave 5
- `?scene=invalid` — fallback to default preload flow
- Missing or invalid parameters are ignored

## Verify

- `npm start` — default flow unchanged (no querystring)
- `npm start` with `?scene=shop` — opens shop directly
- `npm start` with `?scene=shop&coins=100` — shop has 100 coins
- `npm start` with `?scene=waveStart&wave=5` — wave start shows wave 5
- `npm start` with `?scene=invalid` — falls back to preload
