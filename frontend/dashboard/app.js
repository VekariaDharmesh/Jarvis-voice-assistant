/* ==========================================================================
   JARVIS OS DYNAMIC WORKSPACE INTEGRATION
   Product-centric architecture inspired by Linear and Cursor
   ========================================================================== */

const API_BASE = "http://localhost:8000/api";

// --- STATE MANAGEMENT ---
let appState = {
    projects: [],
    tasks: [],
    notes: "",
    activeAgent: "Default",
    activeProject: "ScholarWeb",
    history: [],
    focusItems: []
};

// --- AGENTS CONFIGURATION ---
const AGENTS = {
    "Default": {
        name: "Jarvis Core",
        avatar: "🤖",
        desc: "A highly scalable personal AI assistant customized to run automation tasks, orchestrate code development pipelines, and manage system operations.",
        context: "Executing system instructions in passive standby loop. Direct access to developer tool executors is active.",
        activity: ["Connected to local host server", "System diagnostic clean", "Whisper models online"]
    },
    "Frontend Engineer": {
        name: "Frontend Engineer",
        avatar: "🎨",
        desc: "A frontend engineering specialist. Expert in design tokens, premium UI responsiveness, custom scrollbars, animations, and clean semantic layouts.",
        context: "Awaiting CSS specifications. WebGL and Flexbox layout pipelines primed.",
        activity: ["React router mapped", "Optimized index.css structures", "Custom scrollbars active"]
    },
    "Backend Engineer": {
        name: "Backend Engineer",
        avatar: "⚙️",
        desc: "A robust systems and microservices architect. Designs highly secure restful endpoints, structured schema validations, and parallel task processors.",
        context: "Awaiting API blueprints. FastAPI uvicorn threads ready.",
        activity: ["Database pooling optimized", "Async endpoints registered", "Pydantic validator schemas compiled"]
    },
    "UI/UX Designer": {
        name: "UI/UX Designer",
        avatar: "✨",
        desc: "A specialist in high-end sleek aesthetics, human factors, ergonomic padding, and modern dark-slate SaaS visual languages.",
        context: "Reviewing layout constraints. Harmonious palettes calculated.",
        activity: ["Color tokens configured", "Grid ratios balanced", "Hover micro-animations verified"]
    },
    "Database Architect": {
        name: "Database Architect",
        avatar: "🗄️",
        desc: "An optimization specialist in transactional queries, relational indexing constraints, composite key indexes, and performance pipelines.",
        context: "Awaiting schema declarations. Connection channels initialized.",
        activity: ["Composite indexes prepared", "JSONB columns declared", "Foreign key constraints enforced"]
    },
    "DevOps Engineer": {
        name: "DevOps Engineer",
        avatar: "🚀",
        desc: "A specialist in continuous integration, Docker image layer optimization, nginx reverse proxies, and production-grade deployments.",
        context: "Deployment pipeline standby. Docker container environments ready.",
        activity: ["Nginx proxy routed", "Vercel serverless functions warm", "Container layers minimized"]
    },
    "Cloud Engineer": {
        name: "Cloud Engineer",
        avatar: "☁️",
        desc: "An infrastructure engineer designing serverless networks, cloud triggers, optimized API gateways, and distributed event-driven message queues.",
        context: "Telemetry engines active. Lambda worker processes monitoring.",
        activity: ["Cost analytics generated", "SQS event triggers set", "S3 object buckets secured"]
    },
    "Technical Writer": {
        name: "Technical Writer",
        avatar: "📝",
        desc: "A developer documentation specialist. Formats clean READMEs, markdown structures, Sphinx documentations, and interactive tutorial blocks.",
        context: "Drafting specs repository. Markdown engines compiled.",
        activity: ["API documentation drafted", "Readme structures revised", "Inline code explanations formatted"]
    }
};

// --- DOM ELEMENTS SELECTOR ---
const viewSections = document.querySelectorAll('.view-section');
const navItems = document.querySelectorAll('.nav-item');
const breadcrumbParent = document.getElementById('breadcrumb-parent');
const breadcrumbCurrent = document.getElementById('breadcrumb-current');
const leftSidebar = document.getElementById('left-sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const rightAgentPanel = document.getElementById('right-agent-panel');
const rightPanelToggleBtn = document.getElementById('right-panel-toggle');

const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const liveBtn = document.getElementById('live-btn');
const chatLog = document.getElementById('chat-log');
const clearChatBtn = document.getElementById('clear-chat-btn');
const greetingText = document.getElementById('greeting-text');
const stopAiBtn = document.getElementById('stop-ai-btn');

let chatAbortController = null;

// Home views elements
const sidebarFocusList = document.getElementById('sidebar-focus-list');
const sidebarFocusInput = document.getElementById('sidebar-focus-input');
const sidebarFocusAddBtn = document.getElementById('sidebar-focus-add-btn');
const focusProgressBar = document.getElementById('focus-progress-bar');
const focusProgressLabel = document.getElementById('focus-progress-label');
const homeRecentProjectsContainer = document.getElementById('home-recent-projects-container');

// Project Views
const allProjectsGrid = document.getElementById('all-projects-grid');
const newProjectBtn = document.getElementById('new-project-btn');
const projectModal = document.getElementById('project-modal');
const closeProjectModal = document.getElementById('close-project-modal');
const cancelProjectModal = document.getElementById('cancel-project-modal');
const submitProjectModal = document.getElementById('submit-project-modal');

// Operations & Today's Command Queue selectors
const queueCritical = document.getElementById('queue-critical');
const queueImportant = document.getElementById('queue-important');
const queueScheduled = document.getElementById('queue-scheduled');
const queueCompleted = document.getElementById('queue-completed');
const operationsMatrixContainer = document.getElementById('operations-matrix-container');
const newTaskInput = document.getElementById('new-task-input');
const createTaskBoardBtn = document.getElementById('create-task-board-btn');

// Agent selection
const agentsSelectionGrid = document.getElementById('agents-selection-grid');
const restoreAgentDefault = document.getElementById('restore-agent-default');

// Notes notepad
const notesTextarea = document.getElementById('notes-textarea');
const saveNotesBtn = document.getElementById('save-notes-btn');
const notesSaveStatus = document.getElementById('notes-save-status');

// Settings Panel
const settingsUsername = document.getElementById('settings-username');
const settingsEditor = document.getElementById('settings-editor');
const settingsUseLocal = document.getElementById('settings-use-local');
const settingsLocalUrl = document.getElementById('settings-local-url');
const saveSettingsBtn = document.getElementById('save-settings-btn-panel');
const sidebarSettingsBtn = document.getElementById('sidebar-settings-btn');
const goToProjectsBtn = document.getElementById('go-to-projects-btn');

// Memory System Selectors
const settingsMemoryInput = document.getElementById('settings-memory-input');
const addMemoryBtn = document.getElementById('add-memory-btn');
const settingsMemoryList = document.getElementById('settings-memory-list');

const sidebarMemoryInput = document.getElementById('sidebar-memory-input');
const sidebarAddMemoryBtn = document.getElementById('sidebar-add-memory-btn');
const sidebarMemoryList = document.getElementById('sidebar-memory-list');

// --- INIT APP ---
document.addEventListener('DOMContentLoaded', async () => {
    updateWelcomeHeader();
    initSpeechSynthesis();
    initSpeechRecognition();
    setupEventListeners();
    await loadDashboardData();
    renderFocusList();
    renderAgentGrid();
    updateActiveAgentUI("Default");
    await loadMemoryFacts();
    
    // Immersive audible greeting on startup
    setTimeout(() => {
        speakText("Welcome Dharmesh");
    }, 1000);
});

// --- HELPER: Welcome Headers & Dates ---
function updateWelcomeHeader() {
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateLabel = document.getElementById('current-date-label');
    if (dateLabel) {
        dateLabel.textContent = now.toLocaleDateString('en-US', options);
    }
    
    if (greetingText) {
        const hour = now.getHours();
        let periodGreeting = "Good morning";
        if (hour >= 12 && hour < 17) {
            periodGreeting = "Good afternoon";
        } else if (hour >= 17 && hour < 22) {
            periodGreeting = "Good evening";
        } else if (hour >= 22 || hour < 5) {
            periodGreeting = "Good night";
        }
        greetingText.textContent = `${periodGreeting}, Dharmesh`;
    }
}

// --- CORE: Fetch & Sync Dashboard Data ---
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        if (!response.ok) throw new Error("Failed to load dashboard payload");
        const data = await response.json();
        
        appState.projects = data.projects || [];
        appState.tasks = data.tasks || [];
        appState.notes = data.notes || "";
        
        // Render panels
        renderRecentProjects();
        renderProjectsGrid();
        renderTasksKanban();
        
        // Load note editor
        if (notesTextarea) {
            notesTextarea.value = appState.notes;
            notesSaveStatus.textContent = "Draft Synced";
            notesSaveStatus.style.color = "var(--accent-green)";
        }
        updateAnalyticsUI();
        
    } catch (err) {
        console.error("Dashboard Sync Error:", err);
    }
}

