import express from "express";
const app = express();
app.get("/ping", (req, res) => res.send("pong"));
app.listen(3000, "0.0.0.0", () => console.log("Test server listening on 3000"));
