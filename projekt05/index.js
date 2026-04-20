import express from "express";
import data from "./database/database.js";
import session from "express-session";
import dotenv from "dotenv";
import SQLiteSessionStore from "./database/sessionStore.js";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 8000;
const SESSION_SECRET = process.env.SECRET || "thisisasecretkey";
const SESSION_MAX_AGE = 1000 * 60 * 60;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const sessionStore = new SQLiteSessionStore({
  dbPath: new URL("./sessions.sqlite", import.meta.url),
  ttl: SESSION_MAX_AGE,
});

if (!process.env.SECRET) {
  console.warn(
    "SECRET is not set in .env. Using insecure fallback session secret.",
  );
}

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: sessionStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "strict",
      httpOnly: true,
      secure: IS_PRODUCTION,
      maxAge: SESSION_MAX_AGE,
    },
  }),
);

app.use((req, res, next) => {
  res.locals.user = req.session.userID || null;
  res.locals.username = req.session.name || null;
  res.locals.isAdmin = req.session.isAdmin || false;

  next();
});

function savePendingScoreIfNeeded(req) {
  if (!req.session.userID || !req.session.pendingScore) {
    return false;
  }

  const { score, maxScore } = req.session.pendingScore;
  const result = data.addUserScore(req.session.userID, score, maxScore);

  delete req.session.pendingScore;

  if (!result?.lastInsertRowid) {
    req.session.scoreSaved = false;
    req.session.scoreSaveError = "Nie udało się automatycznie zapisać wyniku.";
    return false;
  }

  req.session.scoreSaved = true;
  delete req.session.scoreSaveError;
  return true;
}

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
  req.session.scoreSaved = false;
  delete req.session.scoreSaveError;
  delete req.session.pendingScore;

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
  }

  const error = req.session.scoreSaveError || null;
  delete req.session.scoreSaveError;

  return res.render("userScore", {
    title: "User Score",
    score,
    maxScore,
    saved: Boolean(req.session.scoreSaved),
    username: req.session.name || null,
    error,
  });
});
app.post("/addUserScore", (req, res) => {
  const score = req.session.score;
  const maxScore = req.session.maxScore;

  if (score == null || maxScore == null) {
    return res.redirect("/quiz");
  }

  if (!req.session.userID) {
    req.session.redirectAfterAuth = "/userScore";
    req.session.pendingScore = { score, maxScore };
    req.session.scoreSaved = false;

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
      return res.status(500).render("userScore", {
        title: "User Score",
        score,
        maxScore,
        saved: false,
        username,
        error: "Nie udało się zapisać wyniku. Spróbuj ponownie.",
      });
    }

    req.session.scoreSaved = true;
    delete req.session.pendingScore;
    delete req.session.scoreSaveError;

    return res.render("userScore", {
      title: "User Score",
      score,
      maxScore,
      saved: true,
      username,
      error: null,
    });
  } catch (err) {
    console.error("Błąd podczas zapisywania wyniku:", err);
    return res.status(500).render("userScore", {
      title: "User Score",
      score,
      maxScore,
      saved: false,
      username,
      error: "Wystąpił błąd serwera podczas zapisywania wyniku.",
    });
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

  return res.render("register", {
    title: "Rejestracja",
    error: null,
    formData: {
      email: "",
      username: "",
    },
  });
});

app.post("/signup", async (req, res) => {
  const { email, username, password, repeatPassword } = req.body;
  const formData = {
    email: email || "",
    username: username || "",
  };

  try {
    if (!email || !username || !password || !repeatPassword) {
      return res.status(400).render("register", {
        title: "Rejestracja",
        error: "Wszystkie pola są wymagane.",
        formData,
      });
    }

    if (password !== repeatPassword) {
      return res.status(400).render("register", {
        title: "Rejestracja",
        error: "Hasła nie są identyczne.",
        formData,
      });
    }

    const newUser = await data.createUser(username, email, password);

    if (!newUser) {
      return res.status(409).render("register", {
        title: "Rejestracja",
        error: "Użytkownik o podanym emailu lub nazwie już istnieje.",
        formData,
      });
    }

    const { user_id, username: returnedUsername } = newUser;
    req.session.userID = user_id;
    req.session.name = returnedUsername;
    req.session.isAdmin = 0;

    try {
      savePendingScoreIfNeeded(req);
    } catch (saveErr) {
      console.error("Błąd automatycznego zapisu wyniku:", saveErr);
      req.session.scoreSaved = false;
      req.session.scoreSaveError =
        "Nie udało się automatycznie zapisać wyniku po rejestracji.";
    }

    const redirectAfterAuth = req.session.redirectAfterAuth || "/";
    delete req.session.redirectAfterAuth;
    return res.redirect(redirectAfterAuth);
  } catch (err) {
    console.error("Błąd podczas rejestracji:", err);

    return res.status(500).render("register", {
      title: "Rejestracja",
      error: "Błąd serwera. Spróbuj ponownie.",
      formData,
    });
  }
});

app.get("/login", (req, res) => {
  if (req.session.userID) {
    return res.redirect("/");
  }

  return res.render("login", {
    title: "Logowanie",
    error: null,
    formData: {
      email: "",
    },
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const formData = {
    email: email || "",
  };

  if (!email || !password) {
    return res.status(400).render("login", {
      title: "Logowanie",
      error: "Email i hasło są wymagane.",
      formData,
    });
  }

  try {
    const userId = await data.validatePassword(email, password);

    if (!userId) {
      return res.status(401).render("login", {
        title: "Logowanie",
        error: "Nieprawidłowy email lub hasło.",
        formData,
      });
    }

    const user = data.getUser(userId);
    req.session.userID = userId;
    req.session.name = user.username;

    const userFull = data.getUserFull(userId);
    req.session.isAdmin = userFull?.Admin || 0;

    try {
      savePendingScoreIfNeeded(req);
    } catch (saveErr) {
      console.error("Błąd automatycznego zapisu wyniku:", saveErr);
      req.session.scoreSaved = false;
      req.session.scoreSaveError =
        "Nie udało się automatycznie zapisać wyniku po logowaniu.";
    }

    const redirectAfterAuth = req.session.redirectAfterAuth || "/";
    delete req.session.redirectAfterAuth;
    return res.redirect(redirectAfterAuth);
  } catch (err) {
    console.error("Błąd podczas logowania:", err);
    return res.status(500).render("login", {
      title: "Logowanie",
      error: "Błąd serwera.",
      formData,
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