// --- CORE: Navigation Routing logic ---
function switchView(viewName) {
    // 1. Manage Sidebar Toggles
    navItems.forEach(item => {
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 2. Manage Section Visibility
    viewSections.forEach(section => {
        if (section.id === `view-${viewName}`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    // 3. Update Breadcrumb Text
    breadcrumbCurrent.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);
    breadcrumbParent.textContent = "JARVIS";

    // 4. Specific Action on View Mount
    if (viewName === 'notes') {
        notesTextarea.focus();
    }
    
    // Auto collapse left sidebar if on mobile screens
    if (window.innerWidth < 768) {
        leftSidebar.classList.add('collapsed');
    }
}

function setupEventListeners() {
    // Nav bar routing
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');
            switchView(view);
        });
    });

    // Sidebarsettings link
    if (sidebarSettingsBtn) {
        sidebarSettingsBtn.addEventListener('click', () => switchView('settings'));
    }

    // "All Projects" row button
    if (goToProjectsBtn) {
        goToProjectsBtn.addEventListener('click', () => switchView('projects'));
    }

    // Sidebar collapse action
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => {
            leftSidebar.classList.toggle('collapsed');
        });
    }

    // Right Agent collapse panel action
    if (rightPanelToggleBtn) {
        rightPanelToggleBtn.addEventListener('click', () => {
            rightAgentPanel.classList.toggle('collapsed');
        });
    }

    // AI chat send buttons
    sendBtn.addEventListener('click', () => submitQuery());
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitQuery();
        }
    });

    // Clear chat console
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            chatLog.innerHTML = "";
            appState.history = [];
            document.querySelector('.ai-command-center')?.classList.remove('expanded');
            appendChatMessage("Jarvis Core", "Conversation cache cleared. All standby executors online.", "jarvis-message");
        });
    }

    // Stop active AI speech or execution
    if (stopAiBtn) {
        stopAiBtn.addEventListener('click', () => {
            // 1. Cancel network fetch
            if (chatAbortController) {
                chatAbortController.abort();
            }
            // 2. Stop browser speech synthesis voice output
            if (synth) {
                synth.cancel();
            }
            // 3. Disable continuous listening if active so it doesn't auto-resume
            if (isLiveListening) {
                isLiveListening = false;
                liveBtn.classList.remove('active');
                liveBtn.querySelector('i').style.color = "";
            }

            // 4. Hide stop button
            stopAiBtn.style.display = "none";

            // 5. Update active thinking bubble
            const placeholders = document.querySelectorAll('[id^="thinking-"]');
            placeholders.forEach(el => {
                const inner = el.querySelector('.message-content');
                if (inner) inner.innerHTML = `<span style="color: var(--accent-red); font-style: italic;">Generation cancelled by user.</span>`;
                el.id = "";
            });

            appendChatMessage("System OS", "AI response generation and speech synthesis terminated by user.", "jarvis-message");
        });
    }

    // Keyboard Shortcuts palette Cmd+K
    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            userInput.focus();
            userInput.select();
        }
    });

    // Dynamic prompt tags
    document.querySelectorAll('.example-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const promptText = tag.getAttribute('data-prompt');
            userInput.value = promptText;
            userInput.focus();
            submitQuery(promptText);
        });
    });

    // Dynamic quick action cards
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', () => {
            const promptText = card.getAttribute('data-prompt');
            userInput.value = promptText;
            userInput.focus();
            submitQuery(promptText);
        });
    });

    // Focus priorities controls
    sidebarFocusAddBtn.addEventListener('click', () => addFocusItem());
    sidebarFocusInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addFocusItem();
    });

    // Projects modals triggers
    newProjectBtn.addEventListener('click', () => projectModal.classList.remove('hidden'));
    closeProjectModal.addEventListener('click', () => projectModal.classList.add('hidden'));
    cancelProjectModal.addEventListener('click', () => projectModal.classList.add('hidden'));
    submitProjectModal.addEventListener('click', () => submitCreateProject());

    // Kanban tasks creations
    createTaskBoardBtn.addEventListener('click', () => createKanbanTask());
    newTaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') createKanbanTask();
    });

    // Reset Agent Persona
    if (restoreAgentDefault) {
        restoreAgentDefault.addEventListener('click', () => activateAgent("Default"));
    }

    // Notepad controls manual save
    saveNotesBtn.addEventListener('click', () => triggerManualNotesSave());
    setupNotesAutoSaveDebounce();

    // Configuration Panels save
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => saveConfigSettings());
    }

    // Memory facts input controls
    if (addMemoryBtn) {
        addMemoryBtn.addEventListener('click', () => addMemoryFact(false));
    }
    if (settingsMemoryInput) {
        settingsMemoryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addMemoryFact(false);
        });
    }
    if (sidebarAddMemoryBtn) {
        sidebarAddMemoryBtn.addEventListener('click', () => addMemoryFact(true));
    }
    if (sidebarMemoryInput) {
        sidebarMemoryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addMemoryFact(true);
        });
    }

    // Mobile Responsive Navigation Handlers
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            leftSidebar.classList.toggle('collapsed');
        });
    }

    // Auto-close menu drawer when clicking outside it on mobile screens
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768) {
            if (leftSidebar && !leftSidebar.contains(e.target) && !leftSidebar.classList.contains('collapsed')) {
                leftSidebar.classList.add('collapsed');
            }
        }
    });
}

