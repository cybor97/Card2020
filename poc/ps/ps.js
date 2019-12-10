document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    canvas.setAttribute('width', document.body.clientWidth);
    canvas.setAttribute('height', document.body.clientHeight);

    let context = canvas.getContext('2d');

    const CENTER_SIZE = 10;
    const CENTER_X = canvas.width / 2 - CENTER_SIZE / 2;
    const CENTER_Y = canvas.height / 2 - CENTER_SIZE / 2;

    let ps = new ParticleSystem(context)
        .initParticles(canvas.width * canvas.height / 200)
        .initLocations(CENTER_X, CENTER_Y, CENTER_SIZE, CENTER_SIZE);

    canvas.addEventListener('click', ev => ps.enableAll()
        .initColor()
        .initLocations(ev.clientX, ev.clientY, CENTER_SIZE, CENTER_SIZE));

    let text2020 = new TextFigure(context, { x: CENTER_X - 128, y: CENTER_Y }, '64px', 'verdana', '2020 PoC 1');
    let textNotify = new TextFigure(context, { x: CENTER_X - 128, y: CENTER_Y + 64 }, '32pt', 'verdana', 'Click at any place');

    let ps2 = new ParticleSystem(context, { x: 0, y: 0 })
        .initParticles(10000)
        .initLocations(0, 0, CENTER_SIZE, CENTER_SIZE);

    let ps3 = new ParticleSystem(context, { x: 0, y: 0 })
        .initParticles(10000)
        .initLocations(canvas.width - CENTER_SIZE, 0, CENTER_SIZE, CENTER_SIZE);

    let ps4 = new ParticleSystem(context, { x: 0, y: 0 })
        .initParticles(10000)
        .initLocations(0, canvas.height - CENTER_SIZE, CENTER_SIZE, CENTER_SIZE);

    let ps5 = new ParticleSystem(context, { x: 0, y: 0 })
        .initParticles(10000)
        .initLocations(canvas.width - CENTER_SIZE, canvas.height - CENTER_SIZE, CENTER_SIZE, CENTER_SIZE);

    let scene = new Scene(context, ps, ps2, ps3, ps4, ps5, text2020, textNotify);
    (this.render = () => requestAnimationFrame(() => {
        scene.update();
        scene.render();
        this.render()
    }))();
});

class BaseFigure {
    constructor(context) {
        this.context = context;
        this.INITIAL_COLOR = [0xf, 0xf, 0x8];
        this.enabled = true;
    }
}

class Scene extends BaseFigure {
    constructor(context, ...items) {
        super(context);
        this.items = new Set(items);
        this.lastUpdate = null;
        this.falseUpdates = 0;
    }

    update() {
        let time = Date.now();
        if (!this.lastUpdate || (time - this.lastUpdate > 30)) {
            for (let item of this.items) {
                if (item.enabled && item.update) {
                    item.update();
                }
            }
            this.falseUpdates = 0;
            this.lastUpdate = time;
            return;
        }
        this.falseUpdates++;
        // console.log('FUPS', this.falseUpdates / (time - this.lastUpdate) * 1000)
    }

    render() {
        let context = this.context;
        context.fillStyle = '#000';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        for (let item of this.items) {
            if (item.enabled) {
                item.render();
            }
        }
    }
}

class Particle extends BaseFigure {
    constructor(context, location, size, angle, velocity, initialColor) {
        super(context);

        let rAngle = null;
        let rVelocity = null;
        let rSize = null;
        if (!angle) {
            rAngle = Math.random();
        }
        if (!velocity) {
            rVelocity = Math.random();
        }
        if (!size) {
            rSize = Math.random();
        }

        this.location = location || { x: null, y: null };
        this.color = initialColor || this.INITIAL_COLOR;
        this.velocity = velocity || { x: rVelocity * 10, y: rVelocity * 10 };
        this.size = size || { width: ~~(rSize * 3), height: ~~(rSize * 3) };
        this.angle = angle || rAngle * Math.PI * 2;

        this.enabled = true;
        this.reachBorder = false;
    }

    update() {
        let [r, g, b] = this.color;
        let enabled = this.location.x > 0 && this.location.y > 0 && this.location.x < this.context.canvas.width && this.location.y < this.context.canvas.height && (r || g || b);
        this.enabled = enabled;
        this.reachBorder = !enabled;

        this.location.x += this.velocity.x * Math.cos(this.angle);
        this.location.y += this.velocity.y * Math.sin(this.angle);

        if (b === 0 && g === 0) {
            r = r > 0 ? r - 0.03 : 0;
        }
        else {
            g = g > 0 ? g - 1 : 0;
            b = b > 0 ? b - 1 : 0;
        }
        this.color = [r, g, b];
    }

    render() {
        let [r, g, b] = this.color;

        this.context.fillStyle = `#${(~~r).toString(16)}${g.toString(16)}${b.toString(16)}`;

        this.context.fillRect(this.location.x, this.location.y, this.size.width, this.size.height);
    }
}

class ParticleSystem extends BaseFigure {
    constructor(context, location, particles = []) {
        super(context);
        if (!(particles instanceof Array) && !(particles instanceof Set) || particles.find(c => !(c instanceof Particle))) {
            throw new Error('Particles should be array or Set of Particle');
        }

        this.initialColor = this.INITIAL_COLOR;
        this.location = location;
        this.particles = new Set(particles || []);
    }

    initLocations(centerX, centerY, width, height) {
        if (centerX === undefined) {
            centerX = Math.random() * canvas.clientWidth;
        }
        if (centerY === undefined) {
            centerY = Math.random() * canvas.clientHeight;
        }
        for (let particle of this.particles) {
            let rLocation = Math.random();
            particle.location = {
                x: centerX + (width * rLocation * Math.cos(particle.angle)),
                y: centerY + (height * rLocation * Math.sin(particle.angle))
            };
        }
        return this;
    }

    initColor(color) {
        if (color) {
            this.initialColor = color;
        }

        for (let particle of this.particles) {
            particle.color = this.initialColor || this.INITIAL_COLOR;
        }
        return this;
    }

    initParticles(count) {
        for (let i = 0; i < count; i++) {
            this.particles.add(new Particle(this.context));
        }
        return this;
    }

    enableAll() {
        for (let particle of this.particles) {
            particle.enabled = true;
        }
        return this;
    }

    update() {
        for (let particle of this.particles) {
            if (particle.enabled) {
                particle.update();
            }
        }
    }

    render() {
        for (let particle of this.particles) {
            if (particle.enabled) {
                particle.render();
            }
        }
    }
}

class TextFigure extends BaseFigure {
    constructor(context, location, fontSize, fontFamily, text, color) {
        super(context);
        this.location = location;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.text = text;
        this.color = color || this.INITIAL_COLOR;
    }

    render() {
        let context = this.context;
        context.fillStyle = this.color;
        context.font = `${this.fontSize} ${this.fontFamily}`;
        context.fillText(this.text, this.location.x, this.location.y);
    }
}


