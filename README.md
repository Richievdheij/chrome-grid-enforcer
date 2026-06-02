# Chrome Grid Enforcer

A cyberpunk space shooter. You pilot a ship across a neon city skyline, dodge and
shoot waves of enemy drones, grab pickups and try to survive long enough to top the
leaderboard.

## About this project

This is a school project for the course **Object Oriented Game Development**
(CMTTHE02-04) at Hogeschool Rotterdam – CMGT. The goal of the course is to apply
object oriented programming (inheritance, composition, encapsulation) to a real game.

- **Template:** Space Shooter
- **Theme:** Cyberpunk megacity
- **Engine:** [ExcaliburJS](https://excaliburjs.com/)
- **Tooling:** [Vite](https://vitejs.dev/)

It started from the official course template
([HR-CMGT/prg4-startproject-2026](https://github.com/HR-CMGT/prg4-startproject-2026)).
All game code in `src/` is my own work.

## Controls

| Action | Keys |
|--------|------|
| Move   | WASD or arrow keys |
| Shoot  | Spacebar |
| Back to menu | Escape |

Pick up health packs to heal and EMP bombs to clear the whole screen. Enemies get
tougher the longer you stay alive.

## Run it locally

```bash
npm install
npm run dev      # start the dev server
npm run build    # build to /docs for GitHub Pages
```

## Project structure

```
src/
  actors/   game objects (player, drones, projectiles, pickups, background)
  scenes/   menu, gameplay and leaderboard scenes
  ui/       HUD, buttons, transitions, difficulty manager, leaderboard
  scss/     styling
```