// --- SPEECH SYSTEM (BROWSER VOICE TTS) ---
let synth = window.speechSynthesis;
let speakActive = true;

function initSpeechSynthesis() {
    if (!synth) {
        console.warn("Browser Speech Synthesis not supported.");
        return;
    }
    // Cancel ongoing speech if page reloads
    synth.cancel();
}

function speakText(text) {
    if (!synth || !speakActive) {
        isAIVoiceProcessing = false;
        if (isLiveListening) setTimeout(startSpeechRecognition, 500);
        return;
    }
    
    // Stop any currently spoken responses
    synth.cancel();

    // Sanitize response formatting: Strip code blocks and markdown symbols before feeding to Speech Synthesis
    const cleanText = text
        .replace(/```[\s\S]*?```/g, '') // remove code blocks
        .replace(/`([^`]+)`/g, '$1')     // remove inline code formatting
        .replace(/[*#_\-\+>]/g, '')     // remove markdown syntax characters
        .replace(/https?:\/\/[^\s]+/g, 'link') // replace URL with the word "link"
        .trim();

    if (!cleanText) {
        isAIVoiceProcessing = false;
        if (isLiveListening) setTimeout(startSpeechRecognition, 500);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05; // Slightly faster to sound productive and natural
    utterance.pitch = 1.0;

    // Retrieve default English system voice - prioritized for premium male voices (e.g. Daniel, Alex, David)
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && 
        (v.name.includes('Daniel') || v.name.includes('Alex') || v.name.toLowerCase().includes('male') || v.name.includes('David'))) ||
        voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    // Show stop button during speech
    utterance.onstart = () => {
        if (stopAiBtn) stopAiBtn.style.display = "inline-flex";
    };

    // Synchronize Live Continuous Listening mode
    utterance.onend = () => {
        if (stopAiBtn) stopAiBtn.style.display = "none";
        isAIVoiceProcessing = false; // Complete processing state
        if (isLiveListening) {
            setTimeout(startSpeechRecognition, 400); // Automatically reactive next question listen
        }
    };

    utterance.onerror = () => {
        if (stopAiBtn) stopAiBtn.style.display = "none";
        isAIVoiceProcessing = false; // Complete processing state
        if (isLiveListening) {
            setTimeout(startSpeechRecognition, 400);
        }
    };

    synth.speak(utterance);
}

// --- SPEECH RECOGNITION SYSTEM (VOICE STT) ---
let recognition = null;
let isListening = false;
let isLiveListening = false;
let isAIVoiceProcessing = false; // Hands-free State Machine indicator

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Speech recognition interface not detected in browser.");
        if (micBtn) {
            micBtn.style.opacity = "0.5";
            micBtn.title = "Mic not supported on this browser";
        }
        if (liveBtn) {
            liveBtn.style.opacity = "0.5";
        }
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let voiceSubmitTimer = null;

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('active');
        const micIcon = micBtn.querySelector('i, svg');
        if (micIcon) micIcon.style.color = "var(--accent-red)";
        userInput.placeholder = "Listening continuously... speak freely...";
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('active');
        const micIcon = micBtn.querySelector('i, svg');
        if (micIcon) micIcon.style.color = "";
        userInput.placeholder = "Ask Jarvis anything...";
        
        // Auto resume Continuous listening if live is toggled on and voice isn't speaking or processing
        if (isLiveListening && !synth.speaking && !isAIVoiceProcessing) {
            setTimeout(startSpeechRecognition, 500);
        }
    };

    recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        const currentText = finalTranscript || interimTranscript;
        if (currentText.trim()) {
            userInput.value = currentText;
            
            // Dynamic silence detection (1.4 seconds proper pause threshold)
            // Allows the developer to speak without limits, then submits as quick as possible
            clearTimeout(voiceSubmitTimer);
            voiceSubmitTimer = setTimeout(() => {
                const queryText = userInput.value.trim();
                if (queryText) {
                    isAIVoiceProcessing = true; // Lock active state machine
                    submitQuery(queryText);
                    recognition.stop(); // Stop listening during AI processing
                }
            }, 1400);
        }
    };

    recognition.onerror = (e) => {
        console.error("Speech Recognition Error:", e.error);
        if (e.error === 'not-allowed') {
            isLiveListening = false;
            liveBtn.classList.remove('active');
            const liveIcon = liveBtn.querySelector('i, svg');
            if (liveIcon) liveIcon.style.color = "";
            appendChatMessage("System Diagnostic", "Microphone access denied. Enable permissions in settings.", "jarvis-message");
        }
    };

    // Bind triggers
    micBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            startSpeechRecognition();
        }
    });

    liveBtn.addEventListener('click', () => {
        isLiveListening = !isLiveListening;
        if (isLiveListening) {
            liveBtn.classList.add('active');
            const liveIcon = liveBtn.querySelector('i, svg');
            if (liveIcon) liveIcon.style.color = "var(--accent-green)";
            startSpeechRecognition();
            appendChatMessage("System OS", "Continuous Voice Mode enabled. Jarvis will auto-listen.", "jarvis-message");
        } else {
            liveBtn.classList.remove('active');
            const liveIcon = liveBtn.querySelector('i, svg');
            if (liveIcon) liveIcon.style.color = "";
            if (recognition) recognition.stop();
            synth.cancel();
            appendChatMessage("System OS", "Continuous Voice Mode disabled.", "jarvis-message");
        }
    });
}

function startSpeechRecognition() {
    if (recognition && !isListening) {
        try {
            recognition.start();
        } catch (e) {
            console.error("Failed starting STT Recognition loop:", e);
        }
    }
}

async function handleSidebarNaturalLanguageCommands(prompt) {
    const lower = prompt.toLowerCase().trim();
    
    // 1. Focus command intercept
    const focusRegex = /^(?:add\s+)?(?:today\s+)?focus\s+(?:on\s+|item\s+)?(.+)/i;
    const focusMatch = prompt.match(focusRegex);
    if (focusMatch && !lower.startsWith("add project") && !lower.startsWith("create project") && !lower.startsWith("deploy project") && !lower.startsWith("add note") && !lower.startsWith("write note")) {
        const focusText = focusMatch[1].trim();
        appState.focusItems.push({ text: focusText, completed: false });
        saveFocusItemsToStorage();
        renderFocusList();
        
        const responseText = `I have successfully registered and added your new daily focus priority, sir: **"${focusText}"**. Standing by for active operations.`;
        appendChatMessage("Jarvis Core", responseText, "jarvis-message", true);
        speakText("Focus priority added successfully, Dharmesh.");
        return true;
    }
    
    // 2. Notes command intercept
    const notesRegex = /^(?:add\s+|write\s+|save\s+|append\s+)?note\s+(?:that\s+|to\s+|content\s+)?(.+)/i;
    const notesMatch = prompt.match(notesRegex);
    if (notesMatch) {
        const noteText = notesMatch[1].trim();
        if (notesTextarea) {
            const currentVal = notesTextarea.value.trim();
            notesTextarea.value = currentVal ? `${currentVal}\n\n- ${noteText}` : `- ${noteText}`;
            await saveNotesContentToServer();
        }
        
        const responseText = `Understood. I have logged that entry into your system notes, sir: *"${noteText}"*. The logs are synchronized with your persistent backup.`;
        appendChatMessage("Jarvis Core", responseText, "jarvis-message", true);
        speakText("Note successfully saved, Dharmesh.");
        return true;
    }
    
    // 3. Projects command intercept
    const projectRegex = /^(?:add\s+|create\s+|deploy\s+)project\s+([a-zA-Z0-9\s\-_]+)(?:\s+with\s+stack\s+(.+))?/i;
    const projectMatch = prompt.match(projectRegex);
    if (projectMatch) {
        const pName = projectMatch[1].trim();
        const pStackRaw = projectMatch[2] ? projectMatch[2].trim() : "JavaScript, HTML, CSS";
        const techStack = pStackRaw.split(',').map(s => s.trim());
        
        const newProjectPayload = {
            id: pName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: pName,
            lastUpdated: "Just now",
            status: "active",
            techStack: techStack,
            progress: {
                "Frontend": "in_progress",
                "Backend": "pending",
                "Database": "pending"
            }
        };
        
        try {
            const response = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProjectPayload)
            });
            if (response.ok) {
                await loadDashboardData();
            }
        } catch (e) {
            console.error("Create Project Natural Command Error:", e);
        }
        
        const responseText = `New project workspace deployed, sir: **"${pName}"** with tech stack *[${techStack.join(', ')}]* has been successfully initialized in your active workspace registry.`;
        appendChatMessage("Jarvis Core", responseText, "jarvis-message", true);
        speakText(`Project ${pName} deployed successfully, Dharmesh.`);
        return true;
    }
    
    return false;
}

// --- CHAT INTERACTION ENGINE ---
async function submitQuery(overridePrompt = null) {
    const prompt = (overridePrompt || userInput.value).trim();
    if (!prompt) return;

    // Reset fields
    userInput.value = "";

    // 1. Append User Bubble
    appendChatMessage("You", prompt, "user-message");

    // Intercept and process local natural language system commands
    const commandIntercepted = await handleSidebarNaturalLanguageCommands(prompt);
    if (commandIntercepted) {
        return;
    }

    // 2. Add Thinking placeholder
    const thinkingId = "thinking-" + Date.now();
    appendThinkingMessage(thinkingId);

    // Instantiate AbortController for cancelable requests
    chatAbortController = new AbortController();
    const signal = chatAbortController.signal;

    // Show stop button since request started
    if (stopAiBtn) stopAiBtn.style.display = "inline-flex";

    try {
        // Build server request payload
        const reqPayload = {
            message: prompt,
            history: appState.history
        };

        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reqPayload),
            signal: signal
        });

        if (!response.ok) throw new Error("Local Ollama Server failed response");
        const data = await response.json();

        // 3. Remove Thinking placeholder
        document.getElementById(thinkingId)?.remove();

        // Hide stop button if voice is disabled (otherwise speakText utterance.onstart manages it)
        if (stopAiBtn && (!synth || !speakActive)) stopAiBtn.style.display = "none";

        // 4. Append Assistant Response Bubble (Rendered in Markdown)
        appendChatMessage("Jarvis Core", data.response, "jarvis-message", true);

        // 5. Trigger WebTTS Voice Speech synthesis
        speakText(data.response);

        // 6. Update Chat history
        appState.history.push({ role: "user", content: prompt });
        appState.history.push({ role: "assistant", content: data.response });
        if (appState.history.length > 20) {
            appState.history = appState.history.slice(-20);
        }

    } catch (e) {
        isAIVoiceProcessing = false; // Reset blocker state
        if (isLiveListening) setTimeout(startSpeechRecognition, 500);
        
        if (e.name === 'AbortError') {
            console.log("Fetch request aborted successfully.");
            return;
        }
        document.getElementById(thinkingId)?.remove();
        if (stopAiBtn) stopAiBtn.style.display = "none";
        appendChatMessage("System Connection", `Instant answer routing error: ${e.message}. Please verify uvicorn daemon is running on port 8000.`, "jarvis-message");
        console.error("Chat Call Error:", e);
    }
}

function appendChatMessage(sender, text, className, isMarkdown = false) {
    const msgElement = document.createElement('div');
    msgElement.className = `message ${className}`;
    
    // Smoothly expand AI Command Center chatbox size once active chatting starts
    const commandCenter = document.querySelector('.ai-command-center');
    if (commandCenter && sender !== "Jarvis Core" && !commandCenter.classList.contains('expanded')) {
        commandCenter.classList.add('expanded');
    }
    
    const contentBox = document.createElement('div');
    contentBox.className = 'message-content';

    if (isMarkdown && window.marked) {
        contentBox.innerHTML = marked.parse(text);
        // Highlight code block lines
        contentBox.querySelectorAll('pre code').forEach((el) => {
            if (window.Prism) Prism.highlightElement(el);
        });
    } else {
        contentBox.textContent = text;
    }

    msgElement.appendChild(contentBox);
    chatLog.appendChild(msgElement);
    
    // Smooth scroll down
    chatLog.scrollTop = chatLog.scrollHeight;
}

function appendThinkingMessage(id) {
    const msgElement = document.createElement('div');
    msgElement.className = `message jarvis-message`;
    msgElement.id = id;
    
    const contentBox = document.createElement('div');
    contentBox.className = 'message-content';
    contentBox.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Thinking...</span>`;
    
    msgElement.appendChild(contentBox);
    chatLog.appendChild(msgElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// --- DYNAMIC CHECKLIST: Today's Focus Priorities ---
function loadFocusItemsFromStorage() {
    const rawData = localStorage.getItem('jarvis_focus_items');
    if (rawData) {
        try {
            appState.focusItems = JSON.parse(rawData);
        } catch (e) {
            appState.focusItems = [];
        }
    } else {
        // Fallback default checklist priorities
        appState.focusItems = [
            { text: "Redesign front-end dashboard UI", completed: true },
            { text: "Deploy local llama3.2 model", completed: true },
            { text: "Implement browser speech engine", completed: false },
            { text: "Connect notes markdown integration", completed: false }
        ];
        saveFocusItemsToStorage();
    }
}

function saveFocusItemsToStorage() {
    localStorage.setItem('jarvis_focus_items', JSON.stringify(appState.focusItems));
}

function renderFocusList() {
    loadFocusItemsFromStorage();
    sidebarFocusList.innerHTML = "";
    
    if (appState.focusItems.length === 0) {
        sidebarFocusList.innerHTML = `<p style="font-size:11px; color:var(--text-muted); padding:10px 0;">No priorities set. Add focus below.</p>`;
    }

    appState.focusItems.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = "focus-item";
        li.innerHTML = `
            <label class="focus-item-label">
                <input type="checkbox" class="focus-item-checkbox" ${item.completed ? 'checked' : ''} data-index="${idx}">
                <span class="focus-item-text ${item.completed ? 'completed' : ''}">${item.text}</span>
            </label>
            <button class="focus-delete-btn" data-index="${idx}">&times;</button>
        `;
        
        // Checklist toggle trigger
        li.querySelector('input').addEventListener('change', (e) => {
            appState.focusItems[idx].completed = e.target.checked;
            saveFocusItemsToStorage();
            renderFocusList();
        });

        // Delete checklist item trigger
        li.querySelector('.focus-delete-btn').addEventListener('click', () => {
            appState.focusItems.splice(idx, 1);
            saveFocusItemsToStorage();
            renderFocusList();
        });

        sidebarFocusList.appendChild(li);
    });

    // Recalculate completions rates & progress bar
    const totalCount = appState.focusItems.length;
    const completedCount = appState.focusItems.filter(x => x.completed).length;
    const remainingCount = totalCount - completedCount;
    
    if (focusProgressLabel) {
        focusProgressLabel.textContent = `${completedCount} / ${totalCount} Complete`;
    }
    if (focusProgressBar) {
        focusProgressBar.style.width = totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%';
    }
    const remainingTasksCountEl = document.getElementById('remaining-tasks-count');
    if (remainingTasksCountEl) {
        remainingTasksCountEl.textContent = `${remainingCount} tasks remaining today`;
    }
}

