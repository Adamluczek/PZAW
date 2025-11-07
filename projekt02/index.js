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

APP.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
