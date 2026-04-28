// --- Configuration ---
let score = 0;
let questionsAsked = 0;
let correctAnswer = "";
let missionLog = [];
const MAX_QUESTIONS = 10;


// --- DOM Elements ---
const progressElement = document.getElementById('progress');
const scoreElement = document.getElementById('score');
const questionElement = document.getElementById('question');
const answerButtonsContainer = document.getElementById('answer-buttons');


// --- Helper Functions ---
const sleep = (ms) => new Promise(res => setTimeout(res, ms));


// --- Game Logic ---
async function getQuestion(retries = 3) {
    progressElement.textContent = `${questionsAsked + 1}/${MAX_QUESTIONS}`;
    questionElement.innerHTML = "SCANNING DEEP SPACE...";
    answerButtonsContainer.innerHTML = '';


    for (let i = 0; i < retries; i++) {
        try {
            // Standard URL (No Base64)
            const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
           
            if (response.status === 429) throw new Error("Rate Limit");


            const data = await response.json();
            displayQuestion(data.results[0]);
            return;


        } catch (error) {
            console.warn("Signal interference. Retrying...");
            await sleep(1500);
        }
    }
    questionElement.innerHTML = "COMMS FAILURE. <br><button class='answer-btn' onclick='getQuestion()'>RETRY CONNECTION</button>";
}


function displayQuestion(data) {
    correctAnswer = data.correct_answer;
    questionElement.innerHTML = data.question;


    const answers = [...data.incorrect_answers, data.correct_answer];
    answers.sort(() => Math.random() - 0.5);


    answers.forEach(answer => {
        const button = document.createElement('button');
        button.classList.add('answer-btn');
        button.innerHTML = answer;
        button.onclick = () => checkAnswer(button, answer, data.question);
        answerButtonsContainer.appendChild(button);
    });
}


function checkAnswer(btn, selected, qText) {
    const allButtons = document.querySelectorAll('.answer-btn');
    allButtons.forEach(b => b.disabled = true);
   
    const isCorrect = (selected === correctAnswer);
   
    // Save to log for the report
    missionLog.push({
        q: qText,
        sel: selected,
        cor: correctAnswer,
        win: isCorrect
    });
    localStorage.setItem('spaceLog', JSON.stringify(missionLog));


    questionsAsked++;


    if (isCorrect) {
        btn.classList.add('correct');
        score += 10;
        scoreElement.textContent = score;
    } else {
        btn.classList.add('wrong');
        allButtons.forEach(b => {
            if (b.innerHTML === correctAnswer) b.classList.add('correct');
        });
    }


    if (questionsAsked >= MAX_QUESTIONS) {
        setTimeout(endGame, 2000);
    } else {
        setTimeout(getQuestion, 2000);
    }
}


function endGame() {
    document.querySelector('.game-header').style.display = 'none';
    questionElement.innerHTML = `MISSION COMPLETE!<br>SCORE: ${score}`;
   
    let reportHTML = `<div class="mission-report"><h3>MISSION REPORT</h3>`;
    const logs = JSON.parse(localStorage.getItem('spaceLog')) || [];
   
    logs.forEach((item, index) => {
        reportHTML += `
            <div class="log-item ${item.win ? 'log-success' : 'log-fail'}">
                <p><strong>${index + 1}. ${item.q}</strong></p>
                <p>PILOT: ${item.sel} | HQ: ${item.cor}</p>
            </div>`;
    });
   
    answerButtonsContainer.style.display = "flex";
    answerButtonsContainer.style.flexDirection = "column";
    answerButtonsContainer.innerHTML = reportHTML + `</div><button class="answer-btn" style="margin-top:20px;" onclick="location.reload()">NEW LAUNCH</button>`;
}


// Initialize
localStorage.removeItem('spaceLog');
getQuestion();

