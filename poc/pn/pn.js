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

    let playButton = document.getElementById('playButton');
    let schwiftyButton = document.getElementById('schwiftyButton');
    let padding = ~~(canvas.clientWidth / 20);
    let schwiftyMode = false;

    let player = document.getElementById('player');
    let playPauseButton = document.getElementById('playPauseButton');
    let playProgress = document.getElementById('playProgress');

    playButton.style.left = padding;
    playButton.style.top = padding;

    schwiftyButton.style.left = padding * 2 + playButton.clientWidth;
    schwiftyButton.style.top = padding;

    player.style.top = padding * 2;
    player.style.left = padding;

    playButton.addEventListener('click', () => fileInput.click());
    schwiftyButton.addEventListener('click', () => {
        schwiftyButton.className = (schwiftyMode = !schwiftyMode) ? 'red' : '';
    });

    audio.addEventListener('play', () => {
        player.style.display = 'flex';
        playPauseButton.innerText = '>';
    });
    audio.addEventListener('pause', () => {
        playPauseButton.innerText = '||';
    });

    player.addEventListener('click', (ev) => {
        audio.currentTime = ~~(audio.duration * (ev.offsetX - playPauseButton.clientWidth - 5) / ev.target.clientWidth);
        console.log(ev.offsetX, ev.target.clientWidth)
    });

    playPauseButton.addEventListener('click', (ev) => {
        if (audio.paused) {
            audio.play();
        }
        else {
            audio.pause();
        }
        ev.stopPropagation();
    });

    fileInput.addEventListener('change', (ev) => {
        let files = ev.target.files;
        audio.src = URL.createObjectURL(files[0]);
        audio.load();
        audio.play();

        if (!analyzer) {
            let audioContext = new AudioContext();
            let src = audioContext.createMediaElementSource(audio);
            analyzer = audioContext.createAnalyser();

            src.connect(analyzer);
            analyzer.connect(audioContext.destination);
            analyzer.fftSize = 256;
            bufferLength = analyzer.frequencyBinCount;
            audioDataArray = new Uint8Array(bufferLength);
        }

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

    console.log('padding', padding)
    let soundCoef = 0.05;

    setInterval(() => {
        if (analyzer) analyzer.getByteFrequencyData(audioDataArray);
        playProgress.style.width = 150 * audio.currentTime / audio.duration;
    }, 50);


    function render(i = 0, offset = 0) {
        let xOffset = offset && offset !== 1 ? 1 : 0;
        let yOffset = offset && offset !== 2 ? 1 : 0;

        // time = Date.now();
        let cWidth = canvas.width;
        let cHeight = canvas.height;


        for (let x = padding + xOffset; x < cWidth - padding; x += 2) {
            for (let y = padding + yOffset; y < cHeight - padding; y += 2) {
                let perlinX = x;
                let perlinY = y;
                if (schwiftyMode) {
                    let schwiftyCoef = (soundCoef || 0.05) * 10;
                    perlinX *= schwiftyCoef;
                    perlinY *= schwiftyCoef;
                }

                let inSelectedRange = touched && Math.abs(mouseX - x) < 64 && Math.abs(mouseY - y) < 64;
                if (inSelectedRange) {
                    perlinX /= 3;
                    perlinY /= 3;
                }


                let value = perlin3(perlinX / 50, perlinY / 50, i);

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

        if (offset < 3) {
            offset++;
        }
        else {
            offset = 0;
        }
        if (analyzer) {
            let soundCoefNew = Math.abs(Math.sin(audioDataArray[~~(bufferLength * Math.abs(Math.cos(i)))])) / 15;
            if (soundCoefNew) {
                soundCoef = soundCoefNew;
            }
            i += soundCoef;
        }
        requestAnimationFrame(render.bind(this, i + 0.05, offset));
    }

    render();
});
