import express from "express";
import data from "./database/database.js";
import session from "express-session";
import connectSqlite3 from "connect-sqlite3";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 8000;
const SESSION_SECRET = process.env.SECRET || "thisisasecretkey";
const SQLiteStore = connectSqlite3(session);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());

app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax",
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60,
    }, // 60 minut
  }),
);

app.use((req, res, next) => {
  res.locals.user = req.session.userID || null;
  res.locals.username = req.session.name || null;
  res.locals.isAdmin = req.session.isAdmin || false;

  next();
});
app.get("/", (req, res) => {
  let userScore = req.session.userID
    ? data.getUserScoresById(req.session.userID)
    : null;

  res.render("index", {
    title: "NBA Trivia game",
    topUsers: data.topTenUsers(),
    userScoreIdsSession: userScore,
  });
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
  if (score == null || maxScore == null) {
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
  const score = req.session.score;
  const maxScore = req.session.maxScore;

  if (score == null || maxScore == null) {
    return res.redirect("/quiz");
  }

  if (!req.session.userID) {
    req.session.redirectAfterAuth = "/userScore";
    return res.status(401).render("authRequired", {
      title: "Zaloguj się, aby zapisać wynik",
      score,
      maxScore,
    });
  }

  const user = req.session.userID;
  const username = req.session.name;

  try {
    const result = data.addUserScore(user, score, maxScore);
    if (!result || !result.lastInsertRowid) {
      return res.status(500).send("Błąd zapisu wyniku");
    }
    res.render("userScore", {
      title: "User Score",
      score: score,
      maxScore: maxScore,
      saved: true,
      username: username,
    });
  } catch (err) {
    console.error("Błąd podczas zapisywania wyniku:", err);
    res.status(500).send("Błąd serwera");
  }
});

app.get("/userScore/:id/edit", (req, res) => {
  const scoreId = parseInt(req.params.id);
  const userScore = data.getScoreById(scoreId);

  if (!userScore) {
    return res.status(404).send("Wynik nie znaleziony");
  }

  if (
    Number(req.session.userID) !== Number(userScore.user_id) &&
    !req.session.isAdmin
  ) {
    return res.status(403).send("Nie masz dostępu do edycji tego wyniku");
  }

  res.render("editUsername", {
    title: "Edytuj nazwę użytkownika",
    userScore: userScore,
  });
});
app.post("/userScore/:id/edit", (req, res) => {
  const scoreId = parseInt(req.params.id);
  const userScore = data.getScoreById(scoreId);

  if (!userScore) {
    return res.status(404).send("Wynik nie znaleziony");
  }

  if (
    Number(req.session.userID) !== Number(userScore.user_id) &&
    !req.session.isAdmin
  ) {
    return res.status(403).send("Nie masz dostępu do tego wyniku");
  }

  const newUsername = req.body.username;
  if (!newUsername || newUsername.trim().length === 0) {
    return res.status(400).send("Nazwa nie może być pusta");
  }
  data.updateUserScoreUsername(userScore.user_id, newUsername);
  res.redirect("/");
});
app.post("/userScore/:id/delete", (req, res) => {
  const scoreId = parseInt(req.params.id);
  const userScore = data.getScoreById(scoreId);

  if (!userScore) {
    return res.status(404).send("Wynik nie znaleziony");
  }

  if (
    Number(req.session.userID) !== Number(userScore.user_id) &&
    !req.session.isAdmin
  ) {
    return res.status(403).send("Nie masz dostępu do tego wyniku");
  }

  data.deleteUserScoreById(scoreId);
  res.redirect("/");
});

app.get("/signup", (req, res) => {
  if (req.session.userID) {
    return res.redirect("/");
  }
  res.render("register", {
    title: "Rejestracja",
  });
});

app.post("/signup", async (req, res) => {
  const { email, username, password, repeatPassword } = req.body;

  try {
    if (!email || !username || !password || !repeatPassword) {
      return res.status(400).send("Wszystkie pola są wymagane");
    }

    if (password !== repeatPassword) {
      return res.status(400).send("Hasła nie są identyczne");
    }

    const NEW_USER = await data.createUser(username, email, password);

    if (!NEW_USER) {
      return res
        .status(409)
        .send("Użytkownik o podanym emailu lub nazwie już istnieje");
    }

    const { user_id, username: returnedUsername } = NEW_USER;
    req.session.userID = user_id;
    req.session.name = returnedUsername;
    req.session.isAdmin = 0;

    const redirectAfterAuth = req.session.redirectAfterAuth || "/";
    delete req.session.redirectAfterAuth;
    return res.redirect(redirectAfterAuth);
  } catch (err) {
    console.error("Błąd podczas rejestracji:", err);

    return res.status(500).send("Błąd serwera");
  }
});

app.get("/login", (req, res) => {
  if (req.session.userID) {
    return res.redirect("/");
  }
  res.render("login", {
    title: "Logowanie",
    error: null,
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).render("login", {
      title: "Logowanie",
      error: "Email i hasło są wymagane",
    });
  }

  try {
    const userId = await data.validatePassword(email, password);

    if (!userId) {
      return res.status(401).render("login", {
        title: "Logowanie",
        error: "Nieprawidłowy email lub hasło",
      });
    }

    const user = data.getUser(userId);
    req.session.userID = userId;
    req.session.name = user.username;

    const userFull = data.getUserFull(userId);
    req.session.isAdmin = userFull?.Admin || 0;

    const redirectAfterAuth = req.session.redirectAfterAuth || "/";
    delete req.session.redirectAfterAuth;
    return res.redirect(redirectAfterAuth);
  } catch (err) {
    console.error("Błąd podczas logowania:", err);
    return res.status(500).render("login", {
      title: "Logowanie",
      error: "Błąd serwera",
    });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Blad podczas wylogowania:", err);
      return res.status(500).send("Blad serwera");
    }
    res.clearCookie("connect.sid");
    return res.redirect("/");
  });
});

app.get("/admin", (req, res) => {
  if (!req.session.isAdmin) {
    return res
      .status(403)
      .send("Brak dostępu - wymagane uprawnienia administratora");
  }

  const allScores = data.getAllScoresWithDetails();
  res.render("admin", {
    title: "Panel Administratora",
    scores: allScores,
  });
});

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
