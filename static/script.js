/************************************************************
 * UTILITY: DEBOUNCE
 ************************************************************/
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/************************************************************
 * DOM REFERENCES
 ************************************************************/
const textArea           = document.getElementById("text");
const highlightContainer = document.getElementById("highlightContainer");

const charCount      = document.getElementById("charCount");
const languageBox    = document.getElementById("languageDetectPopup");
const helpModal      = document.getElementById("helpModal");
const helpClose      = document.getElementById("helpClose");
const iconHelpModal  = document.getElementById("iconHelpModal");
const iconHelpClose  = document.getElementById("iconHelpClose");
const iconHelpCaption= document.getElementById("iconHelpCaption");
const tooltipBox     = document.getElementById("tooltipBox");

const largeBtnToggle = document.getElementById("largeBtnToggle");
const autoDetectCb   = document.getElementById("autoDetect");
const showRecentsCb  = document.getElementById("showRecents");

const fontSlider     = document.getElementById("fontSlider");
const fontSliderVal  = document.getElementById("fontSliderVal");
const fontSizeSelect = document.getElementById("fontSize");
const lineSpacing    = document.getElementById("lineSpacing");
const lineSpacingVal = document.getElementById("lineSpacingVal");

const speedSlider    = document.getElementById("speed");
const speedVal       = document.getElementById("speedVal");
const volumeSlider   = document.getElementById("volume");
const volumeVal      = document.getElementById("volumeVal");
const pitchSlider    = document.getElementById("pitch");
const pitchVal       = document.getElementById("pitchVal");
const languageSelect = document.getElementById("language");

const speakBtn       = document.getElementById("speakBtn");
const pauseBtn       = document.getElementById("pauseBtn");
const resumeBtn      = document.getElementById("resumeBtn");
const stopBtn        = document.getElementById("stopBtn");
const clearBtn       = document.getElementById("clearBtn");
const previewBtn     = document.getElementById("previewBtn");
const statusMsg      = document.getElementById("statusMsg");

const themeSelect    = document.getElementById("themeSelect");
const helpBtn        = document.getElementById("helpBtn");
const audioPreview   = document.getElementById("audioPreview");

const switchLayoutBtn  = document.getElementById("switchLayoutBtn");
const layoutContainer  = document.getElementById("layoutContainer");

/** Futuristic Save/Load Buttons **/
const saveFavoriteBtn  = document.getElementById("saveFavoriteBtn");
const loadFavoriteBtn  = document.getElementById("loadFavoriteBtn");

/** Recents Stuff **/
const showRecents      = document.getElementById("showRecents");
const recentsContainer = document.getElementById("recentsContainer");
const recentsList      = document.getElementById("recentsList");

/************************************************************
 * RECENT TEXTS
 ************************************************************/
let recentTexts = JSON.parse(localStorage.getItem("recentTexts") || "[]");
const MAX_RECENTS = 5;

// Populate recents in the DOM
function populateRecents() {
  recentsList.innerHTML = "";
  recentTexts.forEach((textItem, idx) => {
    const li = document.createElement("li");
    li.classList.add("recent-item");

    // Text snippet that user can click to load
    const snippet = document.createElement("span");
    snippet.classList.add("recent-snippet");
    snippet.textContent = textItem.length > 30 
      ? (textItem.substring(0, 30) + "...")
      : textItem;
    
    snippet.addEventListener("click", () => {
      textArea.value = textItem;
      charCount.textContent = `${textItem.length} / 1500`;
    });

    // Trash icon to delete a single item
    const trash = document.createElement("button");
    trash.classList.add("trash-icon");
    trash.innerHTML = `<i class="fas fa-trash"></i>`;
    trash.title = "Delete this recent entry";
    trash.addEventListener("click", () => {
      // Remove from array
      recentTexts = recentTexts.filter(t => t !== textItem);
      localStorage.setItem("recentTexts", JSON.stringify(recentTexts));
      populateRecents();
    });

    li.appendChild(snippet);
    li.appendChild(trash);
    recentsList.appendChild(li);
  });
}

// Initial fill
populateRecents();

// Toggle recents visibility
showRecentsCb.addEventListener("change", () => {
  if (showRecentsCb.checked) {
    recentsContainer.classList.remove("recents-hidden");
    recentsContainer.classList.add("recents-shown");
  } else {
    recentsContainer.classList.remove("recents-shown");
    recentsContainer.classList.add("recents-hidden");
  }
});