function addFocusItem() {
    const text = sidebarFocusInput.value.trim();
    if (!text) return;
    
    appState.focusItems.push({ text: text, completed: false });
    sidebarFocusInput.value = "";
    saveFocusItemsToStorage();
    renderFocusList();
}

// --- DYNAMIC RENDERING: Projects workspaces ---
function calculateProgressPercent(progress) {
    if (!progress || Object.keys(progress).length === 0) return 0;
    const keys = Object.keys(progress);
    const completedCount = keys.filter(k => progress[k] === 'completed').length;
    const inProgressCount = keys.filter(k => progress[k] === 'in_progress').length;
    return Math.round(((completedCount + inProgressCount * 0.5) / keys.length) * 100);
}

function renderRecentProjects() {
    if (!homeRecentProjectsContainer) return;
    homeRecentProjectsContainer.innerHTML = "";
    // Only map the latest three projects
    const recents = appState.projects.slice(-3);

    if (recents.length === 0) {
        homeRecentProjectsContainer.innerHTML = `<p style="font-size:11px; color:var(--text-muted); padding:10px 0;">No active projects recorded.</p>`;
        return;
    }

    recents.forEach(p => {
        const row = document.createElement('div');
        row.className = "recent-project-row";
        row.innerHTML = `
            <span class="recent-project-name">${p.name}</span>
            <span class="project-status ${p.status.toLowerCase().replace(' ', '-')}">${p.status}</span>
        `;
        homeRecentProjectsContainer.appendChild(row);
    });
}

