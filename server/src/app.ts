import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    maxAge: 86_400,
  })
);

app.get("/", (req, res) => {
  res.send("Pixel Arena Server is up and running!");
});

export default app;