function saveToRecents(newText) {
  if (!newText.trim()) return;
  // Remove any duplicates
  recentTexts = recentTexts.filter(t => t !== newText);
  // Insert at front
  recentTexts.unshift(newText);
  // Limit
  if (recentTexts.length > MAX_RECENTS) {
    recentTexts.pop();
  }
  // Save and refresh
  localStorage.setItem("recentTexts", JSON.stringify(recentTexts));
  populateRecents();
}

/************************************************************
 * FAVORITE SETTINGS
 ************************************************************/
function futuristicFlash(button, msg) {
  const originalText = button.textContent;
  button.textContent = msg;
  button.classList.add("flash-success");
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("flash-success");
  }, 1500);
}

function saveFavoriteSettings() {
  const fav = {
    voice: languageSelect.value,
    pitch: pitchSlider.value,
    speed: speedSlider.value,
    volume: volumeSlider.value,
    fontSize: fontSlider.value
  };
  localStorage.setItem("favoriteSettings", JSON.stringify(fav));
  futuristicFlash(saveFavoriteBtn, "Saved!");
}

function loadFavoriteSettings() {
  const fav = JSON.parse(localStorage.getItem("favoriteSettings"));
  if (!fav) {
    futuristicFlash(loadFavoriteBtn, "No Saved!");
    return;
  }
  // Apply them
  languageSelect.value = fav.voice;
  pitchSlider.value = fav.pitch;
  pitchVal.textContent = parseFloat(fav.pitch).toFixed(2);
  speedSlider.value = fav.speed;
  speedVal.textContent = parseFloat(fav.speed).toFixed(2);
  volumeSlider.value = fav.volume;
  volumeVal.textContent = parseFloat(fav.volume).toFixed(2);
  fontSlider.value = fav.fontSize;
  fontSliderVal.textContent = `${fav.fontSize}px`;
  textArea.style.fontSize = `${fav.fontSize}px`;
  futuristicFlash(loadFavoriteBtn, "Loaded!");
}

saveFavoriteBtn.addEventListener("click", saveFavoriteSettings);
loadFavoriteBtn.addEventListener("click", loadFavoriteSettings);

/************************************************************
 * SPEECH SYNTHESIS SETUP
 ************************************************************/
let synth  = window.speechSynthesis;
let voices = [];

const desiredVoices = [
  { label: "English (US) - Male",   langPrefix: "en-US", nameSubstr: "Microsoft David" },
  { label: "English (US) - Female", langPrefix: "en-US", nameSubstr: "Zira" },
  { label: "English (UK) - Male",   langPrefix: "en-GB", nameSubstr: "George" },
  { label: "English (UK) - Female", langPrefix: "en-GB", nameSubstr: "Hazel" },
  { label: "Spanish - Male",        langPrefix: "es-",   nameSubstr: "Miguel" },
  { label: "Spanish - Female",      langPrefix: "es-",   nameSubstr: "Lucia" },
  { label: "French - Male",         langPrefix: "fr-",   nameSubstr: "Didier" },
  { label: "French - Female",       langPrefix: "fr-",   nameSubstr: "Virginie" },
  { label: "Arabic - Male",         langPrefix: "ar-",   nameSubstr: "Naayf" },
  { label: "Arabic - Female",       langPrefix: "ar-",   nameSubstr: "Zahra" }
];

function populateVoices() {
  voices = synth.getVoices();
  languageSelect.innerHTML = "";

  desiredVoices.forEach(desired => {
    let matchedVoice = voices.find(v =>
      v.lang.startsWith(desired.langPrefix) &&
      v.name.toLowerCase().includes(desired.nameSubstr.toLowerCase())
    );
    if (!matchedVoice) {
      matchedVoice = voices.find(v => v.lang.startsWith(desired.langPrefix));
    }
    if (matchedVoice) {
      const opt = document.createElement("option");
      opt.value = matchedVoice.name;
      opt.textContent = `${desired.label} (${matchedVoice.lang})`;
      languageSelect.appendChild(opt);
    }
  });
  if (!languageSelect.options.length) {
    voices.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      languageSelect.appendChild(opt);
    });
  }
}

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}
populateVoices();

/************************************************************
 * RANGE SLIDERS & FONTS
 ************************************************************/
