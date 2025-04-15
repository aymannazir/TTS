/************************************************************
 * UTILITY: DEBOUNCE
 *
 * This function delays invoking a function until after a
 * specified delay period—preventing excessive calls such as
 * auto-detecting language on every keystroke.
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
 *
 * Cache the key elements: text areas, control buttons, sliders,
 * modals, and the layout container.
 ************************************************************/
const textArea           = document.getElementById("text");
const highlightContainer = document.getElementById("highlightContainer");

const charCount      = document.getElementById("charCount");
const languageBox    = document.getElementById("languageDetectPopup");
// Tooltip box is defined but help icons will trigger a dedicated modal instead.
const tooltipBox     = document.getElementById("tooltipBox");

const helpModal      = document.getElementById("helpModal");
const helpClose      = document.getElementById("helpClose");
// New modal for help icons (displayed when a help icon is clicked)
const iconHelpModal  = document.getElementById("iconHelpModal");
const iconHelpClose  = document.getElementById("iconHelpClose");
const iconHelpCaption= document.getElementById("iconHelpCaption");

const largeBtnToggle = document.getElementById("largeBtnToggle");
const autoDetectCb   = document.getElementById("autoDetect");

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

// New: Switch Layout button and layout container for multiple layout options.
const switchLayoutBtn = document.getElementById("switchLayoutBtn");
const layoutContainer = document.getElementById("layoutContainer");

/************************************************************
 * SPEECH SYNTHESIS & VOICE SELECTION
 *
 * Initialize the SpeechSynthesis API and populate available
 * voices using our preferred settings. We support specific
 * voices for English (US & UK), Spanish, French, and Arabic.
 ************************************************************/
let synth  = window.speechSynthesis;
let voices = [];

// Desired voices by language and gender. Note: Names can vary by system.
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
      // Fallback: any voice matching the language prefix.
      matchedVoice = voices.find(v => v.lang.startsWith(desired.langPrefix));
    }
    if (matchedVoice) {
      const opt = document.createElement("option");
      opt.value = matchedVoice.name;
      opt.textContent = `${desired.label} (${matchedVoice.lang})`;
      languageSelect.appendChild(opt);
    }
  });
  // If no desired voices are found, list all available voices.
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
 * EVENT LISTENERS: SLIDERS, SELECTS, & LINE SPACING
 ************************************************************/
// Update speed, pitch, and volume display as user moves sliders.
// Also provide subtle warnings in the console if values are too high.
[speedSlider, pitchSlider, volumeSlider].forEach(slider => {
  slider.addEventListener("input", () => {
    speedVal.textContent = parseFloat(speedSlider.value).toFixed(2);
    pitchVal.textContent = parseFloat(pitchSlider.value).toFixed(2);
    volumeVal.textContent = parseFloat(volumeSlider.value).toFixed(2);
    
    if (parseFloat(pitchSlider.value) > 1.8) {
      console.warn("Warning: High pitch values may cause audio distortion or discomfort.");
    }
    if (parseFloat(volumeSlider.value) > 0.9) {
      console.warn("Warning: Volume levels near 1.0 can be very loud. Use with caution.");
    }
  });
});

// Font size controls: update displayed value and text area style.
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

// Line spacing control for improved readability.
lineSpacing.addEventListener("input", () => {
  lineSpacingVal.textContent = lineSpacing.value;
  textArea.style.lineHeight = lineSpacing.value;
});

/************************************************************
 * CHARACTER COUNT & AUTO-DETECT LANGUAGE
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
 * THEME, LARGE BUTTON, & LAYOUT SWITCH
 ************************************************************/
themeSelect.addEventListener("change", e => {
  document.body.className = e.target.value;
});

largeBtnToggle.addEventListener("change", () => {
  document.body.classList.toggle("large-buttons", largeBtnToggle.checked);
});

/*
 * Layout Switching:
 * Cycle among three modes:
 * Mode 0 (Default): Two columns with text area left, controls right.
 * Mode 1 (Stacked): Text area on top, controls underneath.
 * Mode 2 (Reversed): Columns swapped (controls left, text area right).
 */
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
});

/************************************************************
 * HELP MODAL (General Help Button)
 ************************************************************/
helpBtn.addEventListener("click", () => {
  helpModal.style.display = "flex";
});
helpClose.addEventListener("click", () => {
  helpModal.style.display = "none";
});

