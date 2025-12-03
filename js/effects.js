/**
 * Base Effect Classes and Utilities
 * Provides common functionality for all visual effects
 */

/**
 * Base class for all effects
 */
export class Effect {
    constructor() {
        this.isActive = true;
        this.age = 0;
    }

    update(deltaTime) {
        this.age += deltaTime;
    }

    draw(ctx) {
        // Override in subclass
    }

    isDead() {
        return !this.isActive;
    }
}

/**
 * Particle effect
 */
export class Particle extends Effect {
    constructor(x, y, vx = 0, vy = 0, color = '#ffffff', size = 2, lifetime = 1000) {
        super();
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.lifetime = lifetime;
        this.opacity = 1;
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.x += this.vx * deltaTime * 0.06;
        this.y += this.vy * deltaTime * 0.06;

        // Fade out over lifetime
        this.opacity = Math.max(0, 1 - this.age / this.lifetime);

        if (this.age >= this.lifetime) {
            this.isActive = false;
        }
    }

    draw(ctx) {
        if (!this.isActive) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * Trail effect (for following cursor/finger)
 */
export class Trail extends Effect {
    constructor(maxLength = 20) {
        super();
        this.points = [];
        this.maxLength = maxLength;
    }

    addPoint(x, y) {
        this.points.push({ x, y, age: 0 });
        if (this.points.length > this.maxLength) {
            this.points.shift();
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Age all points
        this.points.forEach(point => {
            point.age += deltaTime;
        });

        // Remove old points
        this.points = this.points.filter(point => point.age < 1000);
    }

    draw(ctx, color = '#ffffff', width = 5) {
        if (this.points.length < 2) return;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw trail with gradient opacity
        for (let i = 1; i < this.points.length; i++) {
            const prev = this.points[i - 1];
            const curr = this.points[i];
            const opacity = i / this.points.length;

            ctx.globalAlpha = opacity * 0.8;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.stroke();
        }

        ctx.restore();
    }

    clear() {
        this.points = [];
    }
}

/**
 * Glow effect
 */
export class GlowEffect extends Effect {
    constructor(x, y, radius, color = '#ffffff', pulseSpeed = 2) {
        super();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.pulseSpeed = pulseSpeed;
        this.pulsePhase = 0;
    }

    update(deltaTime, x, y) {
        super.update(deltaTime);
        this.x = x;
        this.y = y;
        this.pulsePhase += deltaTime * this.pulseSpeed * 0.001;
    }

    draw(ctx) {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        const currentRadius = this.radius * pulse;

        ctx.save();

        // Create radial gradient
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, currentRadius
        );

        gradient.addColorStop(0, this.color + 'aa');
        gradient.addColorStop(0.5, this.color + '44');
        gradient.addColorStop(1, this.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * Utility functions
 */
export const Utils = {
    /**
     * Generate random color
     */
    randomColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d',
            '#6bcf7f', '#a8e6cf', '#ff8b94', '#c7b3ff'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * Linear interpolation
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Distance between two points
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Random number in range
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Random integer in range
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

/**
 * Effect Manager
 * Manages and renders all active effects
 */
export class EffectManager {
    constructor() {
        this.effects = [];
        this.lastTime = performance.now();
    }

    addEffect(effect) {
        this.effects.push(effect);
    }

    update() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update all effects
        this.effects.forEach(effect => effect.update(deltaTime));

        // Remove dead effects
        this.effects = this.effects.filter(effect => !effect.isDead());
    }

    draw(ctx) {
        this.effects.forEach(effect => effect.draw(ctx));
    }

    clear() {
        this.effects = [];
    }

    getEffectCount() {
        return this.effects.length;
    }
}