[speedSlider, pitchSlider, volumeSlider].forEach(slider => {
  slider.addEventListener("input", () => {
    speedVal.textContent = parseFloat(speedSlider.value).toFixed(2);
    pitchVal.textContent = parseFloat(pitchSlider.value).toFixed(2);
    volumeVal.textContent = parseFloat(volumeSlider.value).toFixed(2);
  });
});

fontSlider.addEventListener("input", () => {
  fontSliderVal.textContent = `${fontSlider.value}px`;
  textArea.style.fontSize = `${fontSlider.value}px`;
});
fontSizeSelect.addEventListener("change", () => {
  const size = parseInt(fontSizeSelect.value);
  fontSlider.value = size;
  fontSliderVal.textContent = `${size}px`;
  textArea.style.fontSize = `${size}px`;
});

lineSpacing.addEventListener("input", () => {
  lineSpacingVal.textContent = lineSpacing.value;
  textArea.style.lineHeight = lineSpacing.value;
});

/************************************************************
 * AUTO-DETECT LANGUAGE
 ************************************************************/
textArea.addEventListener("input", () => {
  const length = textArea.value.length;
  charCount.textContent = `${length} / 1500`;
  charCount.classList.toggle("limit-reached", length >= 1500);

  if (autoDetectCb.checked && textArea.value.trim()) {
    debouncedDetectLanguage(textArea.value);
  } else {
    languageBox.style.display = "none";
  }
});

const debouncedDetectLanguage = debounce((text) => {
  fetch("/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  })
  .then(res => res.json())
  .then(data => {
    if (data.language) {
      languageBox.textContent = `Detected: ${data.language}`;
      const rect = textArea.getBoundingClientRect();
      languageBox.style.top = `${rect.bottom + window.scrollY + 5}px`;
      languageBox.style.left = `${rect.left + 10}px`;
      languageBox.style.display = "block";
    }
  })
  .catch(err => {
    console.error("Auto-detect error:", err);
    languageBox.style.display = "none";
  });
}, 600);

/************************************************************
 * THEME, LARGE BUTTON & LAYOUT SWITCH
 ************************************************************/
themeSelect.addEventListener("change", e => {
  document.body.className = e.target.value;
});

largeBtnToggle.addEventListener("change", () => {
  document.body.classList.toggle("large-buttons", largeBtnToggle.checked);
});

let layoutMode = 0;
switchLayoutBtn.addEventListener("click", () => {
  layoutMode = (layoutMode + 1) % 3;
  layoutContainer.classList.remove("layout-default", "layout-stack", "layout-reverse");
  if (layoutMode === 0) {
    layoutContainer.classList.add("layout-default");
  } else if (layoutMode === 1) {
    layoutContainer.classList.add("layout-stack");
  } else {
    layoutContainer.classList.add("layout-reverse");
  }
  // RESET TEXTAREA SIZE so no collision
  textArea.style.removeProperty("width");
  textArea.style.removeProperty("height");
});

/************************************************************
 * HELP MODALS
 ************************************************************/
helpBtn.addEventListener("click", () => {
  helpModal.style.display = "flex";
});
helpClose.addEventListener("click", () => {
  helpModal.style.display = "none";
});

document.querySelectorAll(".help-icon").forEach(icon => {
  icon.addEventListener("click", (event) => {
    event.stopPropagation();
    iconHelpCaption.textContent = icon.dataset.tooltip || "No details provided.";
    iconHelpModal.style.display = "flex";
  });
});
iconHelpClose.addEventListener("click", () => {
  iconHelpModal.style.display = "none";
});

/************************************************************
 * CLEAR BUTTON
 ************************************************************/
clearBtn.addEventListener("click", () => {
  textArea.value = "";
  charCount.textContent = "0 / 1500";
  languageBox.style.display = "none";
  statusMsg.textContent = "Cleared.";
  synth.cancel();
  textArea.style.display = "block";
  highlightContainer.style.display = "none";
});

/************************************************************
 * PREVIEW BUTTON
 ************************************************************/
previewBtn.addEventListener("click", () => {
  const utterance = new SpeechSynthesisUtterance("This is a preview of the selected voice.");
  utterance.voice = voices.find(v => v.name === languageSelect.value) || voices[0];
  utterance.pitch = parseFloat(pitchSlider.value);
  utterance.rate = parseFloat(speedSlider.value);
  utterance.volume = parseFloat(volumeSlider.value);
  synth.speak(utterance);
});

/************************************************************
 * SPEAK & HIGHLIGHT
 ************************************************************/
speakBtn.addEventListener("click", () => {
  const rawText = textArea.value.trim();
  if (!rawText) {
    alert("Please enter some text first.");
    return;
  }
  if (synth.speaking) {
    synth.cancel();
  }
  // Possibly translate
  fetch("/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: rawText,
      language: languageSelect.value,
      autoDetect: autoDetectCb.checked
    })
  })
  .then(res => res.json())
  .then(result => {
    const finalText = result.text || rawText;
    // Save to recents
    saveToRecents(rawText);
    startSpeaking(finalText);
  })
  .catch(err => {
    console.error("Speak error:", err);
    alert("Translation or speech generation failed.");
  });
});

