class Canvas2DRenderer extends IRenderer {
    render(...figures) {
        for (let figure of figures) {
            switch (figure.type) {
                case 'rectangle':
                    if (figure.data.clear) {
                        return this.context.clearRect(figure.x, figure.y, figure.w, figure.h);
                    }
                    if (figure.data.fill) {
                        return this.context.fillRect(figure.x, figure.y, figure.w, figure.h);
                    }
                    return this.context.strokeRect(figure.x, figure.y, figure.w, figure.h);
                case 'image':
                    return this.context.drawImage(figure.data, figure.data.sx, figure.data.sy, figure.data.sw, figure.data.sh, figure.x, figure.y, figure.w, figure.h);
                case 'svg':
                    return this.context.stroke(figure.data);
                case 'particleSystem':
                    let image = this.context.createImageData(figure.w, figure.h);
                    let imageData = image.data;

                    for (let x = 0; x < figure.w; x++) {
                        for (let y = 0; y < figure.y; y++) {
                            let cell = (x + y * figure.w) * 4;
                            data[cell + 0] = 0;
                            data[cell + 1] = 0;
                            data[cell + 2] = 0;
                            data[cell + 3] = 0;
                        }
                    }

                    for (let particle of figure.data.particles) {
                        let [x, y, r, g, b, a] = particle;
                        let cell = (x + y * figure.w) * 4;
                        data[cell + 0] = r;
                        data[cell + 1] = g;
                        data[cell + 2] = b;
                        data[cell + 3] = a || 255;
                    }
                    this.context.putImageData(imageData, figure.x, figure.y);
                    break;
                default:
                    console.log('Canvas2DRenderer.render type unsupported');
                    break;
            }
        }
    }
}