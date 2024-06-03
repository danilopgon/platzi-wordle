import { fromEvent } from "rxjs";

const letterRows = document.getElementsByClassName("letter-row");

const onKeyDown$ = fromEvent(document, "keydown");
let letterRowIndex = 0;
let letterIndex = 0;

const insertLetter = {
  next: (event) => {
    const pressedKey = event.key.toUpperCase();

    if (pressedKey.length === 1 && pressedKey.match(/[a-z]/i)) {
      const letterBox =
        Array.from(letterRows)[letterRowIndex].children[letterIndex];
      letterBox.textContent = pressedKey;
      letterBox.classList.add("filled-letter");
      letterIndex++;
    }
  },
};

const deleteLetter = {
  next: (event) => {
    const pressedKey = event.key;

    if (pressedKey === "Backspace") {
      letterIndex--;
      const letterBox =
        Array.from(letterRows)[letterRowIndex].children[letterIndex];
      letterBox.textContent = "";
      letterBox.classList.remove("filled-letter");
    }
  },
};

onKeyDown$.subscribe(insertLetter);
onKeyDown$.subscribe(deleteLetter);
