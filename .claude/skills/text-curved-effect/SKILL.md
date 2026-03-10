---
name: text-curved-effect
description: Generate an interactive 3D curved text displacement effect using Three.js and GLSL shaders. The text lifts and curves when the mouse hovers near it. Based on the Codrops tutorial by Paola Demichelis.
argument-hint: [text to display, e.g. "hello\nworld"]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Three.js Curved Text Displacement Effect

Creates an interactive WebGL text effect where text on a plane is displaced (lifted/curved) toward the viewer when the mouse hovers near it. Built with Three.js + custom GLSL shaders.

**Reference**: [Codrops Tutorial](https://tympanus.net/codrops/2025/03/24/animating-letters-with-shaders-interactive-text-effect-with-three-js-glsl/) by Paola Demichelis
**Original CodePen**: [ByaNGod](https://codepen.io/Paola-Demichelis-the-lessful/pen/ByaNGod)

## How the Effect Works

1. Text is rendered to a **Canvas 2D texture** (dynamically, so text is easily changeable)
2. The texture is mapped onto a **PlaneGeometry(15, 15, 100, 100)** — 100x100 segments allow smooth vertex displacement
3. A **vertex shader** displaces vertices along the z-axis based on distance from the mouse cursor, using cubic easing for a smooth wave
4. A **shadow plane** sits behind the text — its fragment shader fades alpha near the cursor, creating the illusion of the text lifting off the surface
5. An **invisible hit plane** is used for raycasting to track mouse position in 3D space
6. An **OrthographicCamera** at `(0, -10, 5)` with planes rotated `Math.PI / 4` gives the isometric diagonal look

## Arguments

The user provides the text to display as `$ARGUMENTS`. Use `\n` for line breaks.

- Default text: `"happy\ndays"`
- Default font: serif, bold, 180px
- Default colors: white text on dark background (#1a1a1a)

## Required Dependencies

```bash
npm install three @types/three
```

## File Structure to Create

```
src/
  utils/createTextTexture.ts   — Canvas-based text & shadow texture generator
  components/TextCurvedEffect.tsx — Main React component with Three.js scene
```

## Implementation Instructions

### Step 1: Create `src/utils/createTextTexture.ts`

This file exports two functions:

- `createTextTexture(options)` — Renders sharp text on a 2048x2048 canvas, returns `THREE.CanvasTexture`
- `createShadowTexture(options)` — Same but with `ctx.filter = "blur(12px)"` and gray color for the shadow

Options interface:
```typescript
interface TextTextureOptions {
  text: string;
  fontSize?: number;       // default 180
  fontFamily?: string;     // default "serif"
  fontWeight?: string;     // default "bold"
  color?: string;          // default "#ffffff"
  canvasWidth?: number;    // default 2048
  canvasHeight?: number;   // default 2048
  blur?: number;           // default 12 (shadow only)
}
```

### Step 2: Create `src/components/TextCurvedEffect.tsx`

This React component sets up the full Three.js scene. Here are the exact shaders:

**Main Vertex Shader:**
```glsl
varying vec2 vUv;
uniform vec3 uDisplacement;

float easeInOutCubic(float x) {
  return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  vUv = uv;
  vec3 new_position = position;
  vec4 localPosition = vec4(position, 1.0);
  vec4 worldPosition = modelMatrix * localPosition;
  float dist = length(uDisplacement - worldPosition.rgb);
  float min_distance = 3.0;

  if (dist < min_distance) {
    float distance_mapped = map(dist, 0.0, min_distance, 1.0, 0.0);
    float val = easeInOutCubic(distance_mapped) * 1.0;
    new_position.z += val;
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(new_position, 1.0);
}
```

**Main Fragment Shader:**
```glsl
varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
  vec4 color = texture2D(uTexture, vUv);
  gl_FragColor = vec4(color);
}
```

**Shadow Vertex Shader:**
```glsl
varying vec2 vUv;
varying float dist;
uniform vec3 uDisplacement;

void main() {
  vUv = uv;
  vec4 localPosition = vec4(position, 1.0);
  vec4 worldPosition = modelMatrix * localPosition;
  dist = length(uDisplacement - worldPosition.rgb);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Shadow Fragment Shader:**
```glsl
varying vec2 vUv;
varying float dist;
uniform sampler2D uTexture;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  vec4 color = texture2D(uTexture, vUv);
  float min_distance = 3.0;
  if (dist < min_distance) {
    float alpha = map(dist, min_distance, 0.0, color.a, 0.0);
    color.a = alpha;
  }
  gl_FragColor = vec4(color);
}
```

**Scene setup key parameters:**
- `OrthographicCamera` with `cameraDistance = 8`, position `(0, -10, 5)`
- Both text and shadow planes: `rotation.z = Math.PI / 4`
- Hit plane: `PlaneGeometry(500, 500, 10, 10)` with opacity 0
- Raycaster updates `uDisplacement` uniform on both shader materials
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`

**Component props:**
```typescript
interface TextCurvedEffectProps {
  text?: string;            // default "happy\ndays"
  fontSize?: number;        // default 180
  fontFamily?: string;      // default "serif"
  fontWeight?: string;      // default "bold"
  textColor?: string;       // default "#ffffff"
  backgroundColor?: string; // default "#1a1a1a"
}
```

### Step 3: Update App.tsx

Replace the default content with:
```tsx
import TextCurvedEffect from "./components/TextCurvedEffect";

function App() {
  return (
    <TextCurvedEffect
      text={$ARGUMENTS || "happy\\ndays"}
      fontSize={180}
      fontFamily="serif"
      fontWeight="bold"
      textColor="#ffffff"
      backgroundColor="#1a1a1a"
    />
  );
}

export default App;
```

### Step 4: Clean up unused files

Remove `src/App.css` and unused logo imports if they exist.

## Customization Tips

- **Change text**: Pass different `text` prop (use `\n` for line breaks)
- **Displacement radius**: Change `min_distance` in both shaders (default 3.0)
- **Displacement height**: Change the multiplier after `easeInOutCubic(...)` (default 1.0)
- **Easing**: Swap `easeInOutCubic` for other easing functions
- **Rotation**: Change `plane.rotation.z` to adjust viewing angle
- **Font**: Pass a web font family after loading it via CSS `@font-face`