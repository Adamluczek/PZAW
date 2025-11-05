import express from "express";

const APP = express();
const PORT = 8000

const quiz = {
    question : {
        name: "Pytania",
        que: ["Kto ma najwięcej punktów w NBA", 'Kto ma najwięcej wygranych mistrzostw']
    },
    answer:{
        name: "Odpowiedź",
        ans:["Lebron James", "Bill Russel"]
    }
};


APP.set("view engine", "ejs");
APP.use(express.static("public"));


APP.get("/quiz", (req,res)=>{
    res.render("quiz", {
        title:"Quiz",
        questions: quiz.question.que,
        answers: quiz.answer.ans}
    )
  });






APP.listen(PORT, ()=>{
    console.log(`Server on http://localhost:${PORT}`)
})



