# BetterBARMM 3D icons

The [Phosphor](https://phosphoricons.com) icon set (the one the websites use) as 3D icons. Each icon's filled glyph is extruded with a bevelled edge and rendered with Three.js in headless Chrome.

Every icon uses the same 256-unit grid, camera angle, depth and lighting, so the whole set matches in size and finish.

- **Finishes:** `crimson` for light grounds and `pearl` for dark ones.
- **Still:** a transparent PNG at any size.
- **Animated:** a looping animated WebP, about two seconds long (48 frames at 40 ms), with a gentle sway and float.

## Render

```sh
node glyphs.mjs                                    # glyphs.json from @phosphor-icons/react (1,512 icons)
bun render.ts ~/Downloads/betterbarmm-3d-icons/crimson-512 --palette crimson --size 512
bun render.ts out --palette pearl --size 256 --only bank,island --animate island --frames 48
bun render.ts out --size 256 --animate all         # every icon, animated (about an hour per finish)
```

`renderer.html` holds the look: the palettes, the tilt, the bevel and the lights. Open it through `render.ts`'s server to inspect one icon. `img2webp` (from `brew install webp`) writes the animated files.

The app uses about 36 of these icons, from `mobile/app/assets/icons3d`. After changing that set, run `node mobile/app/scripts/icons3d.mjs`.
