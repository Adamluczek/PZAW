import { DatabaseSync } from "node:sqlite";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);

db.exec(`
CREATE TABLE IF NOT EXISTS Questions (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL

) STRICT;
CREATE TABLE IF NOT EXISTS Answers (
    answer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Questions (question_id)
) STRICT;
CREATE TABLE IF NOT EXISTS UserScores (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    maxScore INTEGER NOT NULL
) STRICT;
`);

function showAllQuestions() {
  const stmt = db.prepare("SELECT * FROM Questions;");
  return stmt.all();
}
function showAllAnswers() {
  const stmt = db.prepare("SELECT * FROM Answers;");
  return stmt.all();
}
function addQuestion(question) {
  const stmt = db.prepare("INSERT INTO Questions (question) VALUES (?);");
  return stmt.run(question);
}
function addAnswer(question_id, answer, is_correct) {
  const stmt = db.prepare(
    "INSERT INTO Answers (question_id, answer, is_correct) VALUES (?, ?, ?);"
  );
  return stmt.run(question_id, answer, is_correct);
}
function getCorrectAnswersandQestionId() {
  const stmt = db.prepare(
    "SELECT question_id, answer_id FROM Answers WHERE is_correct = 1;"
  );
  return stmt.all();
}
function getCorrectAnswers() {
  const stmt = db.prepare(
    "SELECT answer, question_id FROM Answers WHERE is_correct = 1;"
  );
  return stmt.all();
}
function addUserScore(username, score, maxScore) {
  const stmt = db.prepare(
    "INSERT INTO UserScores (username, score, maxScore) VALUES (?, ?, ?);"
  );
  return stmt.run(username, score, maxScore);
}
function topTenUsers(){
  const stmt = db.prepare("SELECT username, score, maxScore FROM UserScores ORDER BY score * 1.0 / maxScore DESC LIMIT 10;");
  return stmt.all();
}
export default {
  showAllQuestions,
  addQuestion,
  addAnswer,
  showAllAnswers,
  getCorrectAnswersandQestionId,
  getCorrectAnswers,
  addUserScore,
  topTenUsers
};
