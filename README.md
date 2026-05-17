# st_multichar

Cinematic multi-character selector for ox_core. Replaces ox's built-in
input-dialog flow with a full-screen, in-world selector.

**What you get:**

- Welcome splash with branded wordmark + "Press Enter to continue"
- HUD-style vital pill (top-left) with character name, stateId, age, sex,
  status, cash, affiliation, last-seen
- Slot dock at the bottom — number-key shortcuts (1–9), arrows / WASD,
  hover-grow, staggered entrance animation
- Synced-scene primary ped sitting in a clubhouse chair, magical-poof
  transitions between characters
- Cinematic Play transition: name reveal, loading bar, slow black-to-world fade
- Type-name-to-confirm delete with consistent visual language
- Auto-open `st_appearance` for newly created characters with a clean
  camera handoff
- `/logout` returns the player to the selector mid-session
- Synthesized SFX (hover, click, confirm, cancel, transitions) — no audio assets

## Setup

1. Drop the resource into `resources/[strata]/st_multichar/`.
2. Build the UI (see below).
3. In `server.cfg`:
   ```
   setr ox:characterSelect 0
   ensure st_multichar
   ```
   Order it after `ox_core` and `st_appearance`.

## Build the UI

```sh
cd web
bun install
bun run dev    # http://localhost:5501 — browser preview with mock data
bun run build  # → ./dist  (committed assets served by FiveM)
```

The browser preview uses `DEV_MOCK` data from `web/src/config.ts` so you
can iterate on layout without launching the game.

## Configuration

All runtime config lives in `shared/config.lua`. Highlights:

| Field                    | Purpose                                                          |
|--------------------------|------------------------------------------------------------------|
| `MaxSlots`               | Number of slots in the dock. Must be ≤ ox_core's CHARACTER_SLOTS.|
| `Interior` / `PlayerHide`| Where the selector scene runs and where the local player parks.  |
| `Scene`                  | Synced-scene primary ped (chair anim, prop, deltaZ).             |
| `Slots[]`                | Per-slot ped coords + heading + idle animation.                  |
| `EmptySlotModel`         | Placeholder ped streamed for empty slots.                        |
| `Camera`                 | Static select cam — coords, rotation, fov, interp, DOF.          |
| `WelcomeCamera`          | Bobbing welcome cam — coords, rotation, fov, optional `bob` table.|
| `PanInterp` / `RestoreInterp` | Slot pan + restore transitions.                             |
| `CreatorCamera` / `CreatorPed`| Close-up framing during new-character creation.             |
| `FallbackSpawn`          | World coords used when a character has no saved last-known position.|
| `OpenAppearanceOnCreate` | Auto-open `st_appearance` for newly created characters.          |
| `ShowWelcome`            | Show the splash screen on every entry into the selector.         |
| `RequireNameToDelete`    | Require typing the character's full name to confirm deletion.    |
| `Brand`                  | Header text (name, tagline, version).                            |

## How it integrates with ox_core

Hooks the existing events; doesn't fork or replicate ox's protocol:

- `ox:startCharacterSelect` (server emit) → triggers the camera + UI
- `ox:setActiveCharacter`   (server emit) → triggers world hand-off + fade
- `emitNet('ox:setActiveCharacter', charId)` → play
- `emitNet('ox:setActiveCharacter', { firstName, lastName, gender, date })` → create
- `lib.callback.await('ox:deleteCharacter', false, charId)` → delete
- `Ox.GetPlayer(source).logout()` → server-side `/logout` command

## Layout

```
st_multichar/
├── fxmanifest.lua
├── shared/
│   ├── types.lua          ---@meta type aliases (Character, Appearance, …)
│   └── config.lua         runtime tunables
├── client/
│   ├── interior.lua       Interior.* — pin / unpin selector interior
│   ├── player.lua         Player.*  — reset, waitForReady, teleport, streamSceneAt
│   ├── camera.lua         Camera.*  — select / welcome / pan / fade
│   ├── preview.lua        Preview.* — peds, scenes, magic-poof, slot hide/show
│   └── main.lua           entry — ox events, NUI callbacks, onResourceStop
├── server/
│   ├── db.lua             DB.*      — annotated query helpers
│   └── main.lua           callbacks, /logout, onResourceStart re-push
├── data/peds.meta         streamed empty-slot ped metadata
├── stream/                streamed empty-slot models
└── web/
    ├── src/               React + Mantine UI source
    ├── dist/              built bundle (Vite output)
    ├── package.json
    └── vite.config.ts
```

Module loading uses ox_lib helpers — `lib.requestModel`, `lib.requestAnimDict`,
`lib.requestNamedPtfxAsset`, `lib.waitFor`, `cache.ped`, `cache.playerId`.

## Dependencies

- `ox_core` — character system
- `ox_lib` — callbacks, commands, cache, request helpers
- `oxmysql` — direct DB reads for appearance + flavor data
- `st_appearance` — preview ped skin + post-create customization
- `st_log` — structured logging
- `st_bootstrap` *(optional)* — loadscreen handoff via `exports.st_bootstrap:shutdown()`
