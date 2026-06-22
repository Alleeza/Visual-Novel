const sceneTitle = document.querySelector("#scene-title");
const speakerName = document.querySelector("#speaker-name");
const dialogueText = document.querySelector("#dialogue-text");
const dialogueBox = document.querySelector(".dialogue-box");
const dialogueLog = document.querySelector("#dialogue-log");
const choiceList = document.querySelector("#choice-list");
const continueButton = document.querySelector("#continue-button");
const restartButton = document.querySelector("#restart-button");

let gameData = null;
let currentScene = null;
let currentLineIndex = 0;

async function startGame() {
  try {
    const response = await fetch("data/scenes.json");

    if (!response.ok) {
      throw new Error(`Could not load scenes.json: ${response.status}`);
    }

    gameData = await response.json();
    loadScene(gameData.startScene);
  } catch (error) {
    showError(error);
  }
}

function loadScene(sceneId) {
  const nextScene = gameData.scenes[sceneId];

  if (!nextScene) {
    throw new Error(`Scene "${sceneId}" does not exist.`);
  }

  currentScene = nextScene;
  currentLineIndex = 0;
  dialogueLog.innerHTML = "";
  choiceList.innerHTML = "";
  sceneTitle.textContent = currentScene.title;
  showCurrentLine();
}

function showCurrentLine() {
  const line = currentScene.lines[currentLineIndex];

  if (!line) {
    showChoicesOrEnd();
    return;
  }

  const character = getCharacter(line.speaker);
  dialogueBox.style.setProperty("--speaker-color", character.color);
  speakerName.textContent = character.name;
  dialogueText.textContent = line.text;
  continueButton.classList.remove("hidden");
  choiceList.innerHTML = "";
}

function advanceLine() {
  const line = currentScene.lines[currentLineIndex];

  if (line) {
    addLineToLog(line);
  }

  currentLineIndex += 1;
  showCurrentLine();
}

function showChoicesOrEnd() {
  continueButton.classList.add("hidden");
  speakerName.textContent = "";
  dialogueText.textContent = currentScene.endText ?? "End of scene.";
  dialogueBox.style.removeProperty("--speaker-color");
  choiceList.innerHTML = "";

  if (!currentScene.choices || currentScene.choices.length === 0) {
    return;
  }

  currentScene.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.type = "button";
    button.textContent = choice.text;
    button.addEventListener("click", () => {
      try {
        loadScene(choice.nextScene);
      } catch (error) {
        showError(error);
      }
    });
    choiceList.append(button);
  });
}

function addLineToLog(line) {
  const character = getCharacter(line.speaker);
  const entry = document.createElement("p");
  const tag = document.createElement("span");

  entry.className = "log-line";
  entry.style.setProperty("--character-color", character.color);
  tag.className = "log-speaker";
  tag.textContent = `${character.name}: `;

  entry.append(tag, document.createTextNode(line.text));
  dialogueLog.append(entry);
  dialogueLog.scrollTop = dialogueLog.scrollHeight;
}

function getCharacter(characterId) {
  const character = gameData.characters[characterId];

  if (!character) {
    return {
      name: characterId,
      color: "#ffffff",
    };
  }

  return character;
}

function showError(error) {
  sceneTitle.textContent = "Scene failed to load";
  speakerName.textContent = "System";
  dialogueText.textContent = error.message;
  dialogueBox.style.setProperty("--speaker-color", "#ff6b6b");
  choiceList.innerHTML = "";
  continueButton.classList.add("hidden");
}

continueButton.addEventListener("click", advanceLine);
restartButton.addEventListener("click", () => {
  try {
    loadScene(gameData.startScene);
  } catch (error) {
    showError(error);
  }
});

startGame();
