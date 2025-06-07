document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const questionText = document.querySelector('.question-text');
    const optionsContainer = document.querySelector('.options-container');
    const submitBtn = document.querySelector('.submit-btn');
    const nextBtn = document.querySelector('.next-btn');
    const previousBtn = document.querySelector('.previous-btn');
    const progressText = document.querySelector('.progress-text');
    const progressBar = document.querySelector('.progress-bar');
    const resultContainer = document.querySelector('.result-container');
    const quizContainer = document.querySelector('.question-container');
    const correctAnswersSpan = document.querySelector('.correct-answers');
    const wrongAnswersSpan = document.querySelector('.wrong-answers');
    const resultMessage = document.querySelector('.result-message');
    const restartBtn = document.querySelector('.restart-btn');
    const reviewContainer = document.querySelector('.review-container');

    // Quiz state
    let currentQuestion = 0;
    let score = 0;
    let wrongAttempts = 0;
    let quizData = [];
    let selectedOption = null;
    let answers = [];

    // Fetch quiz data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            quizData = data.questions;
            initializeQuiz();
        })
        .catch(error => console.error('Error loading quiz data:', error));

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
        
        // Update next button text for last question
        if (currentQuestion === quizData.length - 1) {
            nextBtn.innerHTML = "See Results <i class='fas fa-trophy'></i>";
        } else {
            nextBtn.innerHTML = "Next <i class='fas fa-arrow-right'></i>";
        }
        
        // Check if we have an answer for this question
        const existingAnswer = answers[currentQuestion];
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('label');
            optionElement.className = 'option';
            
            if (existingAnswer) {
                optionElement.classList.add('locked');
            }
            
            const radioBtn = document.createElement('input');
            radioBtn.type = 'radio';
            radioBtn.name = 'option';
            radioBtn.value = index;
            
            if (existingAnswer) {
                radioBtn.disabled = true;
                
                // Show user's previous selection
                if (existingAnswer.selectedOption === index) {
                    radioBtn.checked = true;
                }
                
                // Highlight correct answer
                if (index === question.correctAnswer) {
                    optionElement.classList.add('correct');
                }
                
                // Highlight wrong user selection
                if (existingAnswer.selectedOption === index && !existingAnswer.correct) {
                    optionElement.classList.add('wrong');
                }
            } else {
                radioBtn.addEventListener('change', function() {
                    selectedOption = parseInt(this.value);
                });
            }
            
            const optionText = document.createElement('span');
            optionText.textContent = option;
            
            optionElement.appendChild(radioBtn);
            optionElement.appendChild(optionText);
            optionsContainer.appendChild(optionElement);
        });
        
        // Enable/disable navigation buttons
        previousBtn.disabled = currentQuestion === 0;
        submitBtn.disabled = existingAnswer ? true : false;
    }
    
    function checkAnswer() {
        if (selectedOption === null) {
            alert('Please select an answer!');
            return;
        }
        
        const question = quizData[currentQuestion];
        const options = document.querySelectorAll('.option');
        const selectedOptionElement = options[selectedOption];
        const isCorrect = selectedOption === question.correctAnswer;
        
        answers[currentQuestion] = {
            selectedOption: selectedOption,
            correct: isCorrect,
            attempts: wrongAttempts + 1
        };
        
        if (isCorrect) {
            // Correct answer
            selectedOptionElement.classList.add('correct');
            score++;
            submitBtn.disabled = true;
            createConfetti();
        } else {
            // Wrong answer
            wrongAttempts++;
            selectedOptionElement.classList.add('wrong');
            
            if (wrongAttempts >= 2) {
                // Show correct answer after 2 wrong attempts
                options[question.correctAnswer].classList.add('correct');
                submitBtn.disabled = true;
            }
        }
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
        progressBar.style.setProperty('--progress', `${progressPercentage}%`);
        progressText.textContent = `Question ${currentQuestion + 1}/${quizData.length}`;
    }
    
    function showResults() {
        const wrongAnswers = quizData.length - score;
        
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
        
        // Build review section
        buildReviewSection();
        
        // Create celebration confetti
        createConfetti();
    }
    
    function buildReviewSection() {
        reviewContainer.innerHTML = '';
        
        quizData.forEach((question, index) => {
            const answer = answers[index] || {};
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            const questionEl = document.createElement('div');
            questionEl.className = 'review-question';
            questionEl.textContent = `${index + 1}. ${question.question}`;
            reviewItem.appendChild(questionEl);
            
            // Show correct answer
            const correctAnswerEl = document.createElement('div');
            correctAnswerEl.className = 'review-answer review-correct';
            correctAnswerEl.innerHTML = `
                <div class="review-icon">✓</div>
                <div>${question.options[question.correctAnswer]}</div>
            `;
            reviewItem.appendChild(correctAnswerEl);
            
            // Show user's answer if exists
            if (answer.selectedOption !== undefined) {
                const userAnswerEl = document.createElement('div');
                userAnswerEl.className = `review-answer ${answer.correct ? 'review-correct' : 'review-wrong'}`;
                userAnswerEl.innerHTML = `
                    <div class="review-icon">${answer.correct ? '✓' : '✗'}</div>
                    <div>Your answer: ${question.options[answer.selectedOption]}</div>
                `;
                reviewItem.appendChild(userAnswerEl);
            }
            
            // Show status
            const statusEl = document.createElement('div');
            statusEl.className = `review-status ${answer.correct ? 'status-correct' : 'status-wrong'}`;
            statusEl.textContent = answer.correct ? 'Correct!' : 'Wrong Answer';
            reviewItem.appendChild(statusEl);
            
            reviewContainer.appendChild(reviewItem);
        });
    }
    
    function restartQuiz() {
        currentQuestion = 0;
        score = 0;
        wrongAttempts = 0;
        answers = [];
        
        quizContainer.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        
        showQuestion();
        updateProgress();
        
        // Remove any existing confetti
        document.querySelectorAll('.confetti').forEach(el => el.remove());
    }
    
    function createConfetti() {
        const colors = ['#2196F3', '#4CAF50', '#FFC107', '#F44336', '#9C27B0'];
        const container = document.querySelector('.quiz-container');
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = confetti.style.width;
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            confetti.style.animationDelay = `${Math.random() * 1}s`;
            container.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }
});
