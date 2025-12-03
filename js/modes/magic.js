/**
 * Magic Mode
 * Visual effects inspired by magic and mystical energy
 *
 * Gestures:
 * - One Finger: Glowing spark orb on fingertip with light trail
 * - Open Palm: Dynamic magic circle with rotating symbols
 * - Closed Fist: All magic effects disappear immediately
 *
 * Visual references available in GitHub (user will provide links)
 */

import { Effect, Trail, Particle, Utils } from '../effects.js';

/**
 * Spark Orb Effect
 * Glowing orb attached to fingertip with trailing particles
 */
class SparkOrb extends Effect {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.trail = new Trail(25);
        this.particles = [];
        this.pulsePhase = 0;
        this.coreSize = 8;
    }

    update(deltaTime, x, y) {
        super.update(deltaTime);

        if (x !== undefined && y !== undefined) {
            this.x = x;
            this.y = y;
        }

        // Add to trail
        this.trail.addPoint(this.x, this.y);
        this.trail.update(deltaTime);

        // Pulse animation
        this.pulsePhase += deltaTime * 0.005;

        // Spawn sparkle particles
        if (Math.random() < 0.4) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(0.5, 2);
            const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ffffff'];

            this.particles.push(new Particle(
                this.x + Utils.random(-5, 5),
                this.y + Utils.random(-5, 5),
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                colors[Math.floor(Math.random() * colors.length)],
                Utils.random(1, 3),
                Utils.random(300, 600)
            ));
        }

        // Update particles
        this.particles.forEach(p => p.update(deltaTime));
        this.particles = this.particles.filter(p => !p.isDead());
    }

    draw(ctx) {
        // Draw magic trail
        this.trail.draw(ctx, '#ff00ff', 6);
        this.trail.draw(ctx, '#00ffff', 3);

        // Draw sparkle particles
        this.particles.forEach(p => p.draw(ctx));

        // Draw orb
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 1;
        const currentSize = this.coreSize * pulse;

        ctx.save();

        // Outer glow layers
        const glowColors = [
            { color: 'rgba(255, 0, 255, 0.4)', size: currentSize * 4 },
            { color: 'rgba(0, 255, 255, 0.3)', size: currentSize * 3 },
            { color: 'rgba(255, 255, 0, 0.2)', size: currentSize * 2 }
        ];

        glowColors.forEach(({ color, size }) => {
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, size
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Inner bright core
        const coreGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, currentSize
        );
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.5, '#ffff00');
        coreGradient.addColorStop(1, '#ff00ff');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    clear() {
        this.trail.clear();
        this.particles = [];
    }
}

/**
 * Magic Rune Symbol
 */
class MagicRune {
    constructor(radius, index, total) {
        this.radius = radius;
        this.angle = (Math.PI * 2 * index) / total;
        this.rotation = Utils.random(0, Math.PI * 2);
        this.rotationSpeed = Utils.random(-0.002, 0.002);
        this.symbol = this.getRandomSymbol();
        this.opacity = Utils.random(0.5, 1);
    }

    getRandomSymbol() {
        const symbols = ['◈', '◇', '◆', '◉', '○', '◎', '●', '◐', '◑', '⬡', '⬢', '⬣'];
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    update(deltaTime, baseRotation) {
        this.rotation += this.rotationSpeed * deltaTime;
        this.angle += baseRotation * deltaTime * 0.001;
    }

    draw(ctx, centerX, centerY) {
        const x = centerX + Math.cos(this.angle) * this.radius;
        const y = centerY + Math.sin(this.angle) * this.radius;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);

        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#00ffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);

        ctx.restore();
    }
}

/**
 * Magic Circle Effect
 * Rotating magic circle with mystical symbols
 */
class MagicCircle extends Effect {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.baseRotation = 0;
        this.pulsePhase = 0;
        this.baseRadius = 80;

        // Create concentric circles
        this.circles = [
            { radius: 60, speed: 0.5, width: 2 },
            { radius: 80, speed: -0.3, width: 3 },
            { radius: 100, speed: 0.4, width: 2 }
        ];

        // Create runes
        this.runes = [];
        const runeRings = [70, 90];
        runeRings.forEach(radius => {
            const runeCount = 8;
            for (let i = 0; i < runeCount; i++) {
                this.runes.push(new MagicRune(radius, i, runeCount));
            }
        });

