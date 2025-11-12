import express from "express";
import data from "./database/database.js";
const APP = express();
const PORT = 8000;

APP.set("view engine", "ejs");
APP.use(express.static("public"));
APP.use(express.urlencoded());



APP.get("/", (req, res) => {
    res.render("index",
        {
            title: "NBA Trivia game",
            topUsers: data.topTenUsers()
        }
    );
    
});

APP.get("/quiz", (req, res) => {
  res.render("quiz", {
    title: "Quiz",
    questions: data.showAllQuestions(),
    answers: data.showAllAnswers(),
  });
});

APP.post("/quiz", (req, res) => {
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

  res.render("score", {
    title: "Score",
    questions: data.showAllQuestions(),
    text_answers: data.getCorrectAnswers(),
    correctQuestions: correctQuestionIds,
    score: score,
    maxScore: maxScore,
  });
});

APP.get("/userScore", (req, res) => {
  const score = req.query.score;
  const maxScore = req.query.maxScore;
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
APP.post("/addUserScore", (req, res) => {
  const username = req.body.username;
  const score = req.body.score;

  const maxScore = req.body.maxScore;

  data.addUserScore(username, score, maxScore);
  res.render("userScore", {
    title: "User Score",
    score: score,
    maxScore: maxScore,
    saved: true,
    username: username,
  });
});
APP.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
