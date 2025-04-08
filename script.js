let currentQuiz = null;

async function sendMessage() {
  const userInput = document.getElementById("userInput");
  const chatbox = document.getElementById("chatbox");
  const userMessage = userInput.value.trim();
  if (userMessage === "") return;
  
  // Show user message
  const userDiv = document.createElement("div");
  userDiv.className = "user";
  userDiv.textContent = "You: " + userMessage;
  chatbox.appendChild(userDiv);
  
  // Bot is thinking...
  const botDiv = document.createElement("div");
  botDiv.className = "bot";
  botDiv.innerHTML = "Bot: thinking...";
  chatbox.appendChild(botDiv);
  
  const botResponse = await getBotResponse(userMessage);
  botDiv.innerHTML = "Bot: " + botResponse;
  
  userInput.value = "";
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function getBotResponse(input) {
  input = input.toLowerCase().trim();
  
  // Quiz
  if (input.includes("quiz") || input.includes("start quiz")) {
    const res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
    const data = await res.json();
    const q = data.results[0];
    const question = q.question;
    const correct = q.correct_answer;
    const choices = [...q.incorrect_answers, correct].sort(() => Math.random() - 0.5);
    
    currentQuiz = { correct: correct };
    
    const buttons = choices.map(c =>
      `<button onclick="checkQuizAnswer('${c.replace(/'/g, "\\'")}')">${c}</button>`
    ).join(" ");
    
    return `Quiz Time!<br>Q: ${question}<br>${buttons}`;
  }
  
  // Check quiz answer
  if (currentQuiz !== null) {
    return "Please choose an answer from the options above.";
  }
  
  // Number API
  if (input.includes("random number fact")) {
    const res = await fetch("http://numbersapi.com/random/trivia");
    return await res.text();
  }
  
  // Advice API
  if (input.includes("advice")) {
    const res = await fetch("https://api.adviceslip.com/advice");
    const data = await res.json();
    return data.slip.advice;
  }
  
  // Joke API
  if (input.includes("joke")) {
    const res = await fetch("https://official-joke-api.appspot.com/random_joke");
    const data = await res.json();
    return `${data.setup} — ${data.punchline}`;
  }
  
  //Country Info
  if (input.startsWith("country ")) {
    const country = input.replace("country ", "").trim();
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
    const data = await res.json();
    if (data && data[0]) {
      const info = data[0];
      return `Country: ${info.name.common}<br>Capital: ${info.capital}<br>Region: ${info.region}<br>Population: ${info.population}`;
    } else {
      return "Country not found.";
    }
  }
  
  // Wikipedia topic
  if (input.startsWith("explain")) {
    return await getWikipediaSummary(input);
  }
  
  // Food blog
  if (input.includes("curry") || input.includes("how to make food") || input.includes("cooking")) {
    return `Check out recipes on my blog: <a href="https://preparingfoodindia91.blogspot.com/" target="_blank">preparingfoodindia91</a>`;
  }
  
  // Greetings
  if (input.includes("hello") || input.includes("hi")) {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    else if (hour < 18) return "Good afternoon!";
    else return "Good evening!";
  }
  
  // Name
  if (input.includes("your name")) return "I'm a MSBchatbot!";
  
  // Time / Date
  if (input.includes("time") || input.includes("date")) {
    const now = new Date();
    return `It's currently ${now.toLocaleString()}`;
  }
  
  // Math solver
  if (/^\d+(\s*[\+\-\*\/]\s*\d+)+$/.test(input)) {
    try {
      return "The answer is: " + eval(input);
    } catch {
      return "That math looks tricky!";
    }
  }
  
  // Emotions
  if (input.includes("sad")) return "I'm here for you. Hope things get better.";
  if (input.includes("happy")) return "Yay! Stay awesome!";
  if (input.includes("angry")) return "Try to stay calm. You're doing great.";
  
  // Help
  if (input.includes("help") || input.includes("options")) {
    return `Try asking:
- "quiz" or "start quiz"
- "random number fact"
- "joke"
- "advice"
- "country India"
- "explain gravity"
- "5 + 2 * 3"
- "how to make curry"`;
  }
  
  return "I'm not sure how to respond to that. Try 'help' to see what I can do!";
}

// Quiz answer button check
function checkQuizAnswer(answer) {
  const chatbox = document.getElementById("chatbox");
  const isCorrect = answer === currentQuiz.correct;
  const result = document.createElement("div");
  result.className = "bot";
  result.textContent = isCorrect ?
    "Correct! Well done!" :
    `Oops! The correct answer was: ${currentQuiz.correct}`;
  chatbox.appendChild(result);
  currentQuiz = null;
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Wikipedia summary
async function getWikipediaSummary(input) {
  try {
    const topic = input.replace("explain", "").trim();
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
    const data = await res.json();
    return data.extract || "No summary available for that topic.";
  } catch {
    return "Something went wrong while getting info.";
  }
}