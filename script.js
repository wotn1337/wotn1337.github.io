import { WORDS } from "./words.js";

const green = "#95de64";
const white = "white";
const gray = "#d9d9d9";
const pink = "#ff85c0";

const toast = (message, type) => {
  toastr[type](message, undefined, {
    toastClass: 'notification toast', 
  });
}

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
let hintText = '';
const urlParams = new URLSearchParams(window.location.search);
const wordIndex = urlParams.get('word');
const words = [
  {word: "лампа", hint: 'Возможно, это светиться'},
  {word: "вилка", hint: 'Помогает покушать'},
  {word: "трусы", hint: 'у меня их почти миллион'},
  {word: "ключи", hint: 'У меня всегда с собой, а ты никогда не берешь. Возможно, кстати, множественное число'},
  {word: "доска", hint: 'Там полно бунбумсиков'},
  {word: "книга", hint:'Там многа букав'},
  {word: "алиса", hint: 'Возможно, это имя собственное'},
  {word: "носок", hint: 'Их по одному не носят'},
  {word: "карта", hint: 'Тинькофф или Сбер или Синара или Альфа'}, 
  {word: "колье", hint: 'У тебя пока этого нет'}
];
if (wordIndex !== undefined && wordIndex !== null) {
  rightGuessString = words[+wordIndex].word;
  hintText = words[+wordIndex].hint;
}

console.log(rightGuessString);

function initBoard() {
  let board = document.getElementById("game-board");

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }

    board.appendChild(row);
  }
}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor;
      if (oldColor === green) {
        return;
      }

      if (oldColor === white && color !== green) {
        return;
      }

      elem.style.backgroundColor = color;
      elem.style.borderColor = color;
      if (color === white) {
        elem.style.color = pink;
      } else {
        elem.style.color = white;
      }
      break;
    }
  }
}

function deleteLetter() {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter - 1];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
  nextLetter -= 1;
}

function checkGuess() {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let guessString = "";
  let rightGuess = Array.from(rightGuessString);

  for (const val of currentGuess) {
    guessString += val;
  }

  if (guessString.length != 5) {
    toast("Букав маловато!", 'error');
    return;
  }

  if (!WORDS.includes(guessString)) {
    toast("Нет такого слова :(", 'error');
    return;
  }

  var letterColor = [gray, gray, gray, gray, gray];

  //check #95de64
  for (let i = 0; i < 5; i++) {
    if (rightGuess[i] == currentGuess[i]) {
      letterColor[i] = green;
      rightGuess[i] = "#";
    }
  }

  //check #fff566
  //checking guess letters
  for (let i = 0; i < 5; i++) {
    if (letterColor[i] == green) continue;

    //checking right letters
    for (let j = 0; j < 5; j++) {
      if (rightGuess[j] == currentGuess[i]) {
        letterColor[i] = white;
        rightGuess[j] = "#";
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    let box = row.children[i];
    let delay = 250 * i;
    setTimeout(() => {
      //flip box
      animateCSS(box, "flipInX");
      //shade box
      box.style.backgroundColor = letterColor[i];
      box.style.borderColor = letterColor[i];
      if (letterColor[i] === white) {
        box.style.color = pink;
      }
      shadeKeyBoard(guessString.charAt(i) + "", letterColor[i]);
    }, delay);
  }

  if (guessString === rightGuessString) {
    toast("Ну ты капец умная!", 'success');
    guessesRemaining = 0;
    return;
  } else {
    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
      toast(`Правильное слово: "${rightGuessString}"`, 'info');
      toast("Ну капец! Попытки закончились :(", 'error');
    } else if (guessesRemaining === 4) {
      const hintLink = document.querySelector('.hint-link');
      hintLink.style.display = 'block';
      hintLink.addEventListener('click', () => {
        const hint = document.querySelector('.hint');
        hint.innerHTML = hintText;
        hint.style.display = 'block';
      })
    }
  }
}

function insertLetter(pressedKey) {
  if (nextLetter === 5) {
    return;
  }
  pressedKey = pressedKey.toLowerCase();

  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter];
  animateCSS(box, "pulse");
  box.textContent = pressedKey;
  box.classList.add("filled-box");
  currentGuess.push(pressedKey);
  nextLetter += 1;
}

const animateCSS = (element, animation, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element;
    node.style.setProperty("--animate-duration", "0.3s");

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });

document.addEventListener("keyup", (e) => {
  if (guessesRemaining === 0) {
    return;
  }

  let pressedKey = String(e.key);
  if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter();
    return;
  }

  if (pressedKey === "Enter") {
    checkGuess();
    return;
  }

  let found = pressedKey.match(/[а-яё]/gi);
  if (!found || found.length > 1) {
    return;
  } else {
    insertLetter(pressedKey);
  }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("keyboard-button")) {
    return;
  }
  let key = target.textContent;

  if (key === "←") {
    key = "Backspace";
  }
  if (key === 'enter') {
    key = "Enter";
  }

  document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

initBoard();
