class IScene extends IElement {
    constructor(onEnd) {
        if (typeof (onEnd) !== 'function') {
            throw new Error('onEnd should be function!');
        }

        this.onEnd = onEnd;
    }
}