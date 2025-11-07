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
export default {
  showAllQuestions,
  addQuestion,
  addAnswer,
  showAllAnswers,
};
