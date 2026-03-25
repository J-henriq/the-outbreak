// ─────────────────────────────────────────────────────────
//  ASHENWILD  –  Input Handler
// ─────────────────────────────────────────────────────────

const Input = (() => {
  const keys  = {};
  const mouse = { x: 0, y: 0, down: false, clicked: false };

  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    keys[e.key]  = true;
  });
  window.addEventListener('keyup', e => {
    keys[e.code] = false;
    keys[e.key]  = false;
  });

  // Mouse – tracked relative to canvas
  let canvas = null;
  function attachCanvas(c) {
    canvas = c;
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) { mouse.down = true; mouse.clicked = true; }
    });
    canvas.addEventListener('mouseup', e => {
      if (e.button === 0) mouse.down = false;
    });
  }

  function consumeClick() {
    const c = mouse.clicked;
    mouse.clicked = false;
    return c;
  }

  function isDown(k)  { return !!keys[k]; }
  function isMoveUp()    { return isDown('ArrowUp')    || isDown('KeyW'); }
  function isMoveDown()  { return isDown('ArrowDown')  || isDown('KeyS'); }
  function isMoveLeft()  { return isDown('ArrowLeft')  || isDown('KeyA'); }
  function isMoveRight() { return isDown('ArrowRight') || isDown('KeyD'); }

  return { attachCanvas, isDown, consumeClick, isMoveUp, isMoveDown, isMoveLeft, isMoveRight, mouse };
})();
