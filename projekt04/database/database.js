import { DatabaseSync } from "node:sqlite";
import argon2 from "argon2";
import dotenv from "dotenv";
dotenv.config();
const PEPPER = process.env.PEPPER;
const HASH_PARAMS = {
  secret: Buffer.from(PEPPER, "hex"),
};

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
 CREATE TABLE IF NOT EXISTS Users(
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  Admin INTEGER DEFAULT 0,
  created_at INTEGER

)STRICT;
CREATE TABLE IF NOT EXISTS UserScores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    maxScore INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users (user_id)
) STRICT;

`);
const prepared_queries = {
  get_all_questions: db.prepare("SELECT * FROM Questions;"),

  get_all_answers: db.prepare("SELECT * FROM Answers;"),

  get_correct_answers: db.prepare(
    "SELECT answer, question_id FROM Answers WHERE is_correct = 1;",
  ),

  get_correct_answers_and_question_id: db.prepare(
    "SELECT question_id, answer_id FROM Answers WHERE is_correct = 1;",
  ),

  get_user_scores: db.prepare("SELECT * FROM UserScores;"),

  add_question: db.prepare("INSERT INTO Questions (question) VALUES (?);"),

  add_answer: db.prepare(
    "INSERT INTO Answers (question_id, answer, is_correct) VALUES (?, ?, ?);",
  ),

  add_user_score: db.prepare(
    "INSERT INTO UserScores (user_id, score, maxScore) VALUES (?, ?, ?);",
  ),

  get_user_score_by_id: db.prepare(
    "SELECT UserScores.id, UserScores.user_id, UserScores.score, UserScores.maxScore, Users.username FROM UserScores JOIN Users ON Users.user_id = UserScores.user_id WHERE UserScores.user_id = ? ORDER BY UserScores.id DESC;",
  ),

  update_user_score_username: db.prepare(
    "UPDATE Users SET username = ? WHERE user_id = ?;",
  ),

  delete_user_score_by_id: db.prepare("DELETE FROM UserScores WHERE id = ?;"),

  create_user: db.prepare(
    "INSERT INTO Users (username, email,  password, created_at, Admin) VALUES (?,?, ?, ?, ?) RETURNING user_id, username;",
  ),
  get_user: db.prepare(
    "SELECT user_id, email, username, created_at FROM Users WHERE user_id = ?;",
  ),
  find_by_username: db.prepare(
    "SELECT user_id, username, created_at FROM Users WHERE username = ?;",
  ),
  get_auth_data: db.prepare(
    "SELECT user_id, password FROM Users WHERE email = ?;",
  ),

  get_score_by_id: db.prepare(
    "SELECT UserScores.id, UserScores.user_id, UserScores.score, UserScores.maxScore, Users.username FROM UserScores JOIN Users ON Users.user_id = UserScores.user_id WHERE UserScores.id = ?;",
  ),

  get_all_scores_with_details: db.prepare(
    "SELECT UserScores.id, UserScores.user_id, UserScores.score, UserScores.maxScore, Users.username FROM UserScores JOIN Users ON Users.user_id = UserScores.user_id ORDER BY UserScores.id DESC;",
  ),

  get_user_full: db.prepare(
    "SELECT user_id, username, email, Admin FROM Users WHERE user_id = ?;",
  ),
};
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
function addUserScore(user_id, score, maxScore) {
  return prepared_queries.add_user_score.run(user_id, score, maxScore);
}
function topTenUsers() {
  const stmt = db.prepare(
    "SELECT username, score, maxScore FROM UserScores JOIN Users ON Users.user_id = UserScores.user_id ORDER BY score * 1.0 / maxScore DESC LIMIT 10;",
  );
  return stmt.all();
}
function getUsersScores() {
  return prepared_queries.get_user_scores.all();
}
function getUserScoresById(userID) {
  return prepared_queries.get_user_score_by_id.all(userID);
}
function updateUserScoreUsername(userId, newUsername) {
  return prepared_queries.update_user_score_username.run(newUsername, userId);
}
function deleteUserScoreById(userId) {
  return prepared_queries.delete_user_score_by_id.run(userId);
}

async function createUser(username, email, password, admin = 0) {
  let existing_user = prepared_queries.find_by_username.get(username);

  if (existing_user != null) {
    return null;
  }
  let createdAt = Date.now();
  let passhash = await argon2.hash(password, HASH_PARAMS);

  return prepared_queries.create_user.get(
    username,
    email,
    passhash,
    createdAt,
    admin,
  );
}

async function validatePassword(email, password) {
  let auth_data = prepared_queries.get_auth_data.get(email);
  if (auth_data != null) {
    if (await argon2.verify(auth_data.password, password, HASH_PARAMS)) {
      return auth_data.user_id;
    }
  }
  return null;
}

function getUser(user_id) {
  return prepared_queries.get_user.get(user_id);
}

function getScoreById(scoreId) {
  return prepared_queries.get_score_by_id.get(scoreId);
}

function getAllScoresWithDetails() {
  return prepared_queries.get_all_scores_with_details.all();
}

function getUserFull(user_id) {
  return prepared_queries.get_user_full.get(user_id);
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
  createUser,
  validatePassword,
  getUser,
  getScoreById,
  getAllScoresWithDetails,
  getUserFull,
};
