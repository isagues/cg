export class Keyboard {
    constructor(document) {
        this.handlers = {
            KeyA: {press: () => {}, release: () => {}},
            KeyW: {press: () => {}, release: () => {}},
            KeyS: {press: () => {}, release: () => {}},
            KeyD: {press: () => {}, release: () => {}},
            KeyQ: {press: () => {}, release: () => {}},
            KeyE: {press: () => {}, release: () => {}},
            KeyG: {press: () => {}, release: () => {}},
        };

        document.addEventListener('keydown', (event) => {
            const handler = this.handlers[event.code];
            if(handler && handler.press) {
                handler.press();
            }
          }, false);
        
        document.addEventListener("keypress", (event) => {
            // handle keypress
        }, false);
        
        document.addEventListener("keyup", (event) => {
            const handler = this.handlers[event.code];
            if(handler && handler.release) handler.release()
        }, false);
    }
}