(function () {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const history = [];
  const path = [];
  const keys = new Map();
  const removedPaths = [];
  const commandQueue = [];
  var pointerDown = false;
  const config = {
    background: "black",
    color: "white",
    ctx: {
      lineWidth: 5,
      lineCap: "round",
      lineJoin: "round"
    }
  }
  main();
  function main() {
    document.body.appendChild(canvas);
    resizeCanvas(innerWidth, innerHeight);
    ctx.strokeStyle = config.color;
    background();
    update();
  }
  function update() {
    executeCommands();
    requestAnimationFrame(update);
  }
  function background() {
    ctx.fillStyle = config.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  function resizeCanvas(w, h) {
    canvas.width = w;
    canvas.height = h;
    for (prop in config.ctx) {
      ctx[prop] = config.ctx[prop];
      console.log(ctx[prop]);
    }
  }
  function strokePath(path) {
    if (!path) return;
    ctx.beginPath();

    ctx.moveTo(path[0], path[1]);
    for (let i = 2; i < path.length; i += 2) {
      ctx.lineTo(path[i], path[i + 1]);
    }

    ctx.stroke();
  }
  function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  function drawHistory() {
    background();
    for (let i = 0; i < history.length; i++) {
      strokePath(history[i]);
    }
  }
  window.onresize = () => resizeCanvas(innerWidth, innerHeight);
  window.onpointermove = (e) => {
    if (pointerDown) {
      if (path.length) {
        line(path[path.length - 2], path[path.length - 1], e.clientX, e.clientY);
      }
      path.push(e.clientX, e.clientY)
    };
  };
  window.onpointerdown = () => pointerDown = true;
  window.onpointerup = () => {
    if (path.length) {
      history.push(path.slice());
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
    drawHistory();
  }
  function redo() {
    let path = removedPaths.pop();
    if (path) history.push(path);
    drawHistory();
  }
  function clear() {
    background();
    history.splice(0);
    removedPaths.splice(0);
    path.splice(0);
  }
})();