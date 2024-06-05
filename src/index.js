import { Subject, fromEvent } from "rxjs";
import WORDS_LIST from "./wordList.json";

const letterRows = document.getElementsByClassName("letter-row");

const onKeyDown$ = fromEvent(document, "keydown");

const messageText = document.querySelector(".message-text");

let letterRowIndex = 0;
let letterIndex = 0;
let userAnswer = [];

const getRandomWord = () => {
  return WORDS_LIST[Math.round(Math.random() * WORDS_LIST.length)];
};
const correctWord = getRandomWord();
console.log(correctWord);

const didUserWin$ = new Subject();

const insertLetter = {
  next: (event) => {
    const pressedKey = event.key.toUpperCase();

    if (
      pressedKey.length === 1 &&
      pressedKey.match(/[a-z]/i) &&
      letterIndex < 5
    ) {
      const letterBox =
        Array.from(letterRows)[letterRowIndex].children[letterIndex];
      letterBox.textContent = pressedKey;
      letterBox.classList.add("filled-letter");
      userAnswer.push(pressedKey);
      letterIndex++;
    }
  },
};

const deleteLetter = {
  next: (event) => {
    const pressedKey = event.key;

    if (pressedKey === "Backspace" && letterIndex !== 0) {
      letterIndex--;
      userAnswer.pop();
      const letterBox =
        Array.from(letterRows)[letterRowIndex].children[letterIndex];
      letterBox.textContent = "";
      letterBox.classList.remove("filled-letter");
    }
  },
};

const checkWord = {
  next: (event) => {
    if (event.key === "Enter") {
      const correctWordArray = Array.from(correctWord);

      if (userAnswer.length !== 5) {
        messageText.textContent = "¡Te faltan letras!"
        return;
      }

      if (correctWord === userAnswer.join("")) {
        didUserWin$.next();
      }

      for (let i = 0; i < 5; i++) {
        let letterColor = "";
        let letterBox = Array.from(letterRows)[letterRowIndex].children[i];
        console.log(letterBox);
        let letterPosition = Array.from(correctWord).indexOf(userAnswer[i]);
        console.log(letterPosition);

        if (letterPosition === -1) {
          letterColor = "letter-grey";
        } else {
          if (correctWordArray[i] === userAnswer[i]) {
            letterColor = "letter-green";
          } else {
            letterColor = "letter-yellow";
          }
        }

        letterBox.classList.add(letterColor);
      }

      if (userAnswer.length === 5) {
        letterIndex = 0;
        userAnswer = [];
        letterRowIndex++;
      }
    }
  },
};

onKeyDown$.subscribe(insertLetter);
onKeyDown$.subscribe(deleteLetter);
onKeyDown$.subscribe(checkWord);

didUserWin$.subscribe(() => {
  const letterRowsWon = Array.from(letterRows)[letterRowIndex];
  for (let i = 0; i < 5; i++) {
    letterRowsWon.children[i].classList.add("letter-green");
  }
});
