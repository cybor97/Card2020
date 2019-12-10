document.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('canvas');
    canvas.setAttribute('width', canvas.clientWidth);
    canvas.setAttribute('height', canvas.clientHeight);
    let context = canvas.getContext('2d');
    let snowflakesCount = 50;
    let snowflakes = new Set();
    let time = Date.now();

    let render = function () {
        let now = Date.now();
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.strokeStyle = '#FFF';

        while (snowflakes.size < snowflakesCount) {
            let rX = Math.random() * canvas.width;
            let rMode = ~~(Math.random() * 4) || 1;
            let rVelocity = Math.random() * 300;
            if (rVelocity < 80) {
                rVelocity += 80;
            }
            let rDirection = ~~(Math.random() * 2) ? 1 : -1;

            snowflakes.add(new Snowflake(context, rX, 0, rMode * 10, rVelocity, rDirection, rMode, rMode));
        }
        if ((now - time) > 50) {
            let dt = (now - time) / 1000;
            for (let snowflake of snowflakes) {
                if (snowflake.y > canvas.height || snowflake.x > canvas.width || snowflake.x < 0) {
                    snowflakes.delete(snowflake);
                }
                snowflake.y += snowflake.velocity * dt;
                snowflake.x += snowflake.velocity * dt * snowflake.direction / 2;
                time = now;
            }
        }
        for (let snowflake of snowflakes) {
            snowflake.render();
        }


        requestAnimationFrame(render);
    }
    render();
});

class BaseSnowflake {
    constructor(context, x, y, size, velocity, direction) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.size = size;
        this.velocity = velocity;
        this.direction = direction;
    }
}

class Snowflake extends BaseSnowflake {
    constructor(context, x, y, size, velocity, direction, maxDepth = 3, cuteness = 2) {
        super(context, x, y, size, velocity, direction);
        this.maxDepth = maxDepth;
        this.cuteness = cuteness;
    }

    render(params) {
        let context = this.context;
        let { x, y, size, maxDepth, depth, cuteness } = params || {};
        if (!x) {
            x = this.x;
        }
        if (!y) {
            y = this.y;
        }
        if (!size) {
            size = this.size;
        }
        if (!maxDepth) {
            maxDepth = this.maxDepth;
        }
        if (!cuteness) {
            cuteness = this.cuteness;
        }
        if (!depth) {
            depth = this.depth || 0;
        }

        if (depth < maxDepth) {
            context.beginPath();
            context.moveTo(x, y + size / 2);
            context.lineTo(x + size, y + (size / 2));

            context.moveTo(x + size / 2, y);
            context.lineTo(x + size / 2, y + size);

            if (depth < cuteness) {
                context.moveTo(x, y);
                context.lineTo(x + size / 2, y + size / 2);
                context.lineTo(x + size, y);

                context.moveTo(x + size / 2, y + size / 2);
                context.lineTo(x + size, y + size);

                context.moveTo(x + size / 2, y + size / 2);
                context.lineTo(x, y + size);
            }

            context.stroke();

            let reduceCoef = 3;
            let innerSize = size / reduceCoef;
            let commonParams = { maxDepth: maxDepth, depth: depth + 1, cuteness: cuteness };

            this.render({ x: x + innerSize, y: y - innerSize, size: innerSize, ...commonParams });
            this.render({ x: x - innerSize, y: y + innerSize, size: innerSize, ...commonParams });
            this.render({ x: x + innerSize * reduceCoef, y: y + innerSize, size: innerSize, ...commonParams });
            this.render({ x: x + innerSize, y: y + innerSize * reduceCoef, size: innerSize, ...commonParams });

            if (depth < cuteness) {
                let offsetCoef = 0.25;

                this.render({ x: x + size * (1 - offsetCoef), y: y - innerSize * offsetCoef, size: innerSize, ...commonParams });
                this.render({ x: x - innerSize * offsetCoef, y: y - innerSize * offsetCoef, size: innerSize, ...commonParams });
                this.render({ x: x - innerSize * offsetCoef, y: y + size * (1 - offsetCoef), size: innerSize, ...commonParams });
                this.render({ x: x + size * (1 - offsetCoef), y: y + size * (1 - offsetCoef), size: innerSize, ...commonParams });
                this.render({ x: x + innerSize, y: y + innerSize, size: innerSize, ...commonParams });
            }
        }
    }
}