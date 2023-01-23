import exprees from "express";
import dotenv from "dotenv";
import Userrouter from "./Router/UserRoutes.js";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import server from "http";
import { Server } from "socket.io";
import { ACTIONS } from "./actions.js";

const app = exprees();
const s = server.createServer(app);

const io = new Server(s, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

mongoose.set("strictQuery", false);
dotenv.config();
app.use(cookieParser());
app.use(exprees.json({ limit: "8mb" }));
const corHttp = {
  credentials: true,
  origin: ["http://localhost:3000"],
};
app.use(cors(corHttp));
app.use("/storage", exprees.static("storage")); // give image if any wants to see

const port = process.env.PORT || 8000;
const url = process.env.URL;

// Api
app.use(Userrouter);

mongoose
  .connect(url)
  .then(() => console.log("connected to database"))
  .catch("Unable to connect database");

// socket connection

const socketuserMaping = {};
io.on("connection", (socket) => {
  console.log("We are live and connected");
  console.log(socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
    socketuserMaping[socket.id] = user;

    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.ADD_PEER, {
        peerId: socket.id,
        createOffer: false,
        user,
      });
      socket.emit(ACTIONS.ADD_PEER, {
        peerId: clientId,
        createOffer: true,
        user: socketuserMaping[clientId],
      });
    });
    socket.join(roomId);
  });
  // handle relay ice
  socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
    io.to(peerId).emit(ACTIONS.RELAY_ICE, {
      peerId: socket.id,
      icecandidate,
    });
  });

  // Relay sdp
  socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
    io.to(peerId).emit(ACTIONS.RELAY_SDP, {
      peerId: socket.id,
      sessionDescription,
    });
  });

  // mute unmute
  socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((client) => {
      io.to(client).emit(ACTIONS.MUTE, {
        peerId: socket.id,
        userId,
      });
    });
  });

  socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((client) => {
      io.to(client).emit(ACTIONS.UNMUTE, {
        peerId: socket.id,
        userId,
      });
    });
  });
  // leaving room
  const LeaveRoom = ({ roomId }) => {
    const { rooms } = socket;

    Array.from(rooms).forEach((roomId) => {
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      clients.forEach((clientId) => {
        io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
          peerId: socket.id,
          UserId:
            socketuserMaping[socket.id]
              ?.id /*"?" this help if value is undefine then dont go to next opt new in js  */,
        });
        socket.emit(ACTIONS.REMOVE_PEER, {
          peerId: clientId,
          UserId: socketuserMaping[clientId]?.id,
        });
      });
      socket.leave(roomId);
    });
    delete socketuserMaping[socket.id];
  };
  socket.on(ACTIONS.LEAVE, LeaveRoom);
  socket.on("disconnecting", LeaveRoom);
});

s.listen(port, () => console.log(`listening at port ${port}`));
