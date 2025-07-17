import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app";
import { initializeSockets } from "@sockets/index";

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.get("/health", (req: any, res: any) => {
  res.status(200).send("OK");
});

initializeSockets(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
