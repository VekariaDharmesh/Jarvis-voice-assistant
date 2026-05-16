const API_BASE = "http://localhost:8000/api";
const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const liveBtn = document.getElementById('live-btn');
const greetingText = document.getElementById('greeting-text');
const cpuValue = document.getElementById('cpu-value');
const cpuBar = document.getElementById('cpu-bar');
const memValue = document.getElementById('mem-value');
const memBar = document.getElementById('mem-bar');

let history = [];
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let isLiveMode = false;
let audioContext;
let analyser;
let animationFrameId;

// --- GREETING LOGIC ---
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    greetingText.textContent = `${greeting}, Dharmesh.`;
}
updateGreeting();

// --- UI HELPERS ---
function addMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-message' : 'jarvis-message'}`;
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    if (isUser) {
        content.textContent = `> ${text}`;
        msgDiv.appendChild(content);
        chatLog.appendChild(msgDiv);
    } else {
        // AI Message: Render Markdown + Typewriter Effect
        msgDiv.appendChild(content);
        chatLog.appendChild(msgDiv);
        
        const rawHtml = marked.parse(text);
        
        if (text.length > 500) {
            content.innerHTML = rawHtml;
            Prism.highlightAllUnder(content);
        } else {
            content.innerHTML = "";
            let currentText = "";
            const words = text.split(" ");
            let wordIdx = 0;
            
            const typeWord = () => {
                if (wordIdx < words.length) {
                    currentText += words[wordIdx] + " ";
                    content.innerHTML = marked.parse(currentText);
                    wordIdx++;
                    setTimeout(typeWord, 30);
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                } else {
                    Prism.highlightAllUnder(content);
                }
            };
            typeWord();
        }
    }
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    history.push({ role: isUser ? "user" : "assistant", content: text });
    if (history.length > 20) history.shift();
}

// --- API COMMUNICATION ---
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    userInput.value = '';
    addMessage(message, true);
    
    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: history.slice(0, -1) })
        });
        const data = await response.json();
        addMessage(data.response, false);
    } catch (error) {
        addMessage("Cognitive link unstable. Reconnecting...", false);
    }
}

// --- VOICE LOGIC ---
async function toggleRecording(isLive = false) {
    if (isRecording) {
        stopRecording();
        if (isLive) isLiveMode = false;
    } else {
        isLiveMode = isLive;
        await startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            await sendVoiceCommand(audioBlob);
            
            if (isLiveMode) {
                // Wait 2 seconds before restarting to avoid catching self-echo from speakers
                setTimeout(() => {
                    if (isLiveMode) startRecording();
                }, 2000);
            }
            
            stream.getTracks().forEach(t => t.stop());
        };

        mediaRecorder.start();
        isRecording = true;
        
        // --- SILENCE DETECTION ---
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let lastSoundTime = Date.now();
        const SILENCE_THRESHOLD = 35; // Sensitivity threshold
        const SILENCE_DURATION = 1500; // MS of silence before processing

        const checkSilence = () => {
            if (!isRecording) return;
            
            analyser.getByteFrequencyData(dataArray);
            let maxVol = 0;
            for (let i = 0; i < bufferLength; i++) {
                if (dataArray[i] > maxVol) maxVol = dataArray[i];
            }

            if (maxVol > SILENCE_THRESHOLD) {
                lastSoundTime = Date.now();
            } else if (Date.now() - lastSoundTime > SILENCE_DURATION) {
                stopRecording();
                return;
            }
            animationFrameId = requestAnimationFrame(checkSilence);
        };
        checkSilence();

        if (isLiveMode) liveBtn.classList.add('active');
        else micBtn.classList.add('active');

        const micIcon = micBtn.querySelector('i');
        if (micIcon) micIcon.setAttribute('data-lucide', 'square');
        lucide.createIcons();
        
    } catch (err) {
        console.error("Mic Error:", err);
        addMessage(`Mic access failed: ${err.message}. Please ensure you are using localhost and have granted permission in browser settings.`, false);
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // Clean up silence detection
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (audioContext) audioContext.close();
        
        micBtn.classList.remove('active');
        liveBtn.classList.remove('active');
        
        const micIcon = micBtn.querySelector('i');
        if (micIcon) micIcon.setAttribute('data-lucide', 'mic');
        lucide.createIcons();
    }
}

async function sendVoiceCommand(blob) {
    const formData = new FormData();
    formData.append('audio', blob, 'command.wav');

    try {
        const response = await fetch(`${API_BASE}/voice`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.transcription) addMessage(data.transcription, true);
        addMessage(data.response, false);
    } catch (error) {
        console.error("Voice Error:", error);
    }
}

// --- SYSTEM METRICS ---
async function updateStats() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        cpuValue.textContent = `${Math.round(data.cpu_usage)}%`;
        memValue.textContent = `${Math.round(data.memory_usage)}%`;
        cpuBar.style.width = `${data.cpu_usage}%`;
        memBar.style.width = `${data.memory_usage}%`;
    } catch (e) {}
}
setInterval(updateStats, 2000);
updateStats();

// --- EVENT LISTENERS ---
sendBtn.addEventListener('click', sendMessage);
micBtn.addEventListener('click', () => toggleRecording(false));
liveBtn.addEventListener('click', () => toggleRecording(true));

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
