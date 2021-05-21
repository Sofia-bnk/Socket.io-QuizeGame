const express = require("express");
const app = express();
const shuffle = require("shuffle-array");
const path = require("path");
const axios = require("axios");
const http = require("http");
const httpServer = http.createServer(app);

const io = require("socket.io")(httpServer);

app.use(express.static(path.join(__dirname, "/public")));

let player = undefined;
let questions = undefined;
let index = 0;

io.on("connect", (socket) => {
  console.log(`A client with id ${socket.id} connected!`);

  function givePoints() {
    io.emit("points", {
      correct,
      incorrect,
    });
    correct = 0;
    incorrect = 0;
  }

  function sendNextQuestion() {
    if (index <= 4) {
      io.in("playerRoom").emit("messageP", {
        question: `Question ${index + 1}: ${questions[index].question}`,
        answers: questions[index].answers,
      });
      io.in("viewerRoom").emit("messageV", {
        question: `Question ${index + 1}: ${questions[index].question}`,
      });
    } else {
      givePoints();
    }
  }

  if (player === undefined) {
    socket.join("playerRoom");
    socket.emit("player", "You are the player!");
    io.in("viewerRoom").emit("con", "player connected!");
    player = socket.id;
    Question().then((res) => {
      questions = res;
      sendNextQuestion();
    });
  } else {
    socket.join("viewerRoom");
    socket.emit("player", "player is connected!");
    if (questions) {
      io.to(socket.id).emit("messageV", {
        question: `Question ${index + 1}: ${questions[index].question}`,
      });
    }
  }
  if (player == !undefined) {
    io.in("viewerRoom").emit("con", "player connected!");
  }
  async function Question() {
    try {
      const response = await axios.get(
        "https://opentdb.com/api.php?amount=5&type=multiple"
      );
      let questions = [];

      response.data.results.forEach((obj) => {
        let answers = [];
        let question = obj.question;
        let correctAnswer = obj.correct_answer;
        answers.push(correctAnswer);
        obj.incorrect_answers.forEach((e) => {
          answers.push(e);
        });
        shuffle(answers);

        questions.push({
          question,
          answers,
          correctAnswer,
        });
      });
      return questions;
    } catch (error) {
      console.log(error);
    }
  }

  let correct = 0;
  let incorrect = 0;

  socket.on("answer", (ans) => {
    if (ans === questions[index].correctAnswer) {
      socket.to("viewerRoom").emit("correctedAns", `${ans}(correct)`);
      correct++;
      index++;
      sendNextQuestion();
    } else {
      socket.to("viewerRoom").emit("correctedAns", `${ans}(incorrect)`);
      incorrect++;
      index++;
      sendNextQuestion();
    }
    if (index === 5) {
      io.in("playerRoom").emit("end", "Finished!");
      player = undefined;
      ChangingPlayer();
    }
  });

  function ChangingPlayer() {
    player = undefined;
    socket.leave("playerRoom");
    socket.to("viewerRoom").emit("dis", "Player disconnected");
    index = 0;
  }

  socket.on("disconnect", () => {
    console.log(`A client with id ${socket.id} diconnected!`);

    if (player === socket.id) {
      ChangingPlayer();
    }
  });
});

httpServer.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
