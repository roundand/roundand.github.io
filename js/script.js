
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// from https://d1wqtxts1xzle7.cloudfront.net/35686695/The_CBI_inventory-libre.pdf
const frequency = ["Always", "Often", "Sometimes", "Seldom", "Never"];
const intensity = ["To a very high degree", "To a high degree", "Somewhat", "To a low degree", "To a very low degree"];
var statements = [
    { group: "p", inverse: false, answers: frequency, text: "How often do you feel tired?" },
    { group: "p", inverse: false, answers: frequency, text: "How often are you physically exhausted?" },
    { group: "p", inverse: false, answers: frequency, text: "How often are you emotionally exhausted?" },
    { group: "p", inverse: false, answers: frequency, text: "How often do you think: 'I can’t take it anymore'?" },
    { group: "p", inverse: false, answers: frequency, text: "How often do you feel worn out?" },
    { group: "p", inverse: false, answers: frequency, text: "How often do you feel weak and susceptible to illness?" },
    { group: "w", inverse: false, answers: intensity, text: "Is your work emotionally exhausting?" },
    { group: "w", inverse: false, answers: intensity, text: "Do you feel burnt out because of your work?" },
    { group: "w", inverse: false, answers: intensity, text: "Does your work frustrate you?" },
    { group: "w", inverse: false, answers: frequency, text: "Do you feel worn out at the end of the working day?" },
    { group: "w", inverse: false, answers: frequency, text: "Are you exhausted in the morning at the thought of another day at work?" },
    { group: "w", inverse: false, answers: frequency, text: "Do you feel that every working hour is tiring for you?" },
    { group: "w", inverse: true, answers: frequency, text: "Do you have enough energy for family and friends during leisure time?" },
    { group: "c", inverse: false, answers: intensity, text: "Do you find it hard to work with clients?" },
    { group: "c", inverse: false, answers: intensity, text: "Do you find it frustrating to work with clients?" },
    { group: "c", inverse: false, answers: intensity, text: "Does it drain your energy to work with clients?" },
    { group: "c", inverse: false, answers: intensity, text: "Do you feel that you give more than you get back when you work with clients?" },
    { group: "c", inverse: false, answers: frequency, text: "Are you tired of working with clients?" },
    { group: "c", inverse: false, answers: frequency, text: "Do you sometimes wonder how long you will be able to continue working with clients?" }
];
shuffle(statements);
const statementsContainer = document.querySelector('#statementContainer');

// create a single question in its own div
function createQuestion(question, index) {
    let questionDiv = document.createElement('div'); 
    let questionLabel = document.createElement('label');
    questionLabel.innerHTML = question.text;
    questionLabel.dataset.group = `${question.group}`;
    questionLabel.classList.add('block', 'mb-1');
    questionDiv.appendChild(questionLabel);

    question.answers.forEach((answer, answerIndex) => {
        let radioButton = document.createElement('input');
        radioButton.setAttribute('type', 'radio');
        radioButton.setAttribute('required', '');
        radioButton.setAttribute('name', 'question' + index);
        radioButton.setAttribute('id', 'question' + index + 'x' + answerIndex);
        radioButton.setAttribute('value', question.inverse ? answerIndex * 25 : (question.answers.length - answerIndex - 1) * 25);

        let answerLabel = document.createElement('label');
        answerLabel.innerHTML = answer;
        answerLabel.htmlFor = radioButton.id;

        let answerDiv = document.createElement('div');
        answerDiv.classList.add('space-y-2', 'flex', 'flex-col');

        let optionDiv = document.createElement('div');
        optionDiv.appendChild(radioButton);
        optionDiv.appendChild(answerLabel);
        answerDiv.appendChild(optionDiv);
        questionDiv.appendChild(answerDiv);
    });

    return questionDiv;
}

statements.forEach((statement, index) => {
    const newStatement = createQuestion(statement, index);
    statementsContainer.appendChild(newStatement);
});

const form = document.getElementById('questionnaireForm');
const loading = document.getElementById('loading');
const output = document.getElementById('output');

// cut-offs as commonly listed, eg https://bmcpregnancychildbirth.biomedcentral.com/articles/10.1186/s12884-016-1212-5/tables/1 and https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9939042
function getCategory(average) {
    if (average < 50) {
        return "Healthy";
    } else if (average >= 50 && average < 75) {
        return "Moderate";
    } else if (average >= 75 && average < 100) {
        return "High";
    } else {
        return "Severe";
    }
}

function getColor(average) {
    if (average < 50) {
        return "bg-green-500";
    } else if (average >= 50 && average < 75) {
        return "bg-yellow-500";
    } else if (average >= 75 && average < 100) {
        return "bg-orange-500";
    } else {
        return "bg-red-500";
    }
}

function getContrastColor(average) {
    return average < 75 ? "black" : "blue";
}

function getAverageResponses(target, group) {
    const agreementLevels = Array.from(target.querySelectorAll(`label[data-group=${group}] ~ div input[type="radio"]:checked`)).map(input => parseInt(input.value));
    return agreementLevels.reduce((a, b) => a + b, 0) / agreementLevels.length;
}

function getOutput(e, group, groupName) {
    const average = getAverageResponses(e.target, group);
    const category = getCategory(average);
    const color = getColor(average);
    const contrastColor = getContrastColor(average);
    return `Your ${groupName} burnout level is <strong>${average.toFixed(2)}</strong>, which falls into the <span class="font-bold py-1 px-2 rounded ${color}" style="color:${contrastColor};" >${category}</span> category.`;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    output.innerHTML = "<p>" + getOutput(e, "p", "Personal") + " This applies to your overall level of burnout.</p>";
    output.innerHTML += "<p>" + getOutput(e, "w", "Work") + " This applies to your work environment.</p>";
    output.innerHTML += "<p>" + getOutput(e, "c", "Client") + " This applies to your relationship with clients, patients, students or the equivalent</p>";
});
