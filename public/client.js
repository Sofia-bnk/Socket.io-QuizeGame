const socket = io();

socket.on("messageV", (response) => {
  const h = document.createElement("h2");
  document.getElementById("questions").appendChild(h);
  h.textContent = response.question;
});

socket.on("messageP", (response) => {
  document.getElementById("question").textContent = response.question;
  document.getElementById("questions").innerHTML = "";
  response.answers.forEach((answer) => {
    const btn = document.createElement("button");
    document.getElementById("questions").appendChild(btn);
    btn.innerHTML = answer;
    btn.class = "btn";
    btn.type = "submit";
    btn.style = "margin:5px";
    btn.onclick = function answer() {
      socket.emit("answer", btn.innerHTML);
    };
  });
});

socket.on("correctedAns", (ans) => {
  const span = document.createElement("span");
  document.getElementById("questions").appendChild(span);
  span.textContent = `Player answered: ${ans}`;
});

socket.on("player", (msg) => {
  document.getElementById("player").textContent = msg;
});
socket.on("points", (res) => {
  document.getElementById(
    "point"
  ).innerHTML = `Correct answers: ${res.correct} <br/>
                                                Incorrect answers: ${res.incorrect}`;
});

socket.on("dis", (res) => {
  document.getElementById("questions").innerHTML = "";
  document.getElementById("player").textContent = res;
});
socket.on("finalMsg", (res) => {
  document.getElementById("questions").innerHTML = res;
});
socket.on("con", (res) => {
  document.getElementById("player").textContent = res;
  document.getElementById("point").innerHTML = "";
});
socket.on("end", (res) => {
  document.getElementById("question").textContent = res;
  document.getElementById("questions").innerHTML = "";
});
