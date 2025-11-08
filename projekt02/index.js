import express from "express";
import data from "./database/database.js";
const APP = express();
const PORT = 8000;

APP.set("view engine", "ejs");
APP.use(express.static("public"));
APP.use(express.urlencoded());

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
  correctAnswers.forEach((ans) => {
    correctObject[ans.question_id] = ans.answer_id.toString();
    
  });
  let score = 0;
  let maxScore = correctAnswers.length;
   correctAnswers.forEach((ans) => {
    let question_id = ans.question_id.toString();
    if(userAnswers[question_id] == correctObject[question_id]){
      score += 1;
    }
   
  });
  
  res.render("score", {
    title: "Score",
    correctAnswers: data.getCorrectAnswersandQestionId(),
    questions: data.showAllQuestions(),
    text_answers : data.getCorrectAnswers(),
    score: score,
    maxScore: maxScore
  });
  
});

APP.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
