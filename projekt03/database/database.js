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
const prepared_queries = {
  get_all_questions: db.prepare("SELECT * FROM Questions;"),
  get_all_answers: db.prepare("SELECT * FROM Answers;"),
  get_correct_answers: db.prepare(
    "SELECT answer, question_id FROM Answers WHERE is_correct = 1;"),
  get_correct_answers_and_question_id: db.prepare(
    "SELECT question_id, answer_id FROM Answers WHERE is_correct = 1;"),
  get_user_scores: db.prepare("SELECT * FROM UserScores;"),
  add_question: db.prepare("INSERT INTO Questions (question) VALUES (?);"),
  add_answer: db.prepare("INSERT INTO Answers (question_id, answer, is_correct) VALUES (?, ?, ?);"),
  add_user_score: db.prepare("INSERT INTO UserScores (username, score, maxScore) VALUES (?, ?, ?) RETURNING user_id;"),
  get_user_score_by_id: db.prepare("SELECT * FROM UserScores WHERE user_id = ?;"),
  update_user_score_username: db.prepare("UPDATE UserScores SET username = ? WHERE user_id = ?;"),
  delete_user_score_by_id: db.prepare("DELETE FROM UserScores WHERE user_id = ?;"),
}
function showAllQuestions() {
 
  return prepared_queries.get_all_questions.all();
}
function showAllAnswers() {

  return prepared_queries.get_all_answers.all();
}
function addQuestion(question) {
  return prepared_queries.add_question.run(question);
}
function addAnswer(question_id, answer, is_correct) {
  return prepared_queries.add_answer.run(question_id, answer, is_correct);
}
function getCorrectAnswersandQestionId() {
  return prepared_queries.get_correct_answers_and_question_id.all();
}
function getCorrectAnswers() {
  return prepared_queries.get_correct_answers.all();
}
function addUserScore(username, score, maxScore) {
  return prepared_queries.add_user_score.run(username, score, maxScore);
}
function topTenUsers(){
   const stmt = db.prepare("SELECT username, score, maxScore FROM UserScores ORDER BY score * 1.0 / maxScore DESC LIMIT 10;");
  return stmt.all();
}
function getUsersScores() {
  return prepared_queries.get_user_scores.all();
}
function getUserScoresById(userID) {
  return prepared_queries.get_user_score_by_id.get(userID);
}
function updateUserScoreUsername(userId, newUsername) {
  return prepared_queries.update_user_score_username.run(newUsername, userId);}
function deleteUserScoreById(userId) {
  return prepared_queries.delete_user_score_by_id.run(userId);
}
export default {
  showAllQuestions,
  addQuestion,
  addAnswer,
  showAllAnswers,
  getCorrectAnswersandQestionId,
  getCorrectAnswers,
  addUserScore,
  topTenUsers,
  getUsersScores,
  getUserScoresById,
  updateUserScoreUsername,
  deleteUserScoreById,
};