/************************************************************
 * HELP ICONS (Open Dedicated Icon Help Modal)
 *
 * When a help icon is clicked, open a dedicated modal with
 * context-specific help (instead of a tooltip).
 ************************************************************/
document.querySelectorAll(".help-icon").forEach(icon => {
  icon.addEventListener("click", (event) => {
    event.stopPropagation();
    iconHelpCaption.textContent = icon.dataset.tooltip || "No details provided.";
    iconHelpModal.style.display = "flex";
  });
});
if (iconHelpClose) {
  iconHelpClose.addEventListener("click", () => {
    iconHelpModal.style.display = "none";
  });
}

/************************************************************
 * CLEAR BUTTON
 *
 * Resets the text area, clears highlights, and resets UI state.
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
 * VOICE PREVIEW
 *
 * Plays a short preview of the selected voice using current settings.
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
 *
 * This function initiates speech synthesis with word-by-word
 * highlighting. It also sends text to the backend for translation
 * if needed and ensures that the highlight container copies over
 * user-defined styles (like font size and line spacing).
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
  // Send text to the backend for potential translation.
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
    startSpeaking(finalText);
  })
  .catch(err => {
    console.error("Speak error:", err);
    alert("Translation or speech generation failed.");
  });
});

function startSpeaking(text) {
  // Hide the text area and show the highlight container.
  textArea.style.display = "none";
  highlightContainer.style.display = "block";
  
  // Copy user-adjusted styles from the text area.
  const computedStyles = window.getComputedStyle(textArea);
  highlightContainer.style.fontSize = computedStyles.fontSize;
  highlightContainer.style.lineHeight = computedStyles.lineHeight;
  highlightContainer.style.fontFamily = computedStyles.fontFamily;
  
  // Split the text into paragraphs and maintain a global counter for words.
  let globalIndex = 0;
  let paragraphs = text.split(/\r?\n/);
  // Build HTML where each word is wrapped in a span with a unique global index.
  let html = paragraphs.map(paragraph => {
    // For empty paragraphs, just insert a line break.
    if (paragraph.trim() === "") {
      return "";
    }
    // Split the paragraph into words.
    let words = paragraph.split(/\s+/);
    let wordHtml = words.map(word => `<span id="word-${globalIndex++}">${word} </span>`).join("");
    return wordHtml;
  }).join("<br/>"); // Insert <br/> between paragraphs.
  
  highlightContainer.innerHTML = html;
  
  // Prepare the speech utterance.
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices.find(v => v.name === languageSelect.value) || voices[0];
  utterance.pitch = parseFloat(pitchSlider.value);
  utterance.rate = parseFloat(speedSlider.value);
  utterance.volume = parseFloat(volumeSlider.value);
  
  let wordIndex = 0;
  const baseDelay = 80;
  const adjustedDelay = baseDelay * (1 / parseFloat(speedSlider.value));
  
  // Use onboundary events to update word highlighting.
  utterance.onboundary = (event) => {
    if (event.name === "word") {
      const currentIndex = wordIndex;
      setTimeout(() => {
        // Remove any previous highlights.
        document.querySelectorAll(".highlighted").forEach(el => el.classList.remove("highlighted"));
        // Retrieve the corresponding span by the global word ID.
        const span = document.getElementById(`word-${currentIndex}`);
        if (span) {
          span.classList.add("highlighted");
          span.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, adjustedDelay);
      wordIndex++;
    }
  };
  
  utterance.onend = () => {
    // Clean up highlights and revert to the original view.
    document.querySelectorAll(".highlighted").forEach(el => el.classList.remove("highlighted"));
    statusMsg.textContent = "Finished.";
    textArea.style.display = "block";
    highlightContainer.style.display = "none";
  };
  
  // Start speaking.
  synth.speak(utterance);
  statusMsg.textContent = "Speaking...";
}



/************************************************************
 * PAUSE / RESUME / STOP CONTROLS
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
 *
 * Implements shortcuts: Space to toggle play/pause (if focus is not
 * in the text area), R to resume, Escape to stop, and Ctrl + Arrow
 * keys to adjust the font size.
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

/************************************************************
 * NOTE ON GRAMMAR CORRECTION:
 *
 * The browser's TTS engine reads text exactly as typed.
 * For grammatical corrections, consider integrating an external
 * text-correction API in the future.
 ************************************************************/