function renderProjectsGrid() {
    allProjectsGrid.innerHTML = "";

    if (appState.projects.length === 0) {
        allProjectsGrid.innerHTML = `<p style="grid-column: span 3; color: var(--text-muted); text-align: center; padding: 40px 0;">No active missions in cache. Deploy one above.</p>`;
        return;
    }

    appState.projects.forEach(p => {
        const pct = calculateProgressPercent(p.progress);
        
        // Apple/JARVIS design calculations
        let healthText = "Stable";
        let healthClass = "stable";
        if (pct >= 80) { healthText = "Excellent"; healthClass = "excellent"; }
        else if (pct >= 50) { healthText = "Stable"; healthClass = "stable"; }
        else if (pct >= 20) { healthText = "Needs Attention"; healthClass = "attention"; }
        else { healthText = "Critical"; healthClass = "critical"; }

        // Dynamic Confidence mapping
        const confidence = 87 + (p.name.length % 9); // e.g. 87% to 95%
        
        // AI Recommendations Engine mapping
        let recommendedAction = "Review operational logs and execute system diagnostics.";
        let recommendedTime = "30 Mins";
        let recommendedPriority = "Medium";
        
        if (p.progress["Frontend"] !== "completed") {
            recommendedAction = "Complete database schema before implementing authentication.";
            recommendedTime = "45 Mins";
            recommendedPriority = "High";
        } else if (p.progress["Backend"] === "in_progress") {
            recommendedAction = "Configure security middleware before binding API routers.";
            recommendedTime = "1.5 Hours";
            recommendedPriority = "Critical";
        } else if (p.progress["Deployment"] === "pending") {
            recommendedAction = "Initialize Docker compose environment configurations.";
            recommendedTime = "1 Hour";
            recommendedPriority = "Medium";
        }

        // Subsystems Health Pct Mapping
        const fePct = p.progress["Frontend"] === "completed" ? 100 : (p.progress["Frontend"] === "in_progress" ? 50 : 25);
        const bePct = p.progress["Backend"] === "completed" ? 100 : (p.progress["Backend"] === "in_progress" ? 50 : 10);
        const dbPct = p.progress["Database"] === "completed" ? 100 : (p.progress["Database"] === "in_progress" ? 50 : 0);

        const card = document.createElement('div');
        card.className = `mission-control-panel ${p.status.toLowerCase().replace(' ', '-')}`;
        card.innerHTML = `
            <!-- Header -->
            <div class="mission-panel-header">
                <div class="mission-title-area">
                    <span class="telemetry-label" style="color:var(--accent-purple);">Strategic Mission</span>
                    <h3>${p.name}</h3>
                    <p class="mission-objective-text">Objective: Build, secure, and auto-deploy developer assets</p>
                </div>
                <span class="mission-status-badge ${p.status.toLowerCase().replace(' ', '-')}">${p.status}</span>
            </div>

            <!-- Telemetry Grid -->
            <div class="mission-telemetry-grid">
                <div class="telemetry-item">
                    <span class="telemetry-label">AI Confidence</span>
                    <span class="telemetry-value purple">${confidence}%</span>
                </div>
                <div class="telemetry-item">
                    <span class="telemetry-label">Completion</span>
                    <span class="telemetry-value">${pct}%</span>
                </div>
                <div class="telemetry-item">
                    <span class="telemetry-label">Active Agent</span>
                    <span class="telemetry-value">${appState.activeAgent || 'Jarvis Core'}</span>
                </div>
                <div class="telemetry-item">
                    <span class="telemetry-label">Last Activity</span>
                    <span class="telemetry-value">${p.lastUpdated || 'Recently'}</span>
                </div>
            </div>

            <!-- AI Recommendation Engine -->
            <div class="jarvis-recommendation-block">
                <div class="recommendation-header">
                    <i data-lucide="bot" size="12" style="color:var(--accent-purple);"></i>
                    <span>Jarvis Recommendation</span>
                </div>
                <div class="recommendation-action">${recommendedAction}</div>
                <div class="recommendation-meta-row">
                    <span>Priority: <strong style="color:${recommendedPriority === 'Critical' ? 'var(--accent-red)' : (recommendedPriority === 'High' ? 'var(--accent-yellow)' : 'var(--accent-purple)')}">${recommendedPriority}</strong></span>
                    <span>Estimated Time: <strong>${recommendedTime}</strong></span>
                </div>
            </div>

            <!-- Mission Health System -->
            <div class="mission-health-system">
                <div class="health-status-header">
                    <span class="health-label">Mission Health Telemetry</span>
                    <span class="health-value ${healthClass}">${healthText.toUpperCase()}</span>
                </div>
                <div class="subsystem-health-bars">
                    <div class="subsystem-item">
                        <div class="subsystem-name-row">
                            <span>Frontend UI</span>
                            <span>${fePct}%</span>
                        </div>
                        <div class="subsystem-progress-bar">
                            <div class="subsystem-progress-fill ${fePct >= 80 ? 'green' : (fePct >= 50 ? 'yellow' : 'red')}" style="width: ${fePct}%"></div>
                        </div>
                    </div>
                    <div class="subsystem-item">
                        <div class="subsystem-name-row">
                            <span>Backend Engine</span>
                            <span>${bePct}%</span>
                        </div>
                        <div class="subsystem-progress-bar">
                            <div class="subsystem-progress-fill ${bePct >= 80 ? 'green' : (bePct >= 50 ? 'yellow' : 'red')}" style="width: ${bePct}%"></div>
                        </div>
                    </div>
                    <div class="subsystem-item">
                        <div class="subsystem-name-row">
                            <span>Infrastructure</span>
                            <span>${dbPct}%</span>
                        </div>
                        <div class="subsystem-progress-bar">
                            <div class="subsystem-progress-fill ${dbPct >= 80 ? 'green' : (dbPct >= 50 ? 'yellow' : 'red')}" style="width: ${dbPct}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mission Timeline -->
            <div class="mission-timeline-block">
                <div class="timeline-heading">
                    <i data-lucide="history" size="11" style="color:var(--text-muted); margin-right:4px;"></i>
                    <span>Mission Timeline Feed</span>
                </div>
                <div class="timeline-feed">
                    <div class="timeline-event milestone">
                        <span class="timeline-time">09:00</span>
                        <span class="timeline-desc">Initialized mission workspace <strong>${p.name}</strong></span>
                    </div>
                    <div class="timeline-event">
                        <span class="timeline-time">10:20</span>
                        <span class="timeline-desc">Database schema initialized successfully.</span>
                    </div>
                    <div class="timeline-event milestone">
                        <span class="timeline-time">11:45</span>
                        <span class="timeline-desc">Active agent <strong>${appState.activeAgent || 'Jarvis Core'}</strong> deployed to backend endpoints.</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="mission-panel-footer">
                <button class="delete-proj-btn text-action-btn" data-id="${p.id}" style="color:var(--accent-red); transition: opacity 120ms;">Erase Mission Cache</button>
            </div>
        `;
        
        // Re-bind Lucide icons inside card
        setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 50);

        // Trigger delete
        card.querySelector('.delete-proj-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`Erase Mission "${p.name}" Cache?`)) {
                try {
                    const res = await fetch(`${API_BASE}/projects/${p.id}`, { method: 'DELETE' });
                    if (res.ok) await loadDashboardData();
                } catch (err) {
                    console.error("Delete Project Error:", err);
                }
            }
        });

        allProjectsGrid.appendChild(card);
    });
}

