(function () {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const history = [];
  const paths = new Map();
  const keys = new Map();
  const removedPaths = [];
  const config = {
    fillStyle: "white",
    strokeStyle: "white",
    lineWidth: 1,
    lineCap: "round",
    lineJoin: "round"
  }
  const last = [];
  main();
  function main() {
    document.body.appendChild(canvas);
    resizeCanvas(innerWidth, innerHeight);
    ctx.strokeStyle = config.color;
    background("black");
  }
  function background(color) {
    document.body.style.background = color;
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
    // credit: https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
    // move to the first point
    ctx.moveTo(path[0], path[1]);

    let i;
    for (i = 2; i < path.length - 4; i += 2) {
      var xc = (path[i] + path[i + 2]) / 2;
      var yc = (path[i + 1] + path[i + 3]) / 2;
      ctx.quadraticCurveTo(path[i], path[i + 1], xc, yc);
    }
    // curve through the last two points
    ctx.quadraticCurveTo(path[i], path[i + 1], path[i + 2], path[i + 3]);

    ctx.stroke();
  }
  function connect(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  function quadratic(x1, y1, x2, y2, x3, y3) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2, x3, y3);
    ctx.stroke();
  }
  function drawHistory() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < history.length; i++) {
      strokePath(history[i]);
    }
  }
  window.onresize = () => resizeCanvas(innerWidth, innerHeight);
  window.onpointermove = (e) => {
    let path = paths.get(e.pointerId);
    if (!path) return;
    path.push(e.clientX, e.clientY);
    
    let xc = (path[path.length-4] + e.clientX) * 0.5;
    let yc = (path[path.length-3] + e.clientY) * 0.5;
    
    quadratic(last[0], last[1], path[path.length - 4], path[path.length - 3], xc, yc);
    
    last[0] = xc;
    last[1] = yc;
  };
  window.onpointerdown = (e) => {
    paths.forEach((path, id) => {
      saveAndRemovePath(id, path);
    })
    removedPaths.splice(0);
    last[0] = e.clientX;
    last[1] = e.clientY;
    paths.set(e.pointerId, [last[0], last[1]]);
  };
  window.onpointerup = (e) => {
    let path = paths.get(e.pointerId);
    if (path) path.push(e.clientX, e.clientY);
    saveAndRemovePath(e.pointerId, path);
  };
  window.onkeydown = (e) => {
    e.preventDefault();

    keys.set(e.code, true);
  }
  window.onkeyup = (e) => {
    executeCommand(keys);

    keys.delete(e.code);
  };
  function saveAndRemovePath(key, path) {
    if (path?.length > 2) {
      history.push(path);
      // connect to last point
      quadratic(last[0], last[1], path[path.length - 4], path[path.length - 3], path[path.length - 2], path[path.length - 1]);
    }
    paths.delete(key);
  }
  function executeCommand(keys) {
    if (keys.get('ControlLeft') && keys.get('KeyY')) {
      redo();
    } else if (keys.get('ControlLeft') && keys.get('KeyZ')) {
      undo();
    } else if (keys.get("Escape")) {
      clear();
    }
  }
  function undo() {
    let path = history.pop();
    if (!path) return;
    removedPaths.push(path);
    drawHistory();
  }
  function redo() {
    let path = removedPaths.pop();
    if (!path) return;
    history.push(path);
    strokePath(path);
  }
  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.splice(0);
    removedPaths.splice(0);
  }
})();