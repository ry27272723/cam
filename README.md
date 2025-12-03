# Hand Gesture Visual Effects

An interactive webpage that uses webcam video input and real-time hand gesture detection to control magical visual effects.

## Features

### 🎮 Three Gesture Types
- **✋ Open Palm** - Spread all fingers
- **✊ Closed Fist** - Close all fingers
- **☝️ One Finger** - Extend index finger only

### 🎨 Three Thematic Modes

#### 🌙 Night Sky Mode
- **One Finger**: Shooting star follows fingertip with glowing trail
- **Closed Fist**: Firework shoots upward and explodes into colorful sparks
- **Open Palm**: Soft glowing halo around hand with gentle pulse

#### 🌸 Garden Mode
- **Closed Fist**: Rainfall effect appears below the fist
- **Open Palm**: Flower stems rise from bottom at palm position (random species)
- **One Finger**: Blooming flower follows the fingertip

#### ✨ Magic Mode
- **One Finger**: Glowing spark orb on fingertip with magical light trail
- **Open Palm**: Dynamic magic circle with rotating mystical symbols
- **Closed Fist**: All magic effects disappear with particle burst

## Project Structure

```
cam/
├── index.html              # Main HTML structure
├── styles.css              # UI styling and animations
├── README.md               # This file
└── js/
    ├── main.js             # Main application controller
    ├── gestureDetector.js  # Hand gesture detection using MediaPipe
    ├── effects.js          # Base effect classes and utilities
    └── modes/
        ├── nightSky.js     # Night Sky mode effects
        ├── garden.js       # Garden mode effects
        └── magic.js        # Magic mode effects
```

## How to Run

### Option 1: Local Web Server (Recommended)

1. Install a simple HTTP server:
   ```bash
   npm install -g http-server
   # or
   python -m http.server 8000
   ```

2. Navigate to the project directory and start the server:
   ```bash
   cd cam
   http-server
   # or
   python -m http.server 8000
   ```

3. Open your browser and go to:
   ```
   http://localhost:8080
   # or
   http://localhost:8000
   ```

### Option 2: Live Server Extension

If you're using VS Code:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Usage Instructions

1. **Allow Camera Access**: When prompted, grant the webpage access to your webcam

2. **Choose a Theme**: Click one of the three mode buttons:
   - 🌙 Night Sky
   - 🌸 Garden
   - ✨ Magic

3. **Start Detection**: Click the "Start" button at the bottom of the video feed

4. **Perform Gestures**: Use your hand gestures to create effects:
   - Make sure your hand is clearly visible in the webcam
   - Try different gestures to see different effects
   - The current gesture will be displayed in the top-left corner

5. **Switch Modes**: Click different theme buttons to try other effects

6. **Stop**: Click "Stop" to pause gesture detection

## Technical Details

### Gesture Detection
- Uses **MediaPipe Hands** for real-time hand tracking
- Detects hand landmarks (21 points per hand)
- Analyzes finger positions to determine gestures
- Optimized for single-hand detection

### Visual Effects
- **Canvas-based rendering** for smooth performance
- **requestAnimationFrame** for 60fps animations
- **Modular effect system** with base classes
- **Particle systems** for dynamic visual elements

### Performance
- Gesture detection: ~30fps
- Visual rendering: ~60fps
- Optimized for desktop browsers (Chrome, Firefox, Edge)

## Browser Compatibility

✅ **Supported Browsers:**
- Chrome/Chromium 90+
- Firefox 88+
- Edge 90+
- Safari 14+ (limited support)

❌ **Not Supported:**
- Internet Explorer
- Older mobile browsers

## Customization

### Adding New Gestures

Edit `js/gestureDetector.js` and modify the `detectGesture()` method:

```javascript
detectGesture(landmarks) {
    // Add your custom gesture detection logic here
    // Return gesture name as string
}
```

### Creating New Effects

1. Create a new effect class in `js/effects.js`:

```javascript
export class MyCustomEffect extends Effect {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }

    update(deltaTime) {
        super.update(deltaTime);
        // Update logic
    }

    draw(ctx) {
        // Drawing logic
    }
}
```

2. Use it in your mode file:

```javascript
import { MyCustomEffect } from '../effects.js';

// In your mode class
onGestureStart(gesture, position) {
    if (gesture === 'my_gesture') {
        this.currentEffect = new MyCustomEffect(position.x, position.y);
    }
}
```

### Adding New Modes

1. Create a new mode file in `js/modes/myMode.js`
2. Export a mode class with these methods:
   - `onGestureStart(gesture, position)`
   - `onGestureMove(gesture, position)`
   - `onGestureEnd(gesture, position)`
   - `update(deltaTime)`
   - `draw(ctx)`
   - `clear()`

3. Register it in `js/main.js`:

```javascript
this.modes = {
    nightsky: new NightSkyMode(),
    garden: new GardenMode(this.canvas.height),
    magic: new MagicMode(),
    mymode: new MyMode() // Add your mode
};
```

4. Add UI button in `index.html`

## Gesture State Handling

Each mode implements three lifecycle methods:

### onGestureStart
Called when a new gesture is detected:
```javascript
onGestureStart(gesture, position) {
    // Initialize effect
    this.currentEffect = new MyEffect(position.x, position.y);
}
```

### onGestureMove
Called continuously while gesture is held:
```javascript
onGestureMove(gesture, position) {
    // Update effect position
    this.currentEffect.update(16, position.x, position.y);
}
```

### onGestureEnd
Called when gesture stops:
```javascript
onGestureEnd(gesture, position) {
    // Finalize or trigger effect
    this.effects.push(this.currentEffect);
    this.currentEffect = null;
}
```

## Troubleshooting

### Camera not working
- Check browser permissions (allow camera access)
- Ensure no other application is using the webcam
- Try a different browser

### Gestures not detected
- Ensure good lighting
- Keep hand clearly visible in frame
- Try adjusting hand position and distance from camera
- Make gestures more pronounced

### Poor performance
- Close other browser tabs
- Reduce browser window size
- Try a more powerful device
- Check if hardware acceleration is enabled

### Effects not showing
- Check browser console for errors (F12)
- Ensure JavaScript is enabled
- Try refreshing the page

## Visual References

For detailed visual examples of each effect, see:
- **Night Sky Effects**: [GitHub visual references] (user will provide links)
- **Garden Effects**: [GitHub visual references] (user will provide links)
- **Magic Effects**: [GitHub visual references] (user will provide links)

## Credits

- **MediaPipe Hands**: Google's hand tracking solution
- **Canvas API**: HTML5 canvas for rendering
- **Particle Effects**: Custom implementation

## License

This project is open source and available for educational purposes.

## Future Enhancements

Potential features to add:
- [ ] Two-hand gesture support
- [ ] More thematic modes (Fire, Water, Lightning)
- [ ] Recording/screenshot functionality
- [ ] Custom color themes
- [ ] Mobile device support
- [ ] Gesture sensitivity settings
- [ ] Effect intensity controls
- [ ] Background blur/effects

## Contributing

Feel free to fork this project and add your own effects and modes!

---

**Enjoy creating magical effects with your hands!** ✨