        // Energy particles
        this.particles = [];
    }

    update(deltaTime, x, y) {
        super.update(deltaTime);

        if (x !== undefined && y !== undefined) {
            this.x = x;
            this.y = y;
        }

        this.pulsePhase += deltaTime * 0.003;

        // Update circles rotation
        this.circles.forEach(circle => {
            circle.rotation = (circle.rotation || 0) + circle.speed * deltaTime * 0.001;
        });

        // Update runes
        this.runes.forEach(rune => rune.update(deltaTime, this.baseRotation));

        // Spawn energy particles
        if (Math.random() < 0.3) {
            const angle = Utils.random(0, Math.PI * 2);
            const radius = Utils.random(50, 100);
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;

            this.particles.push(new Particle(
                x, y,
                (this.x - x) * 0.02,
                (this.y - y) * 0.02,
                Utils.random(0, 1) > 0.5 ? '#ff00ff' : '#00ffff',
                Utils.random(1, 2),
                Utils.random(500, 1000)
            ));
        }

        // Update particles
        this.particles.forEach(p => p.update(deltaTime));
        this.particles = this.particles.filter(p => !p.isDead());
    }

    draw(ctx) {
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;

        ctx.save();

        // Draw concentric circles
        this.circles.forEach(circle => {
            const currentRadius = circle.radius * pulse;

            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = circle.width;
            ctx.globalAlpha = 0.6;

            // Draw segmented circle
            const segments = 32;
            for (let i = 0; i < segments; i++) {
                if (i % 2 === 0) {
                    const startAngle = (Math.PI * 2 * i) / segments + (circle.rotation || 0);
                    const endAngle = (Math.PI * 2 * (i + 1)) / segments + (circle.rotation || 0);

                    ctx.beginPath();
                    ctx.arc(this.x, this.y, currentRadius, startAngle, endAngle);
                    ctx.stroke();
                }
            }
        });

        // Draw connecting lines
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;

        const lineCount = 8;
        for (let i = 0; i < lineCount; i++) {
            const angle = (Math.PI * 2 * i) / lineCount + this.pulsePhase;
            const innerRadius = this.circles[0].radius * pulse;
            const outerRadius = this.circles[2].radius * pulse;

            ctx.beginPath();
            ctx.moveTo(
                this.x + Math.cos(angle) * innerRadius,
                this.y + Math.sin(angle) * innerRadius
            );
            ctx.lineTo(
                this.x + Math.cos(angle) * outerRadius,
                this.y + Math.sin(angle) * outerRadius
            );
            ctx.stroke();
        }

        // Draw runes
        ctx.globalAlpha = 1;
        this.runes.forEach(rune => rune.draw(ctx, this.x, this.y));

        // Draw center glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, 30 * pulse
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 30 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw energy particles
        ctx.globalAlpha = 1;
        this.particles.forEach(p => p.draw(ctx));

        ctx.restore();
    }
}

/**
 * Disappear Effect
 * Visual effect when clearing all magic
 */
class DisappearEffect extends Effect {
    constructor(effects) {
        super();
        this.particles = [];

        // Create particles from effect positions
        effects.forEach(effect => {
            if (effect.x !== undefined && effect.y !== undefined) {
                for (let i = 0; i < 20; i++) {
                    const angle = Utils.random(0, Math.PI * 2);
                    const speed = Utils.random(2, 6);

                    this.particles.push(new Particle(
                        effect.x,
                        effect.y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        Utils.random(0, 1) > 0.5 ? '#ff00ff' : '#00ffff',
                        Utils.random(2, 4),
                        Utils.random(400, 800)
                    ));
                }
            }
        });
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.particles.forEach(p => p.update(deltaTime));
        this.particles = this.particles.filter(p => !p.isDead());

        if (this.particles.length === 0) {
            this.isActive = false;
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

/**
 * Magic Mode Controller
 */
export class MagicMode {
    constructor() {
        this.name = 'Magic';
        this.currentEffect = null;
        this.magicCircles = [];
        this.disappearEffects = [];
        this.lastGesture = null;
    }

    /**
     * Handle gesture start
     */
    onGestureStart(gesture, position) {
        this.lastGesture = gesture;

        if (gesture === 'one_finger') {
            this.currentEffect = new SparkOrb(position.x, position.y);
        } else if (gesture === 'open_palm') {
            this.currentEffect = new MagicCircle(position.x, position.y);
        }
    }

    /**
     * Handle gesture movement
     */
    onGestureMove(gesture, position) {
        if (this.currentEffect) {
            this.currentEffect.update(16, position.x, position.y);
        }
    }

    /**
     * Handle gesture end
     */
    onGestureEnd(gesture, position) {
        if (gesture === 'closed_fist') {
            // Clear all effects with disappear animation
            const allEffects = [];

            if (this.currentEffect) {
                allEffects.push(this.currentEffect);
            }
            allEffects.push(...this.magicCircles);

            if (allEffects.length > 0) {
                this.disappearEffects.push(new DisappearEffect(allEffects));
            }

            this.currentEffect = null;
            this.magicCircles = [];
        } else if (gesture === 'open_palm' && this.currentEffect instanceof MagicCircle) {
            // Keep the magic circle
            this.magicCircles.push(this.currentEffect);
            this.currentEffect = null;
        } else {
            this.currentEffect = null;
        }

        this.lastGesture = null;
    }

    /**
     * Update all effects
     */
    update(deltaTime) {
        if (this.currentEffect) {
            this.currentEffect.update(deltaTime);
        }

        // Update magic circles (they persist)
        this.magicCircles.forEach(circle => circle.update(deltaTime));

        // Update disappear effects
        this.disappearEffects.forEach(effect => effect.update(deltaTime));
        this.disappearEffects = this.disappearEffects.filter(effect => !effect.isDead());
    }

    /**
     * Draw all effects
     */
    draw(ctx) {
        // Draw persistent magic circles
        this.magicCircles.forEach(circle => circle.draw(ctx));

        // Draw current effect
        if (this.currentEffect) {
            this.currentEffect.draw(ctx);
        }

        // Draw disappear effects
        this.disappearEffects.forEach(effect => effect.draw(ctx));
    }

    /**
     * Clear all effects
     */
    clear() {
        this.currentEffect = null;
        this.magicCircles = [];
        this.disappearEffects = [];
    }
}
