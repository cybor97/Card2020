document.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('canvas');
    canvas.setAttribute('width', canvas.clientWidth);
    canvas.setAttribute('height', canvas.clientHeight);
    let context = canvas.getContext('2d');
    context.fillRect(0, 0, canvas.width, canvas.height)

    let audio = document.getElementById('audio');
    let fileInput = document.getElementById('fileInput');
    let analyzer = null;
    let bufferLength = null;
    let audioDataArray = new Uint8Array();

    fileInput.addEventListener('change', (ev) => {
        let files = ev.target.files;
        audio.src = URL.createObjectURL(files[0]);
        audio.load();
        audio.play();

        let audioContext = new AudioContext();
        let src = audioContext.createMediaElementSource(audio);
        analyzer = audioContext.createAnalyser();

        src.connect(analyzer);
        analyzer.connect(audioContext.destination);
        analyzer.fftSize = 256;
        bufferLength = analyzer.frequencyBinCount;
        audioDataArray = new Uint8Array(bufferLength);

    });

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


    let padding = ~~(canvas.clientWidth / 20);
    console.log('padding', padding)
    let time = Date.now();
    function render(i = 0, offset = 0) {
        let xOffset = offset && offset !== 1 ? 1 : 0;
        let yOffset = offset && offset !== 2 ? 1 : 0;
        // console.log('offsets', xOffset, yOffset)

        // time = Date.now();
        let cWidth = canvas.width;
        let cHeight = canvas.height;

        setInterval(() => { if (analyzer) analyzer.getByteFrequencyData(audioDataArray) }, 50);

        for (let x = padding + xOffset; x < cWidth - padding; x += 2) {
            for (let y = padding + yOffset; y < cHeight - padding; y += 2) {
                let perlinX = x;
                let perlinY = y;
                let inSelectedRange = touched && Math.abs(mouseX - x) < 64 && Math.abs(mouseY - y) < 64;
                if (inSelectedRange) {
                    perlinX /= 3;
                    perlinY /= 3;
                }

                let tCoef = 1;
                if (analyzer) {
                    tCoef *= audioDataArray[~~(bufferLength * Math.abs(Math.sin(i)))] / 2560;
                }

                let value = perlin3(perlinX / 50, perlinY / 50, i * tCoef);

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
        // console.log('time1', Date.now() - time);
        // time = Date.now();

        context.putImageData(image, 0, 0);
        // console.log('time2', Date.now() - time);
        // time = Date.now();


        let textValue = i < 3 ? 64 * (4 - i) - 1 : 100;
        textValue = textValue.toString(16);
        context.fillStyle = `#${textValue}${textValue}${textValue}`;
        context.font = '64px verdana';
        context.fillText('2020 PoC 2', cWidth / 2 - 128, cHeight / 2 - 64);
        context.font = '32px verdana';
        context.fillText('Click and move at any place', cWidth / 2 - 156, cHeight / 2);

        if (offset < 3) {
            offset++;
        }
        else {
            offset = 0;
        }
        requestAnimationFrame(render.bind(this, i + 0.05, offset));

        // console.log('time3', Date.now() - time);
        // time = Date.now();

    }

    render();
});
