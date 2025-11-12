import data from "./database.js";

const quizData = {
  questions: [
    {
      text: "Kto ma najwięcej punktów w NBA?",
      answers: [
        { text: "Lebron James", isCorrect: 1 },
        { text: "Kareem Abdul-Jabbar", isCorrect: 0 },
        { text: "Michael Jordan", isCorrect: 0 },
        { text: "Karl Malone", isCorrect: 0 },
      ],
    },
    {
      text: "Kto ma najwięcej wygranych mistrzostw?",
      answers: [
        { text: "Bill Russell", isCorrect: 1 },
        { text: "Michael Jordan", isCorrect: 0 },
        { text: "Kareem Abdul-Jabbar", isCorrect: 0 },
        { text: "Magic Johnson", isCorrect: 0 },
      ],
    },
    {
      text: "Który zawodnik zdobył najwięcej tytułów MVP sezonu zasadniczego w historii NBA?",
      answers: [
        { text: "Bill Russell", isCorrect: 0 },
        { text: "Michael Jordan", isCorrect: 0 },
        { text: "Kareem Abdul-Jabbar", isCorrect: 1 },
        { text: "Magic Johnson", isCorrect: 0 },
      ],
    },
    {
      text: "Która drużyna jako pierwsza w historii NBA wygrała 70 meczów w jednym sezonie?",
      answers: [
        { text: "Chicago Bulls", isCorrect: 1 },
        { text: "Golden State Warriors", isCorrect: 0 },
        { text: "Los Angeles Lakers", isCorrect: 0 },
        { text: "Milwaukee Bucks", isCorrect: 0 },
      ],
    },
    {
      text: "Kto jest najwyższym zawodnikiem, jaki kiedykolwiek grał w NBA?",
      answers: [
        { text: "Yao Ming", isCorrect: 0 },
        { text: "Gheorghe Mureșan", isCorrect: 1 },
        { text: "Kareem Abdul-Jabbar", isCorrect: 0 },
        { text: "Victor Wembanyama", isCorrect: 0 },
      ],
    },
    {
      text: "Który gracz jest na logo NBA?",
      answers: [
        { text: "Bill Russell", isCorrect: 0 },
        { text: "Michael Jordan", isCorrect: 0 },
        { text: "Jerry West", isCorrect: 1 },
        { text: "Wilt Chamberlain", isCorrect: 0 },
      ],
    },
    {
      text: "Kto jest liderem wszech czasów NBA pod względem liczby asyst?",
      answers: [
        { text: "John Stockton", isCorrect: 1 },
        { text: "Jason Kidd", isCorrect: 0 },
        { text: "Nikola Jokić", isCorrect: 0 },
        { text: "Steve Nash", isCorrect: 0 },
      ],
    },
    {
      text: "Który zawodnik zdobył najwięcej punktów w jednym meczu NBA?",
      answers: [
        { text: "Koby Bryant", isCorrect: 0 },
        { text: "Michael Jordan", isCorrect: 0 },
        { text: "LeBron James", isCorrect: 0 },
        { text: "Wilt Chamberlain", isCorrect: 1 },
      ],
    },
    {
      text: "Którzy kuzyni grali razem w Toronto Raptors?",
      answers: [
        { text: "Koby Bryant i Shaquille O'Neal", isCorrect: 0 },
        { text: "LeBron James i LeBron James Jr.", isCorrect: 0 },
        { text: "Stephen Curry i Seth Curry", isCorrect: 0 },
        { text: "Vince Carter i Tracy McGrady", isCorrect: 1 },
      ],
    },
    {
      text: "Kto rzucił najwięcej trójek w historii NBA?",
      answers: [
        { text: "Klay Thompson", isCorrect: 0 },
        { text: "Stephen Curry", isCorrect: 1 },
        { text: "Reggie Miller", isCorrect: 0 },
        { text: "Ray Allen", isCorrect: 0 },
      ],
    },
  ],
};
const testUsers = [
  
  {name: "test",
  score:10,
  maxScore: 10},
  {
  name: "test2",
  score:5,
  maxScore: 10},
  
  {
  name: "test3",
  score:3,
  maxScore: 10},
   {
  name: "test4",
  score:8,
  maxScore: 10},
   {
  name: "test5",
  score:9,
  maxScore: 10},


]
quizData.questions.forEach((question) => {
  const result = data.addQuestion(question.text);
  const question_id = result.lastInsertRowid;
  question.answers.forEach((answer) => {
    data.addAnswer(question_id, answer.text, answer.isCorrect);
  });
});
testUsers.forEach(user=>{
  data.addUserScore(user.name, user.score, user.maxScore)
});