document.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('canvas');
    canvas.setAttribute('width', canvas.clientWidth);
    canvas.setAttribute('height', canvas.clientHeight);
    let context = canvas.getContext('2d');
    context.fillRect(0, 0, canvas.width, canvas.height)

    let image = context.createImageData(canvas.width, canvas.height);
    let data = image.data;

    for (let i = 0; i < data.length; i += 4) {
        for (let j = 0; j <= 2; j++) {
            data[i + j] = 0;
        }
        data[i + 3] = 255;
    }

    let touched = false;
    let mouseX = null, mouseY = null;
    canvas.addEventListener('mousedown', (ev) => {
        touched = true;
        mouseX = ev.clientX;
        mouseY = ev.clientY;
    });
    canvas.addEventListener('mousemove', (ev) => {
        mouseX = ev.clientX;
        mouseY = ev.clientY;
    });
    canvas.addEventListener('mouseup', () => {
        touched = false;
    });


    let padding = 100;

    function render(i = 0) {
        let cWidth = canvas.width;
        let cHeight = canvas.height;

        for (let x = padding; x < cWidth - padding; x++) {
            for (let y = padding; y < cHeight - padding; y++) {
                let perlinX = x;
                let perlinY = y;
                let inSelectedRange = touched && Math.abs(mouseX - x) < 64 && Math.abs(mouseY - y) < 64;
                if (inSelectedRange) {
                    perlinX /= 3;
                    perlinY /= 3;
                }
                let value = noise.perlin3(perlinX / 50, perlinY / 50, i);
                value = (1 + value) * 1.1 * 128;

                let cell = (x + y * cWidth) * 4;
                //rgba
                data[cell] = data[cell + 1] = data[cell + 2] = data[cell + 3] = value >= 128 ? value : value + 127;
                if (inSelectedRange) {
                    data[cell + 0] /= 2;
                    data[cell + 2] /= 2;
                }

            }
        }

        context.putImageData(image, 0, 0);

        let textValue = i < 3 ? 64 * (4 - i) - 1 : 100;
        textValue = textValue.toString(16);
        context.fillStyle = `#${textValue}${textValue}${textValue}`;
        context.font = '64px verdana';
        context.fillText('2020 PoC 2', cWidth / 2 - 128, cHeight / 2 - 64);
        context.font = '32px verdana';
        context.fillText('Click and move at any place', cWidth / 2 - 156, cHeight / 2);

        requestAnimationFrame(render.bind(this, i + 0.05));
    }

    render();
});
