/**
 * Night Sky Mode
 * Visual effects inspired by the night sky
 *
 * Gestures:
 * - One Finger: Shooting star follows fingertip with glowing trail
 * - Closed Fist: Firework shoots upward and explodes
 * - Open Palm: Soft glowing halo around hand with pulse
 *
 * Visual references available in GitHub (user will provide links)
 */

import { Effect, Particle, Trail, GlowEffect, Utils } from '../effects.js';

/**
 * Shooting Star Effect
 * Follows the fingertip with a glowing particle trail
 */
class ShootingStar extends Effect {
    constructor() {
        super();
        this.trail = new Trail(30);
        this.particles = [];
        this.lastX = 0;
        this.lastY = 0;
    }

    update(deltaTime, x, y) {
        super.update(deltaTime);

        // Add point to trail
        if (x !== undefined && y !== undefined) {
            this.trail.addPoint(x, y);

            // Add sparkle particles along the path
            if (Math.random() < 0.3) {
                const angle = Utils.random(0, Math.PI * 2);
                const speed = Utils.random(0.5, 2);
                this.particles.push(new Particle(
                    x, y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    '#ffffff',
                    Utils.random(1, 3),
                    Utils.random(300, 600)
                ));
            }

            this.lastX = x;
            this.lastY = y;
        }

        // Update trail and particles
        this.trail.update(deltaTime);
        this.particles.forEach(p => p.update(deltaTime));
        this.particles = this.particles.filter(p => !p.isDead());
    }

    draw(ctx) {
        // Draw glowing trail
        this.trail.draw(ctx, '#88ccff', 8);

        // Draw bright core trail
        this.trail.draw(ctx, '#ffffff', 3);

        // Draw sparkle particles
        this.particles.forEach(p => p.draw(ctx));

        // Draw bright star at fingertip
        if (this.trail.points.length > 0) {
            const last = this.trail.points[this.trail.points.length - 1];

            ctx.save();

            // Outer glow
            const gradient = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 15);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.5, '#88ccffaa');
            gradient.addColorStop(1, '#88ccff00');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(last.x, last.y, 15, 0, Math.PI * 2);
            ctx.fill();

            // Inner bright core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    clear() {
        this.trail.clear();
        this.particles = [];
    }
}

/**
 * Firework Effect
 * Shoots upward from hand position and explodes
 */
class Firework extends Effect {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.startY = y;
        this.exploded = false;
        this.particles = [];
        this.rocketSpeed = -8;
        this.rocketY = y;
        this.color = Utils.randomColor();
        this.trail = [];
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (!this.exploded) {
            // Rocket rises
            this.rocketY += this.rocketSpeed;

            // Add trail
            this.trail.push({ x: this.x, y: this.rocketY, age: 0 });

            // Age trail points
            this.trail.forEach(point => {
                point.age += deltaTime;
            });

            // Remove old trail points
            this.trail = this.trail.filter(point => point.age < 500);

            // Explode when reaches top third of screen or after certain time
            if (this.rocketY < this.startY - 200 || this.age > 1000) {
                this.explode();
            }
        } else {
            // Update explosion particles
            this.particles.forEach(p => p.update(deltaTime));
            this.particles = this.particles.filter(p => !p.isDead());

            if (this.particles.length === 0) {
                this.isActive = false;
            }
        }
    }

    explode() {
        this.exploded = true;

        // Create explosion particles
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Utils.random(3, 8);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            // Mix of colors
            const colors = [this.color, '#ffffff', '#ffeb3b'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new Particle(
                this.x, this.rocketY,
                vx, vy,
                color,
                Utils.random(2, 4),
                Utils.random(1000, 2000)
            ));
        }

        // Add some extra sparkles
        for (let i = 0; i < 20; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(1, 4);

            this.particles.push(new Particle(
                this.x, this.rocketY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ffffff',
                Utils.random(1, 2),
                Utils.random(800, 1500)
            ));
        }
    }

    draw(ctx) {
        if (!this.exploded) {
            // Draw rocket trail
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;

            for (let i = 1; i < this.trail.length; i++) {
                const opacity = 1 - (this.trail[i].age / 500);
                ctx.globalAlpha = opacity * 0.6;
                ctx.beginPath();
                ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.stroke();
            }

            // Draw rocket
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.rocketY, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        } else {
            // Draw explosion particles
            this.particles.forEach(p => p.draw(ctx));
        }
    }
}

/**
 * Halo Effect
 * Soft glowing aura around the open palm
 */
class Halo extends GlowEffect {
    constructor(x, y) {
        super(x, y, 100, '#ffd700', 3);
        this.rings = 3;
    }

    draw(ctx) {
        ctx.save();

        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;

        // Draw multiple rings
        for (let i = 0; i < this.rings; i++) {
            const ringRadius = this.radius * (1 + i * 0.3) * pulse;
            const opacity = (1 - i / this.rings) * 0.5;

            const gradient = ctx.createRadialGradient(
                this.x, this.y, ringRadius * 0.3,
                this.x, this.y, ringRadius
            );

            gradient.addColorStop(0, `rgba(255, 215, 0, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(255, 223, 128, ${opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add small star particles around the halo
        const starCount = 8;
        for (let i = 0; i < starCount; i++) {
            const angle = (Math.PI * 2 * i) / starCount + this.pulsePhase * 0.5;
            const distance = this.radius * 0.8 * pulse;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;

            ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.8})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

/**
 * Night Sky Mode Controller
 */
export class NightSkyMode {
    constructor() {
        this.name = 'Night Sky';
        this.currentEffect = null;
        this.fireworks = [];
        this.lastGesture = null;
    }

    /**
     * Handle gesture start
     */
    onGestureStart(gesture, position) {
        this.lastGesture = gesture;

        if (gesture === 'one_finger') {
            this.currentEffect = new ShootingStar();
        } else if (gesture === 'open_palm') {
            this.currentEffect = new Halo(position.x, position.y);
        }
    }

    /**
     * Handle gesture movement
     */
    onGestureMove(gesture, position) {
        // Update active effect position
        if (this.currentEffect) {
            if (this.currentEffect instanceof ShootingStar) {
                this.currentEffect.update(16, position.x, position.y);
            } else if (this.currentEffect instanceof Halo) {
                this.currentEffect.x = position.x;
                this.currentEffect.y = position.y;
            }
        }
    }

    /**
     * Handle gesture end
     */
    onGestureEnd(gesture, position) {
        if (gesture === 'closed_fist' && position) {
            // Create firework
            this.fireworks.push(new Firework(position.x, position.y));
        }

        // Clear current effect
        this.currentEffect = null;
        this.lastGesture = null;
    }

    /**
     * Update all effects
     */
    update(deltaTime) {
        if (this.currentEffect) {
            this.currentEffect.update(deltaTime);
        }

        // Update fireworks
        this.fireworks.forEach(fw => fw.update(deltaTime));
        this.fireworks = this.fireworks.filter(fw => !fw.isDead());
    }

    /**
     * Draw all effects
     */
    draw(ctx) {
        // Draw fireworks
        this.fireworks.forEach(fw => fw.draw(ctx));

        // Draw current effect
        if (this.currentEffect) {
            this.currentEffect.draw(ctx);
        }
    }

    /**
     * Clear all effects
     */
    clear() {
        this.currentEffect = null;
        this.fireworks = [];
    }
}
