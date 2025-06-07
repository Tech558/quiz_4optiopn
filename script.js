document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const questionText = document.querySelector('.question-text');
    const optionsContainer = document.querySelector('.options-container');
    const submitBtn = document.querySelector('.submit-btn');
    const nextBtn = document.querySelector('.next-btn');
    const previousBtn = document.querySelector('.previous-btn');
    const progressBar = document.querySelector('.progress-bar::after');
    const progressText = document.querySelector('.progress-text');
    const resultContainer = document.querySelector('.result-container');
    const quizContainer = document.querySelector('.question-container');
    const correctAnswersSpan = document.querySelector('.correct-answers');
    const wrongAnswersSpan = document.querySelector('.wrong-answers');
    const resultMessage = document.querySelector('.result-message');
    const restartBtn = document.querySelector('.restart-btn');
    
    // Quiz state
    let currentQuestion = 0;
    let score = 0;
    let wrongAttempts = 0;
    let quizData = [];
    let selectedOption = null;
    let answers = [];
    
    // Load quiz data from JSON
    fetch('quizData.json')
        .then(response => response.json())
        .then(data => {
            quizData = data.questions;
            initializeQuiz();
        })
        .catch(error => {
            console.error('Error loading quiz data:', error);
            questionText.textContent = 'Failed to load questions. Please try again later.';
        });
    
    function initializeQuiz() {
        showQuestion();
        updateProgress();
        
        // Event listeners
        submitBtn.addEventListener('click', checkAnswer);
        nextBtn.addEventListener('click', nextQuestion);
        previousBtn.addEventListener('click', previousQuestion);
        restartBtn.addEventListener('click', restartQuiz);
    }
    
    function showQuestion() {
        const question = quizData[currentQuestion];
        questionText.textContent = question.question;
        
        optionsContainer.innerHTML = '';
        selectedOption = null;
        wrongAttempts = 0;
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('label');
            optionElement.className = 'option';
            
            const radioBtn = document.createElement('input');
            radioBtn.type = 'radio';
            radioBtn.name = 'option';
            radioBtn.value = index;
            
            radioBtn.addEventListener('change', function() {
                selectedOption = parseInt(this.value);
            });
            
            const optionText = document.createElement('span');
            optionText.textContent = option;
            
            optionElement.appendChild(radioBtn);
            optionElement.appendChild(optionText);
            optionsContainer.appendChild(optionElement);
        });
        
        // Enable/disable navigation buttons
        previousBtn.disabled = currentQuestion === 0;
        nextBtn.disabled = currentQuestion === quizData.length - 1;
        submitBtn.disabled = false;
    }
    
    function checkAnswer() {
        if (selectedOption === null) {
            alert('Please select an answer!');
            return;
        }
        
        const question = quizData[currentQuestion];
        const options = document.querySelectorAll('.option');
        const selectedOptionElement = options[selectedOption];
        
        if (selectedOption === question.correctAnswer) {
            // Correct answer
            selectedOptionElement.classList.add('correct');
            score++;
            answers[currentQuestion] = { correct: true, attempts: wrongAttempts + 1 };
            disableOptions();
            submitBtn.disabled = true;
        } else {
            // Wrong answer
            wrongAttempts++;
            selectedOptionElement.classList.add('wrong');
            
            if (wrongAttempts >= 2) {
                // Show correct answer after 2 wrong attempts
                options[question.correctAnswer].classList.add('correct');
                answers[currentQuestion] = { correct: false, attempts: 2 };
                disableOptions();
                submitBtn.disabled = true;
            }
        }
    }
    
    function disableOptions() {
        const options = document.querySelectorAll('.option');
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        
        options.forEach(option => option.classList.add('locked'));
        radioButtons.forEach(radio => radio.disabled = true);
    }
    
    function nextQuestion() {
        if (currentQuestion < quizData.length - 1) {
            currentQuestion++;
            showQuestion();
            updateProgress();
        } else {
            showResults();
        }
    }
    
    function previousQuestion() {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion();
            updateProgress();
        }
    }
    
    function updateProgress() {
        const progressPercentage = ((currentQuestion + 1) / quizData.length) * 100;
        document.querySelector('.progress-bar').style.setProperty('--progress', `${progressPercentage}%`);
        progressText.textContent = `Question ${currentQuestion + 1}/${quizData.length}`;
        
        // Style the progress bar pseudo-element
        const style = document.createElement('style');
        style.innerHTML = `.progress-bar::after { width: ${progressPercentage}% !important; }`;
        document.head.appendChild(style);
    }
    
    function showResults() {
        const wrongAnswers = answers.filter(answer => !answer.correct).length;
        
        quizContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        
        correctAnswersSpan.textContent = score;
        wrongAnswersSpan.textContent = wrongAnswers;
        
        // Set congratulatory message based on score
        const percentage = (score / quizData.length) * 100;
        if (percentage >= 80) {
            resultMessage.textContent = 'Awesome! You\'re a Super Star! 🌟';
        } else if (percentage >= 60) {
            resultMessage.textContent = 'Great Job! You Did Well! 👍';
        } else if (percentage >= 40) {
            resultMessage.textContent = 'Good Try! Keep Practicing! 😊';
        } else {
            resultMessage.textContent = 'Nice Try! You\'ll Do Better Next Time! 💪';
        }
    }
    
    function restartQuiz() {
        currentQuestion = 0;
        score = 0;
        answers = [];
        
        quizContainer.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        
        showQuestion();
        updateProgress();
    }
});