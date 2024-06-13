import { merge, fromEvent, Subject, map, filter, takeUntil } from "rxjs";
import WORDS_LIST from "./wordList.json";

const restartButton = document.querySelector(".restart-button");
const letterRows = document.getElementsByClassName("letter-row");
const messageText = document.querySelector(".message-text");
const onKeyDown$ = fromEvent(document, "keydown");

let letterIndex;
let letterRowIndex;
let userAnswer;

const getRandomWord = () =>
  WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
let rightWord;

const didUserWinOrLose$ = new Subject();

const insertLetter$ = onKeyDown$.pipe(
  map((event) => event.key.toUpperCase()),
  filter(
    (pressedKey) =>
      pressedKey.length === 1 && pressedKey.match(/[a-z]/i) && letterIndex < 5
  )
);

const insertLetter = {
  next: (letter) => {
    let letterBox =
      Array.from(letterRows)[letterRowIndex].children[letterIndex];
    letterBox.textContent = letter;
    letterBox.classList.add("filled-letter");
    letterIndex++;
    userAnswer.push(letter);
  },
};

const checkWord$ = onKeyDown$.pipe(
  map((event) => event.key),
  filter((key) => key === "Enter" && letterRowIndex < 6)
);

const checkWord = {
  next: () => {
    if (userAnswer.length != 5) {
      messageText.textContent =
        userAnswer.length === 4
          ? "Te falta 1 letra"
          : `Te faltan ${5 - userAnswer.length} letras`;
      return;
    }

    messageText.textContent = "";

    userAnswer.map((_, i) => {
      let letterColor = "";
      let letterBox = letterRows[letterRowIndex].children[i];

      let letterPosition = rightWord.indexOf(userAnswer[i]);

      if (rightWord[i] === userAnswer[i]) {
        letterColor = "letter-green";
      } else if (letterPosition === -1) {
        letterColor = "letter-grey";
      } else {
        letterColor = "letter-yellow";
      }

      letterBox.classList.add(letterColor);
    });

    if (userAnswer.join("") === rightWord) {
      messageText.textContent = `😊 ¡Sí! La palabra ${rightWord.toUpperCase()} es la correcta`;
      didUserWinOrLose$.next();
      restartButton.disabled = false;
    } else {
      letterIndex = 0;
      letterRowIndex++;
      userAnswer = [];

      if (letterRowIndex === 6) {
        messageText.textContent = `😔 Perdiste. La palabra correcta era: "${rightWord.toUpperCase()}"`;
        didUserWinOrLose$.next();
        restartButton.disabled = false;
      }
    }
  },
};

const removeLetter$ = onKeyDown$.pipe(
  map((event) => event.key),
  filter((key) => key === "Backspace" && letterIndex !== 0)
);

const removeLetter = {
  next: () => {
    let letterBox = letterRows[letterRowIndex].children[userAnswer.length - 1];
    letterBox.textContent = "";
    letterBox.classList = "letter";
    letterIndex--;
    userAnswer.pop();
  },
};

const onRestartClick$ = fromEvent(restartButton, "click");
const onWindowLoad$ = fromEvent(window, "load");
const restartGame$ = merge(onWindowLoad$, onRestartClick$);

restartGame$.subscribe(() => {
  Array.from(letterRows).map((row) =>
    Array.from(row.children).map((letterBox) => {
      letterBox.textContent = "";
      letterBox.classList = "letter";
    })
  );

  letterRowIndex = 0;
  letterIndex = 0;
  userAnswer = [];
  messageText.textContent = "";
  rightWord = getRandomWord();

  restartButton.disabled = true;

  console.log(`Right word: ${rightWord}`);

  let insertLetterSubscription = insertLetter$
    .pipe(takeUntil(didUserWinOrLose$))
    .subscribe(insertLetter);
  let checkWordSubscription = checkWord$
    .pipe(takeUntil(didUserWinOrLose$))
    .subscribe(checkWord);
  let removeLetterSubscription = removeLetter$
    .pipe(takeUntil(didUserWinOrLose$))
    .subscribe(removeLetter);

  didUserWinOrLose$.subscribe(() => {
    insertLetterSubscription.unsubscribe();
    checkWordSubscription.unsubscribe();
    removeLetterSubscription.unsubscribe();
  });
});
