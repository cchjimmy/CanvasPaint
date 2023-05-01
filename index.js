const express = require("express");
const app = express();
const PORT = 8000;
const HOST = "127.0.0.1";
app.use(express.static("./"));
app.listen(PORT, HOST, ()=>console.log(`Server now listening at http://${HOST}:${PORT}`));