async function submitCreateProject() {
    const pName = document.getElementById('modal-proj-name').value.trim();
    const pStackRaw = document.getElementById('modal-proj-stack').value.trim();
    const pStatus = document.getElementById('modal-proj-status').value;
    
    if (!pName) {
        alert("Sir, project title is required.");
        return;
    }

    const techStack = pStackRaw ? pStackRaw.split(',').map(s => s.trim()) : [];
    
    // Retrieve custom checkboxes setup
    const progressObj = {};
    if (document.getElementById('check-frontend').checked) progressObj["Frontend"] = "completed";
    else progressObj["Frontend"] = "pending";
    
    if (document.getElementById('check-backend').checked) progressObj["Backend"] = "in_progress";
    else progressObj["Backend"] = "pending";
    
    if (document.getElementById('check-db').checked) progressObj["Database"] = "pending";
    if (document.getElementById('check-auth').checked) progressObj["Authentication"] = "pending";
    if (document.getElementById('check-deploy').checked) progressObj["Deployment"] = "pending";

    const newProjectPayload = {
        id: pName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: pName,
        lastUpdated: "Just now",
        status: pStatus,
        techStack: techStack,
        progress: progressObj
    };

    try {
        const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProjectPayload)
        });

        if (response.ok) {
            // Reset input values
            document.getElementById('modal-proj-name').value = "";
            document.getElementById('modal-proj-stack').value = "";
            projectModal.classList.add('hidden');
            await loadDashboardData();
        }
    } catch (e) {
        console.error("Create Project Error:", e);
    }
}

// --- DYNAMIC KANBAN BOARD SYSTEM (DRAG & DROP) ---
function getTaskSpecs(t, index) {
    let priority = "medium";
    let agent = "Backend Architect";
    let estTime = "2 Hours";
    let dependencies = "Database Schema";
    
    // Map dynamically based on content to make it highly interesting
    const lower = t.title.toLowerCase();
    if (lower.includes("llama") || lower.includes("security") || lower.includes("auth") || lower.includes("caching")) {
        priority = "critical";
        agent = "AI Core Specialist";
        estTime = "1.5 Hours";
        dependencies = "Ollama Daemon";
    } else if (lower.includes("database") || lower.includes("postgresql") || lower.includes("schema")) {
        priority = "critical";
        agent = "Database Architect";
        estTime = "2.5 Hours";
        dependencies = "Chroma DB Config";
    } else if (lower.includes("whisper") || lower.includes("noise") || lower.includes("audio")) {
        priority = "high";
        agent = "STT Systems Engineer";
        estTime = "3 Hours";
        dependencies = "Mic Stream Drivers";
    } else if (lower.includes("docker") || lower.includes("compose") || lower.includes("deploy")) {
        priority = "high";
        agent = "Senior DevOps Lead";
        estTime = "1 Hour";
        dependencies = "FastAPI Main Routes";
    } else if (lower.includes("tailwind") || lower.includes("ui") || lower.includes("components")) {
        priority = "medium";
        agent = "Frontend Engineer";
        estTime = "4 Hours";
        dependencies = "Vercel Stylesheets";
    } else if (lower.includes("backup") || lower.includes("nightly")) {
        priority = "low";
        agent = "SysAdmin Cron Executor";
        estTime = "30 Mins";
        dependencies = "None";
    } else {
        // Fallback rotation to keep visual diversity high
        const priorities = ["medium", "low", "high"];
        const agents = ["Backend Architect", "Frontend Engineer", "UI/UX Designer", "DevOps Engineer"];
        const times = ["1.5 Hours", "45 Mins", "2 Hours", "3 Hours"];
        const deps = ["Docker Layers", "None", "API Schema", "SQLite Engine"];
        
        priority = priorities[index % 3];
        agent = agents[index % 4];
        estTime = times[index % 4];
        dependencies = deps[index % 4];
    }
    
    return { priority, agent, estTime, dependencies };
}

