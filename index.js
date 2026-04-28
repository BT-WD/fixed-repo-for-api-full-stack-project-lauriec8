let score = 0;
let questionsAsked = 0;
let correctAnswer = "";
const MAX_QUESTIONS = 10;

const progressElement = document.getElementById('progress');
const scoreElement = document.getElementById('score');
const questionElement = document.getElementById('question');
const answerButtonsContainer = document.getElementById('answer-buttons');

// Fixes the "bold" codes like &quot;
function cleanText(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function getQuestion(retries = 3) {
    progressElement.textContent = `${questionsAsked + 1}/${MAX_QUESTIONS}`;
    questionElement.innerHTML = "SCANNING DEEP SPACE...";
    answerButtonsContainer.innerHTML = ''; 

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
            if (response.status === 429) throw new Error("Rate Limit");
            const data = await response.json();
            displayQuestion(data.results[0]);
            return; 
        } catch (error) {
            await sleep(1500); 
        }
    }
    questionElement.innerHTML = "COMMS FAILURE. <br><button class='answer-btn' onclick='getQuestion()'>RETRY</button>";
}

function displayQuestion(data) {
    const cleanQ = cleanText(data.question);
    correctAnswer = cleanText(data.correct_answer);
    questionElement.innerHTML = cleanQ;

    const answers = data.incorrect_answers.map(ans => cleanText(ans));
    answers.push(correctAnswer);
    answers.sort(() => Math.random() - 0.5);

    answers.forEach(answer => {
        const button = document.createElement('button');
        button.classList.add('answer-btn');
        button.innerHTML = answer;
        button.onclick = () => checkAnswer(button, answer);
        answerButtonsContainer.appendChild(button);
    });
}

function checkAnswer(btn, selected) {
    const allButtons = document.querySelectorAll('.answer-btn');
    allButtons.forEach(b => b.disabled = true);
    
    questionsAsked++;

    if (selected === correctAnswer) {
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
    questionElement.innerHTML = `MISSION COMPLETE!<br>FINAL SCORE: ${score}`;
    answerButtonsContainer.innerHTML = `
        <button class="answer-btn" style="grid-column: 1 / span 2; max-width: 600px; margin: 0 auto;" onclick="location.reload()">INITIATE NEW LAUNCH</button>
    `;
}

getQuestion();