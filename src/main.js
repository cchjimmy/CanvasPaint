(function () {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const history = [];
  const paths = new Map();
  const keys = new Map();
  const removedPaths = [];
  const commandQueue = [];
  const config = {
    fillStyle: "black",
    strokeStyle: "white",
    lineWidth: 5,
    lineCap: "round",
    lineJoin: "round"
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
    for (prop in config) {
      ctx[prop] = config[prop];
    }
    drawHistory();
  }
  function strokePath(path) {
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
    paths.forEach((path, pointerId) => {
      if (e.pointerId != pointerId) return;
      if (path.length) {
        line(path[path.length - 2], path[path.length - 1], e.clientX, e.clientY);
      }
      path.push(e.clientX, e.clientY);
    });
  };
  window.onpointerdown = (e) => {
    paths.set(e.pointerId, []);
    removedPaths.splice(0);
  };
  window.onpointerup = (e) => {
    let path = paths.get(e.pointerId);
    if (path.length) {
      history.push(path);
    }
    paths.delete(e.pointerId);
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

    if (keys.get('ControlLeft') && keys.get('KeyY')) {
      command = redo;
    } else if (keys.get('ControlLeft') && keys.get('KeyZ')) {
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
  }
})();