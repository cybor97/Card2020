class IRenderer {
    constructor(context, ups = 30, fps = 30) {
        this.ups = ups;
        this.fps = fps;
        this.context = context;
        this.elements = new Set();
        this.initTime = Date.now();
    }

    init() {
        this.doWork();
    }

    doWork(lastUpdate = 0) {
        requestAnimationFrame(() => {
            let time = Date.now();

            if (time - lastUpdate > 1000 / this.ups) {
                this.doUpdate(time - this.initTime);
            }
            if (time - lastUpdate > 1000 / this.fps) {
                this.doRender(time - this.initTime);
            }

            requestAnimationFrame(this.doWork.bind(this, lastUpdate));
        });
    }

    addElement(element) {
        if (!(element instanceof IElement)) {
            throw new Error('element must be instance of IElement!');
        }

        element.onAppear();
        this.elements.add(element);
        element.renderer = this;
    }

    removeElement(element) {
        if (!(element instanceof IElement)) {
            throw new Error('element must be instance of IElement!');
        }

        element.onDestroy();
        element.renderer = null;
        this.elements.delete(element);
    }

    doUpdate(dt) {
        for (let element of this.elements) {
            element.onUpdate(dt);
        }
    }

    doRender(dt) {
        for (let element of this.elements) {
            element.onRender(dt);
        }
    }

    render(...figures) {
        throw new Error('Unimplemented');
    }
}