function renderTasksKanban() {
    if (!queueCritical || !queueImportant || !queueScheduled || !queueCompleted || !operationsMatrixContainer) return;

    // Reset all list elements
    queueCritical.innerHTML = "";
    queueImportant.innerHTML = "";
    queueScheduled.innerHTML = "";
    queueCompleted.innerHTML = "";
    operationsMatrixContainer.innerHTML = "";

    let criticalCount = 0;
    let importantCount = 0;
    let scheduledCount = 0;
    let completedCount = 0;

    appState.tasks.forEach((t, idx) => {
        const specs = getTaskSpecs(t, idx);
        
        // 1. Build Operations Catalog Command Card (Global Operations Matrix)
        const opCard = document.createElement('div');
        opCard.className = "operation-command-card";
        opCard.innerHTML = `
            <div class="operation-card-header">
                <div class="operation-card-title">${t.title}</div>
                <span class="operation-priority-flag ${specs.priority}">${specs.priority}</span>
            </div>
            <div class="operation-specs-grid">
                <div class="spec-cell">
                    <span class="spec-label">Specialist Agent</span>
                    <span class="spec-value">${specs.agent}</span>
                </div>
                <div class="spec-cell">
                    <span class="spec-label">Time Budget</span>
                    <span class="spec-value">${specs.estTime}</span>
                </div>
            </div>
            <div class="operation-dependencies-row">
                <span>Dependencies: <strong>${specs.dependencies}</strong></span>
            </div>
            <div class="operation-card-footer">
                <span class="operation-status-label ${t.status.replace('_', '-')}">
                    <span class="operation-status-dot ${t.status === 'in_progress' ? 'glowing' : ''}"></span>
                    ${t.status.toUpperCase().replace('_', ' ')}
                </span>
                <button class="delete-task-btn text-action-btn" data-id="${t.id}" style="color:var(--accent-red);">Abort</button>
            </div>
        `;

        // Operation cancellation trigger
        opCard.querySelector('.delete-task-btn').addEventListener('click', async () => {
            if (confirm(`Abort Operation "${t.title}"?`)) {
                try {
                    const res = await fetch(`${API_BASE}/tasks/${t.id}`, { method: 'DELETE' });
                    if (res.ok) await loadDashboardData();
                } catch (err) {
                    console.error("Task delete failed:", err);
                }
            }
        });

        operationsMatrixContainer.appendChild(opCard);

        // 2. Build Today's Command Queue Mini-Card (draggable)
        const miniCard = document.createElement('div');
        miniCard.className = "queue-mini-card";
        miniCard.setAttribute('draggable', 'true');
        miniCard.setAttribute('data-id', t.id);
        miniCard.innerHTML = `
            <div class="queue-mini-card-title">${t.title}</div>
            <div class="queue-mini-card-meta">
                <span>👤 ${specs.agent.split(' ')[0]}</span>
                <span>⏱️ ${specs.estTime}</span>
            </div>
        `;

        // Setup HTML5 Drag and Drop events
        miniCard.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', t.id);
            miniCard.style.opacity = '0.5';
        });
        miniCard.addEventListener('dragend', () => {
            miniCard.style.opacity = '1';
        });

        // Route mini card to appropriate command queue columns
        if (t.status === "completed") {
            queueCompleted.appendChild(miniCard);
            completedCount++;
        } else if (specs.priority === "critical") {
            queueCritical.appendChild(miniCard);
            criticalCount++;
        } else if (specs.priority === "high") {
            queueImportant.appendChild(miniCard);
            importantCount++;
        } else {
            queueScheduled.appendChild(miniCard);
            scheduledCount++;
        }
    });

    // Update dynamic counter badges
    document.getElementById('badge-queue-critical').textContent = criticalCount;
    document.getElementById('badge-queue-important').textContent = importantCount;
    document.getElementById('badge-queue-scheduled').textContent = scheduledCount;
    document.getElementById('badge-queue-completed').textContent = completedCount;

    // Drop bindings on Columns
    const columns = [
        { el: queueCritical, status: 'in_progress' },
        { el: queueImportant, status: 'in_progress' },
        { el: queueScheduled, status: 'in_progress' },
        { el: queueCompleted, status: 'completed' }
    ];

    columns.forEach(col => {
        col.el.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.el.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        });

        col.el.addEventListener('dragleave', () => {
            col.el.style.backgroundColor = '';
        });

        col.el.addEventListener('drop', async (e) => {
            e.preventDefault();
            col.el.style.backgroundColor = '';
            
            const taskId = e.dataTransfer.getData('text/plain');
            const targetTaskIndex = appState.tasks.findIndex(t => t.id === taskId);
            
            if (targetTaskIndex !== -1) {
                const targetTask = appState.tasks[targetTaskIndex];
                
                // If dropped in Completed column, mark completed status
                if (col.status === 'completed') {
                    targetTask.status = 'completed';
                } else {
                    // Restore back to in_progress/pending
                    targetTask.status = 'in_progress';
                }
                
                try {
                    await fetch(`${API_BASE}/tasks`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(targetTask)
                    });
                    await loadDashboardData();
                } catch (err) {
                    console.error("Drop save task fail:", err);
                }
            }
        });
    });
}

async function createKanbanTask() {
    const titleVal = newTaskInput.value.trim();
    if (!titleVal) return;

    const newTask = {
        id: "task-" + Date.now().toString().slice(-6),
        title: titleVal,
        status: "pending"
    };

    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            newTaskInput.value = "";
            await loadDashboardData();
        }
    } catch (e) {
        console.error("Task add failed:", e);
    }
}

// --- SPECIALIZED AGENTS PERSONAS MANAGEMENT ---
// --- SPECIALIZED AGENTS PERSONAS MANAGEMENT ---
function renderAgentGrid() {
    if (!agentsSelectionGrid) return;
    agentsSelectionGrid.innerHTML = "";

    Object.keys(AGENTS).forEach(key => {
        if (key === "Default") return; // Keep Core Default in background control only

        const agent = AGENTS[key];
        const card = document.createElement('div');
        card.className = `agent-card ${appState.activeAgent === key ? 'active' : ''}`;
        
        card.innerHTML = `
            <div class="agent-avatar">${agent.avatar}</div>
            <div class="agent-name">${agent.name}</div>
            <div class="agent-role">specialist</div>
            <div class="agent-desc">${agent.desc}</div>
        `;

        card.addEventListener('click', () => activateAgent(key));
        agentsSelectionGrid.appendChild(card);
    });
}

