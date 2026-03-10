/**
 * PIONEERX COMPREHENSIVE CORE
 * [FEATURES]: Text Input + Voice Input + Multilingual AI + Unified Share Button
 */
const PioneerVoice = {
    recognition: null,
    synth: window.speechSynthesis,
    detectedAccent: 'en-US',

    init() {
        // --- 1. THE EAR (Voice Input) ---
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                this.logToTerminal(transcript, 'user-msg'); // TAGGED AS USER
                this.executeCommand(transcript);
            };
        }

        // --- 2. THE KEYBOARD (Text Input) ---
        const inputField = document.getElementById('pioneer-input');
        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && inputField.value.trim() !== "") {
                    this.logToTerminal(inputField.value, 'user-msg'); // TAGGED AS USER
                    this.executeCommand(inputField.value);
                    inputField.value = "";
                }
            });
        }
    },

    // --- 3. THE BRAIN (AI Logic) ---
    async executeCommand(cmd) {
        this.logToTerminal("CONSULTING_STRATEGY...", "system-msg");
        try {
            const response = await puter.ai.chat(cmd);
            this.speakResponse(response.toString());
        } catch (err) {
            this.logToTerminal("ERROR: UPLINK_FAILED", "system-msg");
        }
    },

    // --- 4. THE MOUTH (TTS & Terminal Output) ---
    speakResponse(text) {
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        this.synth.speak(utterance);
        this.logToTerminal(text, 'ai-msg'); // TAGGED AS AI
    },

    // --- 5. THE LOG ENGINE ---
    logToTerminal(msg, type) {
        const stream = document.getElementById('output-stream');
        if (!stream) return;

        const p = document.createElement('p');
        p.className = type; // Critical: 'user-msg' or 'ai-msg'
        
        let icon = "⚙️ ";
        if (type === 'user-msg') icon = "👤 ";
        if (type === 'ai-msg') icon = "🤖 ";
        
        p.innerText = icon + msg;
        stream.appendChild(p);
        stream.scrollTop = stream.scrollHeight;
    },

    // --- 6. THE EXPORT ENGINE (Fixed Filter) ---
    async shareReport() {
        const stream = document.getElementById('output-stream');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Find all messages
        const elements = stream.querySelectorAll('p');
        let y = 50;
        let validEntries = 0;

        // PDF Header
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(0, 255, 0);
        doc.setFont("courier", "bold");
        doc.text("PIONEERX STRATEGIC AUDIT", 15, 20);

        elements.forEach((el) => {
            // SKIP SYSTEM LOGS (Only take User/AI messages)
            if (el.classList.contains('system-msg')) return;

            validEntries++;
            const isUser = el.classList.contains('user-msg');
            const cleanText = el.innerText.substring(2); // Remove icon
            
            doc.setTextColor(isUser ? 100 : 0); // User is grey, AI is black
            doc.setFont("courier", isUser ? "bold" : "normal");
            
            const prefix = isUser ? "Q: " : "A: ";
            const lines = doc.splitTextToSize(prefix + cleanText, 180);
            doc.text(lines, 15, y);
            y += (lines.length * 7) + 5;
        });

        if (validEntries === 0) {
            alert("No text data found. Talk to the AI first!");
            return;
        }

        doc.save(`Pioneer_Report_${Date.now()}.pdf`);
    }
};

PioneerVoice.init();
