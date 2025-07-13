

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Pixel Arena Server is up and running!");
});

export default app;