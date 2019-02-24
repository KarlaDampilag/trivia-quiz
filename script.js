var questions = [];
var userAnswers = [];
var correctAnswers = [];
var numCorrectAnswers;

var questionsContainer = document.getElementById("form");

var selectedTopic = document.getElementById("topic");
var selectedDifficulty = document.getElementById("difficulty");

var selectedType;
var typeRadioButtons = document.getElementsByName("type");
var multipleChoice = typeRadioButtons[0];
var trueOrFalse = typeRadioButtons[1];
	
multipleChoice.checked ? selectedType = "multiple" : selectedType = "boolean";

//generate the questions - the default category is general knowledge, the default difficulty is easy, the default type is multiple choice
start();

selectedTopic.addEventListener("change", function() {
	start();
});

selectedDifficulty.addEventListener("change", function() {
	start();
});

multipleChoice.addEventListener("change", function() {
	selectedType = multipleChoice.value;
	start();
});

trueOrFalse.addEventListener("change", function() {
	selectedType = trueOrFalse.value;
	start();
});

function start() {
	//reset the array that holds the correct answers (it might be holding answers of a previous category, etc)
	while(correctAnswers.length > 0) {
		  correctAnswers.pop();
	}

	let request = new XMLHttpRequest();
	let url = 'https://opentdb.com/api.php?amount=10&category=' + selectedTopic.value + '&difficulty=' + selectedDifficulty.value + '&type=' + selectedType;

	request.open('GET',  url , true);
	request.onload = function () {
		if (request.status >= 200 && request.status < 400 ) {
			let json = JSON.parse(this.response);
			questions = json.results;

			clearCanvas();

			if(questions.length < 1) {
				let failPar = document.createElement("p");
				failPar.innerHTML = "No questions available. Please try another difficulty or question type.";
				failPar.className = "fail_par";
				questionsContainer.appendChild(failPar);
			} else {
				generateContent(false); //false means the user hasn't submitted the form yet

				let submitBtn = document.createElement("button");
				submitBtn.className = "btn btn-primary btn-lg";
				submitBtn.innerHTML = "Submit and View Results";
				questionsContainer.appendChild(submitBtn);
			}
		} else {
			console.log('Error fetching the API.');
		}
	}

	request.send();
			
}

function clearCanvas() {
	while(questionsContainer.lastChild) {
		questionsContainer.removeChild(questionsContainer.lastChild);
	}
}

/**
 * @desc If answered, generate results after the questions. If not, generate the radio buttons for the user to answer.
 * @param boolean answered - true if user submitted the form, false otherwise.
*/
function generateContent(answered) {
	//clear the div first, for a fresh "canvas"
	clearCanvas(); 

	//reset number of correct answers
	numCorrectAnswers = 0;

	for (let i = 0; i < questions.length; i++) {
		let question = questions[i];

		let questionDiv = document.createElement("div");
		questionDiv.className = "question_container";

		let questionPar = document.createElement("p");
		questionPar.innerHTML = i + 1 + ". " + question.question;

		questionDiv.appendChild(questionPar);

		if(answered) {
			let resultPar = document.createElement("p");

			if (correctAnswers[i] === userAnswers[i]) {
				resultPar.style.color = "green";
				resultPar.innerHTML = "Your answer: " + userAnswers[i] + ". That's correct!";
				numCorrectAnswers++;
			} else {
				resultPar.style.color = "red";
				resultPar.innerHTML = "Your answer: " + userAnswers[i] + ". Correct answer: " + correctAnswers[i];
			}

			questionDiv.appendChild(resultPar);
				
		} else {
			let possibleAnswers = question.incorrect_answers;
			possibleAnswers.push(question.correct_answer);
				
			//shuffle all the answers in the array (the purpose is to mix in the correct answer with the incorrect answers, so that it won't always be the last item in the array)
			if(selectedType === "multiple") {
				shuffleArray(possibleAnswers);
			}

			correctAnswers.push(question.correct_answer);

			let row = document.createElement("div");
			row.className = "row";
			questionDiv.appendChild(row);
				
			for (option of possibleAnswers) {
				let col = document.createElement("div");
				col.className = "col-sm-3";

				let radioBtn = document.createElement("input");
				radioBtn.type = "radio";
				radioBtn.name = "option" + (i + 1);
				radioBtn.value = option;
				radioBtn.required = true;
				let optionText = document.createElement("label");
				optionText.innerHTML = option;

				col.appendChild(radioBtn);
				col.appendChild(optionText);
				row.appendChild(col);
			}
		}

		questionsContainer.appendChild(questionDiv);
	}
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
	    const j = Math.floor(Math.random() * (i + 1));
	    [array[i], array[j]] = [array[j], array[i]];
	}
}

questionsContainer.addEventListener("submit", function(e) {
	e.preventDefault();
	collectAnswers();
	displayResults();
});

function collectAnswers() {
	let itemsCollection = document.getElementsByClassName("question_container");
	let selectedAnswer;

	for(let i = 0; i <= itemsCollection.length; i++) {
		let options = document.getElementsByName("option" + i);

		for (let c = 0; c < options.length; c++) {
			if (options[c].checked) {
				selectedAnswer = options[c].value;
				userAnswers.push(selectedAnswer);
			}
		}
	}
}

function displayResults() {
	generateContent(true); //true means the user submitted the form

	let finalResult = document.createElement("p");
	finalResult.innerHTML = "You got " + numCorrectAnswers + " correct answer/s out of 10 questions."
	finalResult.className = "result_par";

	let tryAgain = document.createElement("button");
	tryAgain.innerHTML = "Try Again";
	tryAgain.className = "btn btn-primary btn-lg";
	tryAgain.onclick = function() {window.location.reload();};

	questionsContainer.appendChild(finalResult);
	questionsContainer.appendChild(tryAgain);
}