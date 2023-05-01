(function () {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const history = [];
  const path = [];
  const pos = { x: 0, y: 0 };
  const keys = new Map();
  const removedPaths = [];
  const commandQueue = [];
  var pointerDown = false;
  main();
  function main() {
    document.body.appendChild(canvas);
    resizeCanvas(innerWidth, innerHeight);
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    update();
  }
  function update() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "white";

    for (let i = 0; i < history.length; i++) {
      strokePath(history[i]);
    }

    strokePath(path);

    executeCommands();
    requestAnimationFrame(update);
  }
  function resizeCanvas(w, h) {
    canvas.width = w;
    canvas.height = h;
  }
  function strokePath(path) {
    if (!path || !path.length) return;
    ctx.beginPath();

    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 0; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }

    ctx.stroke();
  }
  window.onresize = () => resizeCanvas(innerWidth, innerHeight);
  window.onpointermove = (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    if (pointerDown) path.push({ x: pos.x, y: pos.y });
  };
  window.onpointerdown = () => pointerDown = true;
  window.onpointerup = () => {
    if (path.length) {
      history.push(path.slice(0));
      path.splice(0);
    }
    pointerDown = false;
  };
  window.onkeydown = (e) => {
    e.preventDefault();

    keys.set(e.code, true);
  }
  window.onkeyup = (e) => {
    pushCommands(keys);

    keys.delete(e.code);
  };
  function pushCommands(keys) {
    let command;

    if (keys.get('MetaLeft') && keys.get('KeyZ') && keys.get('ShiftLeft')) {
      command = redo;
    } else if (keys.get('MetaLeft') && keys.get('KeyZ')) {
      command = undo;
    } else if (keys.get("Escape")) {
      command = clear;
    }
    if (command) commandQueue.push(command);
  }
  function executeCommands() {
    for (let i = 0; i < commandQueue.length; i++) {
      commandQueue[i]();
    }
    commandQueue.splice(0);
  }
  function undo() {
    let path = history.pop();
    if (path) removedPaths.push(path);
  }
  function redo() {
    let path = removedPaths.pop();
    if (path) history.push(path);
  }
  function clear() {
    history.splice(0);
    removedPaths.splice(0);
    path.splice(0);
  }
})();