async function activateAgent(agentName) {
    try {
        const res = await fetch(`${API_BASE}/agent/activate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: agentName })
        });
        
        if (res.ok) {
            appState.activeAgent = agentName;
            
            // Re-render agents selection visual grid border
            renderAgentGrid();
            
            // Update Active spec monitors
            updateActiveAgentUI(agentName);
            
            // System message on Console
            const welcomeText = agentName === "Default" ? 
                "Jarvis default core operational model restored." : 
                `Specialist agent activated: ${agentName} holds focus. Prompt input will map directly to this expert.`;
            
            appendChatMessage("System OS", welcomeText, "jarvis-message");
            speakText(welcomeText);
        }
    } catch (err) {
        console.error("Activate Agent failed:", err);
    }
}

function updateActiveAgentUI(agentKey) {
    const config = AGENTS[agentKey];
    if (!config) return;
    
    // Update Right telemetry panel
    const avatarEl = document.getElementById('right-agent-avatar');
    if (avatarEl) avatarEl.textContent = config.avatar;
    const nameEl = document.getElementById('right-agent-name');
    if (nameEl) nameEl.textContent = config.name;
    const descEl = document.getElementById('right-agent-desc');
    if (descEl) descEl.textContent = config.desc;
    const contextEl = document.getElementById('right-agent-context');
    if (contextEl) contextEl.textContent = config.context;
    
    // Populate Right activity list
    const actList = document.getElementById('right-agent-activity');
    if (actList) {
        actList.innerHTML = "";
        config.activity.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actList.appendChild(li);
        });
    }

    // Update Console header badge
    const badgeEl = document.getElementById('chat-agent-badge');
    if (badgeEl) {
        badgeEl.textContent = `${config.name} Session`;
    }
}

// --- DEBOUNCED MARKDOWN NOTEPAD ---
let noteDebounceTimer = null;

function setupNotesAutoSaveDebounce() {
    notesTextarea.addEventListener('input', () => {
        notesSaveStatus.textContent = "Typing...";
        notesSaveStatus.style.color = "var(--accent-yellow)";
        
        clearTimeout(noteDebounceTimer);
        
        noteDebounceTimer = setTimeout(async () => {
            await saveNotesContentToServer();
        }, 1200); // 1.2 second debounce delay before auto-saving draft
    });
}

async function saveNotesContentToServer() {
    const noteText = notesTextarea.value;
    try {
        const response = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: noteText })
        });
        
        if (response.ok) {
            notesSaveStatus.textContent = "Draft Saved";
            notesSaveStatus.style.color = "var(--accent-green)";
        } else {
            notesSaveStatus.textContent = "Save failed";
            notesSaveStatus.style.color = "var(--accent-red)";
        }
    } catch (err) {
        notesSaveStatus.textContent = "Offline Error";
        notesSaveStatus.style.color = "var(--accent-red)";
        console.error("Notes save failed:", err);
    }
}

async function triggerManualNotesSave() {
    notesSaveStatus.textContent = "Saving...";
    notesSaveStatus.style.color = "var(--accent-yellow)";
    await saveNotesContentToServer();
}

// --- CONFIGURATION MANAGEMENT ---
function saveConfigSettings() {
    const username = settingsUsername.value.trim() || "Dharmesh";
    const roleLabel = settingsEditor.value.trim() || "VS Code";
    
    // Update local visual states
    const profileNameEl = document.querySelector('.sidebar-profile-footer .user-meta .name');
    if (profileNameEl) profileNameEl.textContent = username;
    
    const userRoleEl = document.querySelector('.sidebar-profile-footer .user-meta .role');
    if (userRoleEl) userRoleEl.textContent = roleLabel;
    
    if (greetingText) greetingText.textContent = username;
    
    if (settingsUseLocal) {
        speakActive = settingsUseLocal.checked;
    }
    
    alert("Sir, system environment credentials updated successfully.");
}

// --- AI PERSISTENT MEMORY SYSTEM ---
appState.facts = [];

async function loadMemoryFacts() {
    try {
        const response = await fetch(`${API_BASE}/memory`);
        if (!response.ok) throw new Error("Failed to load memory facts");
        const data = await response.json();
        
        appState.facts = data.facts || [];
        renderMemoryFactsList();
        updateAnalyticsUI();
    } catch (err) {
        console.error("Load Memory Facts Error:", err);
    }
}

function renderMemoryFactsList() {
    // 1. Render to Settings View Memory list
    if (settingsMemoryList) {
        settingsMemoryList.innerHTML = "";
        if (appState.facts.length === 0) {
            settingsMemoryList.innerHTML = `<li style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">No active memory context facts.</li>`;
        } else {
            appState.facts.forEach((fact, idx) => {
                const li = document.createElement('li');
                li.className = "memory-fact-item";
                li.innerHTML = `
                    <span>${fact}</span>
                    <button class="delete-memory-btn" data-index="${idx}">&times;</button>
                `;
                li.querySelector('.delete-memory-btn').addEventListener('click', async () => {
                    await deleteMemoryFact(idx);
                });
                settingsMemoryList.appendChild(li);
            });
        }
    }

    // 2. Render to Home View Sidebar Memory list
    if (sidebarMemoryList) {
        sidebarMemoryList.innerHTML = "";
        if (appState.facts.length === 0) {
            sidebarMemoryList.innerHTML = `<li style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">No active memory context facts.</li>`;
        } else {
            appState.facts.forEach((fact, idx) => {
                const li = document.createElement('li');
                li.className = "memory-fact-item";
                li.innerHTML = `
                    <span>${fact}</span>
                    <button class="delete-memory-btn" data-index="${idx}">&times;</button>
                `;
                li.querySelector('.delete-memory-btn').addEventListener('click', async () => {
                    await deleteMemoryFact(idx);
                });
                sidebarMemoryList.appendChild(li);
            });
        }
    }
}

async function addMemoryFact(isSidebar = false) {
    const inputEl = isSidebar ? sidebarMemoryInput : settingsMemoryInput;
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (!text) return;
    
    try {
        const response = await fetch(`${API_BASE}/memory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fact: text })
        });
        
        if (response.ok) {
            inputEl.value = "";
            await loadMemoryFacts();
        }
    } catch (err) {
        console.error("Add Memory Fact Error:", err);
    }
}

async function deleteMemoryFact(index) {
    try {
        const response = await fetch(`${API_BASE}/memory/${index}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadMemoryFacts();
        }
    } catch (err) {
        console.error("Delete Memory Fact Error:", err);
    }
}

function updateAnalyticsUI() {
    const activeProjsEl = document.getElementById('analytics-active-projects');
    if (activeProjsEl) activeProjsEl.textContent = appState.projects.length;
    
    const completedTasksEl = document.getElementById('analytics-completed-tasks');
    if (completedTasksEl) {
        completedTasksEl.textContent = appState.tasks.filter(t => t.status === 'completed').length;
    }
    
    const memoryFactsEl = document.getElementById('analytics-memory-facts');
    if (memoryFactsEl) {
        memoryFactsEl.textContent = appState.facts ? appState.facts.length : 0;
    }
}