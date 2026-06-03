# 🎱 Pro Pool 8 Master - Hyper-Realistic 8-Ball Simulation

![Pro Pool 8 Banner](public/icons.svg)

Pro Pool 8 Master is a cinematic, professional-grade 8-ball pool simulation built with **React 18**, **TypeScript**, and the **HTML5 Canvas API**. It features a custom physics engine, elite AI, and master-level visual effects, delivering the most immersive pool experience available in a browser.

## 🚀 Live Demo
[Farmanullah.dev/8-ball-Pool](https://farmanullah1.github.io/8-ball-Pool/) *(Deploying...)*

## ✨ Key Features

### 🎮 Elite Gameplay
- **Custom 2D Physics Engine:** Realistic elastic collisions, rolling friction, and centripetal pocket suction.
- **Master "English" (Spin):** Advanced spin control for Top, Back, and Side spin with realistic lateral deflection (Squirt).
- **Pro Aim Assist:** Laser aim lines with impact point prediction and ghost-ball visualization.
- **Ball-in-Hand:** Full implementation of tournament rules allowing free cue ball positioning after fouls.
- **Strategic AI:** A heuristic-based opponent that calculates strategic leaves and optimal pocket paths.

### 🎨 Master Graphics
- **Cinematic Rendering:** Dynamic depth-of-field, motion blur, and environmental mapping for 3D spherical balls.
- **Atmospheric Lighting:** Cinematic overhead hanging lamp simulation with pulsing ambient glow.
- **Procedural Textures:** Inlaid wood grain rails and high-density felt fiber simulation.
- **High-Impact FX:** Dynamic chalk dust particles, pocket flashes, and motion trails.
- **Modern UI:** Tournament-grade glassmorphic interface with fluid animations.

### 🔊 Immersive Audio
- Low-latency synthetic sound effects for collisions, pocketing, and cue strikes.
- Adaptive volume based on impact intensity.

## 🛠️ Technical Stack
- **Framework:** React 18+ (Functional Components & Hooks)
- **Language:** TypeScript (Strict Type Safety)
- **State Management:** Zustand (High-performance reactive state)
- **Styling:** Tailwind CSS v4 (Vite Optimized)
- **Rendering:** HTML5 Canvas API (Offscreen Pre-rendering for 60FPS)
- **Icons:** Lucide React

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/farmanullah1/8-ball-Pool.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📜 Standard 8-Ball Rules Applied
- **Opening Break:** Determined by luck or selection.
- **Suit Assignment:** The first legally pocketed ball (Solid or Stripe) determines the player's suit.
- **The 8-Ball:** Must be pocketed last after all suit balls are cleared. Pocketing the 8-ball early results in an instant loss.
- **Fouls:** Scratching the cue ball or hitting the wrong suit first grants "Ball-in-Hand" to the opponent.

---
Developed with ❤️ by Farman Ullah
