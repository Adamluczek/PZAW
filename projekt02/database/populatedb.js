import data from "./database.js";

const quizData = {
  questions: [
    {
      text: "Kto ma najwięcej punktów w NBA",
      answers: [
        { text: "Lebron James", isCorrect: 1 },
        { text: "Kareem Abdul-Jabbar", isCorrect: 0 },
        { text: "Michael Jordan", isCorrect: 0 },
        { text: "Karl Malone", isCorrect: 0 },
      ],
    },
    {
      text: "Kto ma najwięcej wygranych mistrzostw",
      answers: [
        { text: "Bill Russell", isCorrect: 1 },
        { text: "Michael Jordan", isCorrect: 0 },
        { text: "Kareem Abdul-Jabbar", isCorrect: 0 },
        { text: "Magic Johnson", isCorrect: 0 },
      ],
    },
  ],
};

quizData.questions.forEach((question) => {
  const result = data.addQuestion(question.text);
  const question_id = result.lastInsertRowid;
  question.answers.forEach((answer) => {
    data.addAnswer(question_id, answer.text, answer.isCorrect);
  });
});
