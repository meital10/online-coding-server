const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const PORT = process.env.PORT || 4000;
const http = require("http").Server(app);
const cors = require("cors");
const CodeBlock = require("./codeBlockSchema");

app.use(cors());

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "https://coding-online.onrender.com",
  },
});

dotenv.config();

// connet to mongodb
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("db is connected");
  });

let mentorSocketId = null;

// get all blockcodes names from DB and pass it to the client through socket- to lobby page
socketIO.on("connection", (socket) => {
  console.log(` ${socket.id} user just connected!`);
  CodeBlock.find().then((result) => {
    socket.emit("output-codes-names", result);
  });

  // get one blockcode from DB and pass it to the client through socket - to codeblock page
  socket.on("get-chosen-code", (id) => {
    CodeBlock.findById({ _id: mongoose.Types.ObjectId(id) }).then((result) => {
      // check if the mentor is the first every refresh
      const data = { result };
      if (!mentorSocketId) {
        mentorSocketId = socket.id;
        data.userType = "mentor";
      } else {
        data.userType = mentorSocketId === socket.id ? "mentor" : "student";
      }
      socket.emit("response-chosen-code", data);
    });
  });

  socket.on("editCodeBlock", (data) => {
    socket.broadcast.emit("editCodeBlock-response", data);
  });

  socket.on("disconnect", () => {
    console.log(" A user disconnected");
    if (mentorSocketId === socket.id) {
      mentorSocketId = null;
    }
    socket.disconnect();
  });
});

socketIO.on("errorConnection", (err) => {
  console.log(`Error Conection: ${err.message}`);
});

process.on("uncaughtException", (err, origin) => {
  console.log(err);
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
