# Shadowrun Enhanced Features Setup Guide

## 🚀 New Features Added

### 1. Interactive 3D Dice Roller
- **Location**: `/game-dashboard` (Dice tab)
- **Features**:
  - Realistic physics simulation
  - Shadowrun hit/glitch calculation
  - Edge roll support
  - Roll history tracking
  - Sound effects

### 2. Real-Time Combat Manager
- **Location**: `/game-dashboard` (Combat tab)
- **Features**:
  - Initiative tracking with auto-sorting
  - Turn order management
  - Physical/Stun damage tracking
  - Edge tracking
  - Combat log
  - Add/remove combatants

### 3. Matrix Interface Simulator
- **Location**: `/game-dashboard` (Matrix tab)
- **Features**:
  - 3D node visualization
  - Hacking actions (Hack, Search, Download, Crash)
  - ICE program behavior
  - Overwatch score tracking
  - Matrix perception checks
  - Hot-sim/AR mode toggle

## 📦 Installation

### Frontend Setup
```bash
cd shadowrun-interface
npm install
# The package.json already includes all necessary dependencies
```

### Backend Setup
```bash
cd shadowrun-backend
pip install -r requirements.txt
# Run database migrations
python app.py
```

## 🎮 Quick Start

1. **Access the Dashboard**:
   ```
   http://localhost:3000/game-dashboard
   ```

2. **3D Dice Roller**:
   - Set dice pool (1-20 dice)
   - Set threshold (default 5)
   - Toggle Edge rolls
   - Click "ROLL DICE" to roll

3. **Combat Manager**:
   - Click "ADD COMBATANT" to add fighters
   - Click "ROLL INITIATIVE" to start combat
   - Use "END TURN" to advance
   - Click combatants to see details/apply damage

4. **Matrix Interface**:
   - Click "MATRIX PERCEPTION" to discover nodes
   - Click on nodes to select them
   - Use action buttons to hack/interact
   - Watch Overwatch score!

## 🔧 API Endpoints

### Combat API
- `POST /api/session/<id>/combat/create` - Create combat
- `GET /api/session/<id>/combat/<id>/combatants` - Get combatants
- `POST /api/session/<id>/combat/<id>/roll-initiative` - Roll initiative
- `POST /api/session/<id>/combat/<id>/damage` - Apply damage

### Matrix API
- `POST /api/session/<id>/matrix/grid/create` - Create matrix grid
- `GET /api/session/<id>/matrix/grid/<id>/nodes` - Get nodes
- `POST /api/session/<id>/matrix/action` - Perform matrix action
- `POST /api/session/<id>/matrix/perception` - Matrix perception

## 🎨 Customization

### Dice Colors
Edit `components/DiceRoller3D.tsx`:
```typescript
color={settled ? '#00ff00' : '#ff0000'} // Green when settled, red while rolling
```

### Combat Settings
Edit `components/CombatManager.tsx`:
```typescript
conditionMonitor: {
  physical: 10,  // Default physical health
  stun: 10      // Default stun health
}
```

### Matrix Theme
Edit `components/MatrixInterface.tsx`:
```typescript
// Matrix rain color
ctx.fillStyle = '#00ff00';
```

## 🐛 Troubleshooting

### Three.js Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
# Reset database
rm shadowrun.db
python app.py  # Will recreate tables
```

### Missing Dependencies
```bash
# Frontend
npm install three @react-three/fiber @react-three/drei @react-three/cannon framer-motion howler

# Backend
pip install flask flask-sqlalchemy flask-cors
```

## 🚀 Next Steps

1. **Add sound effects**:
   - Place dice roll sounds in `public/sounds/dice-roll.mp3`

2. **Customize visuals**:
   - Modify colors in component files
   - Add custom dice textures
   - Create Matrix node icons

3. **Extend functionality**:
   - Add spell effects to combat
   - Add more Matrix programs
   - Create custom dice types

Enjoy your enhanced Shadowrun experience! 🎲⚔️🌐 