function startSpeaking(text) {
  textArea.style.display = "none";
  highlightContainer.style.display = "block";

  const computed = window.getComputedStyle(textArea);
  highlightContainer.style.fontSize = computed.fontSize;
  highlightContainer.style.lineHeight = computed.lineHeight;
  highlightContainer.style.fontFamily = computed.fontFamily;

  let globalIndex = 0;
  let paragraphs = text.split(/\r?\n/);

  let html = paragraphs.map(paragraph => {
    if (paragraph.trim() === "") return "";
    let words = paragraph.split(/\s+/);
    let wordHtml = words.map(word => `<span id="word-${globalIndex++}">${word} </span>`).join("");
    return wordHtml;
  }).join("<br/>");
  highlightContainer.innerHTML = html;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices.find(v => v.name === languageSelect.value) || voices[0];
  utterance.pitch = parseFloat(pitchSlider.value);
  utterance.rate = parseFloat(speedSlider.value);
  utterance.volume = parseFloat(volumeSlider.value);

  let wordIndex = 0;
  const baseDelay = 80;
  const adjustedDelay = baseDelay * (1 / parseFloat(speedSlider.value));

  utterance.onboundary = (event) => {
    if (event.name === "word") {
      const current = wordIndex;
      setTimeout(() => {
        document.querySelectorAll(".highlighted").forEach(el => el.classList.remove("highlighted"));
        const span = document.getElementById(`word-${current}`);
        if (span) {
          span.classList.add("highlighted");
          span.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, adjustedDelay);
      wordIndex++;
    }
  };

  utterance.onend = () => {
    document.querySelectorAll(".highlighted").forEach(el => el.classList.remove("highlighted"));
    statusMsg.textContent = "Finished.";
    textArea.style.display = "block";
    highlightContainer.style.display = "none";
  };

  synth.speak(utterance);
  statusMsg.textContent = "Speaking...";
}

/************************************************************
 * PAUSE, RESUME & STOP
 ************************************************************/
pauseBtn.addEventListener("click", () => {
  synth.pause();
  statusMsg.textContent = "Paused.";
});
resumeBtn.addEventListener("click", () => {
  synth.resume();
  statusMsg.textContent = "Resumed.";
});
stopBtn.addEventListener("click", () => {
  synth.cancel();
  statusMsg.textContent = "Stopped.";
  textArea.style.display = "block";
  highlightContainer.style.display = "none";
});

/************************************************************
 * KEYBOARD SHORTCUTS
 ************************************************************/
document.addEventListener("keydown", e => {
  if (e.key === " " && document.activeElement !== textArea) {
    e.preventDefault();
    synth.paused ? synth.resume() : synth.pause();
  }
  if (e.key === "r" && !synth.paused && synth.speaking) {
    e.preventDefault();
    synth.resume();
  }
  if (e.key === "Escape") {
    synth.cancel();
    textArea.style.display = "block";
    highlightContainer.style.display = "none";
  }
  if (e.ctrlKey && e.key === "ArrowUp") {
    const newVal = Math.min(32, parseInt(fontSlider.value) + 2);
    fontSlider.value = newVal;
    fontSlider.dispatchEvent(new Event("input"));
  }
  if (e.ctrlKey && e.key === "ArrowDown") {
    const newVal = Math.max(12, parseInt(fontSlider.value) - 2);
    fontSlider.value = newVal;
    fontSlider.dispatchEvent(new Event("input"));
  }
});
