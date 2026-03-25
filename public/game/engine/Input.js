// Input handler for keyboard and mouse

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.keysJustPressed = {};
    this.keysJustReleased = {};
    this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, left: false, right: false, leftJustPressed: false, rightJustPressed: false };
    this._prevKeys = {};
    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundMouseMove = this._onMouseMove.bind(this);
    this._boundMouseDown = this._onMouseDown.bind(this);
    this._boundMouseUp = this._onMouseUp.bind(this);
    this._boundContextMenu = (e) => e.preventDefault();
  }

  init() {
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);
    this.canvas.addEventListener('mousemove', this._boundMouseMove);
    this.canvas.addEventListener('mousedown', this._boundMouseDown);
    this.canvas.addEventListener('mouseup', this._boundMouseUp);
    this.canvas.addEventListener('contextmenu', this._boundContextMenu);
  }

  destroy() {
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup', this._boundKeyUp);
    this.canvas.removeEventListener('mousemove', this._boundMouseMove);
    this.canvas.removeEventListener('mousedown', this._boundMouseDown);
    this.canvas.removeEventListener('mouseup', this._boundMouseUp);
    this.canvas.removeEventListener('contextmenu', this._boundContextMenu);
  }

  _onKeyDown(e) {
    if (e.target.tagName === 'INPUT') return;
    this.keys[e.code] = true;
    this.keys[e.key] = true;
  }

  _onKeyUp(e) {
    this.keys[e.code] = false;
    this.keys[e.key] = false;
  }

  _onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  _onMouseDown(e) {
    if (e.button === 0) { this.mouse.left = true; this.mouse.leftJustPressed = true; }
    if (e.button === 2) { this.mouse.right = true; this.mouse.rightJustPressed = true; }
  }

  _onMouseUp(e) {
    if (e.button === 0) this.mouse.left = false;
    if (e.button === 2) this.mouse.right = false;
  }

  update() {
    // Compute just-pressed / just-released each frame
    this.keysJustPressed = {};
    this.keysJustReleased = {};
    for (const k in this.keys) {
      if (this.keys[k] && !this._prevKeys[k]) this.keysJustPressed[k] = true;
      if (!this.keys[k] && this._prevKeys[k]) this.keysJustReleased[k] = true;
    }
    this._prevKeys = { ...this.keys };
    // Mouse just-pressed is reset after one frame of reading
    this.mouse.leftJustPressed = false;
    this.mouse.rightJustPressed = false;
  }

  isDown(code) { return !!this.keys[code]; }
  wasPressed(code) { return !!this.keysJustPressed[code]; }
  wasReleased(code) { return !!this.keysJustReleased[code]; }

  setCamera(camera) { this._camera = camera; }

  getWorldMouse() {
    if (!this._camera) return { x: this.mouse.x, y: this.mouse.y };
    return {
      x: this.mouse.x + this._camera.x,
      y: this.mouse.y + this._camera.y
    };
  }
}

export default Input;
