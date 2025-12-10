import express from "express";
import data from "./database/database.js";
import session from "express-session";
const app = express();
const PORT = 8000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());

app.use(
  session({
    secret:'thisisasecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 15 }, // 15 minut
  }));

app.get("/", (req, res) => {
  if (!req.session.userScoreIds) {
    req.session.userScoreIds = [];
  }
    res.render("index",
        {
            title: "NBA Trivia game",
            topUsers: data.topTenUsers(),
            userScoreIdsSession: req.session.userScoreIds,
            usersScores: data.getUsersScores()
        }
    );
});

app.get("/quiz", (req, res) => {
  res.render("quiz", {
    title: "Quiz",
    questions: data.showAllQuestions(),
    answers: data.showAllAnswers(),
  });
});

app.post("/quiz", (req, res) => {
  const userAnswers = req.body;
  const correctAnswers = data.getCorrectAnswersandQestionId();
  const correctObject = {};
  let correctQuestionIds = [];
  correctAnswers.forEach((ans) => {
    correctObject[ans.question_id] = ans.answer_id.toString();
  });
  let score = 0;
  let maxScore = correctAnswers.length;
  correctAnswers.forEach((ans) => {
    let question_id = ans.question_id.toString();
    if (userAnswers[question_id] == correctObject[question_id]) {
      score += 1;
      correctQuestionIds.push(question_id);
    }
  });
  req.session.score = score;
  req.session.maxScore = maxScore;
  res.render("score", {
    title: "Score",
    questions: data.showAllQuestions(),
    text_answers: data.getCorrectAnswers(),
    correctQuestions: correctQuestionIds,
    score: score,
    maxScore: maxScore,
  });
});

app.get("/userScore", (req, res) => {
  const score = req.session.score;
  const maxScore = req.session.maxScore;
  if (!score || !maxScore) {
    return res.redirect("/quiz");
  } else {
    res.render("userScore", {
      title: "User Score",
      score: score,
      maxScore: maxScore,
      saved: false,
    });
  }
});
app.post("/addUserScore", (req, res) => {
  const username = req.body.username;
  const score = req.body.score;
  const maxScore = req.body.maxScore;
  const id = data.addUserScore(username, score, maxScore);
  
  if (!req.session.userScoreIds) {
    req.session.userScoreIds = [];
  }
  req.session.userScoreIds.push(id.lastInsertRowid);
  res.render("userScore", {
    title: "User Score",
    score: score,
    maxScore: maxScore,
    saved: true,
    username: username,
  });
});

app.get("/userScore/:id/edit", (req, res) => {
  const scoreId = parseInt(req.params.id);
  if (!req.session.userScoreIds || !req.session.userScoreIds.includes(scoreId)) {
    return res.status(403).send("Nie masz dostępu do edycji tego wyniku");
  }
  const userScore = data.getUserScoresById(scoreId);
  if (!userScore) {
    return res.status(404).send("Wynik użytkownika nie znaleziony");
  }

  res.render("editUsername", {
    title: "Edytuj nazwę użytkownika",
    userScore: userScore,
  });

});
app.post("/userScore/:id/edit", (req, res) => {
  const scoreId = parseInt(req.params.id);
  if (!req.session.userScoreIds || !req.session.userScoreIds.includes(scoreId)) {
    return res.status(403).send("Nie masz dostępu do tego wyniku");
  }
  const newUsername = req.body.username;
  if (!newUsername || newUsername.trim().length === 0) {
    return res.status(400).send("Nazwa nie może być pusta");
  }
  data.updateUserScoreUsername(scoreId, newUsername);
  res.redirect("/");
});
app.post("/userScore/:id/delete", (req, res) => {
const scoreId = parseInt(req.params.id);
if (!req.session.userScoreIds || !req.session.userScoreIds.includes(scoreId)) {
    return res.status(403).send("Nie masz dostępu do tego wyniku");
  }
  data.deleteUserScoreById(scoreId);


const index = req.session.userScoreIds.indexOf(scoreId);
  if (index > -1) {
    req.session.userScoreIds.splice(index, 1);
  }
  
  res.redirect("/");
});
app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
