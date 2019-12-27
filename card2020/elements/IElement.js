class IElement {
    constructor() {
        this.timeAppear = 0;
        this.timeUpdate = 0;
        this.timeRender = 0;
        this.timeDestroy = 0;
        this.renderer = null;
    }

    onAppear() {
        throw new Error('Unimplemented');
    }

    onUpdate(dt) {
        throw new Error('Unimplemented');
    }

    onRender(dt) {
        throw new Error('Unimplemented');
    }

    onDestroy() {
        throw new Error('Unimplemented');
    }
}