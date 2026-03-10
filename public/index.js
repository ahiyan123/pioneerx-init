/**
 * PIONEERX COMPREHENSIVE CORE
 * [FEATURES]: Text Input + Voice Input + Multilingual AI + Unified Share Button
 */
const PioneerVoice = {
    recognition: null,
    synth: window.speechSynthesis,
    isListening: false, // Track state
    detectedAccent: 'en-US',

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateUI("LISTENING...", true);
            };

            this.recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                this.logToTerminal(transcript, 'user-msg');
                this.executeCommand(transcript);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateUI("SYSTEM LISTEN", false);
            };

            this.recognition.onerror = (e) => {
                this.logToTerminal(`MIC_ERROR: ${e.error}`, 'system-msg');
                this.isListening = false;
                this.updateUI("SYSTEM LISTEN", false);
            };
        }

        // --- KEYBOARD SETUP ---
        const inputField = document.getElementById('pioneer-input');
        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && inputField.value.trim() !== "") {
                    this.logToTerminal(inputField.value, 'user-msg');
                    this.executeCommand(inputField.value);
                    inputField.value = "";
                }
            });
        }
    },

    // --- THE MISSING TRIGGER ---
    toggleMic() {
        if (!this.recognition) return alert("Speech recognition not supported.");
        
        // 1. Clear any current speech
        this.synth.cancel();

        // 2. Start or Stop
        if (!this.isListening) {
            try {
                this.recognition.start();
            } catch (e) { console.error(e); }
        } else {
            this.recognition.stop();
        }
    },

    async executeCommand(cmd) {
        this.logToTerminal("CONSULTING_STRATEGY...", "system-msg");
        try {
            const response = await puter.ai.chat(cmd);
            this.speakResponse(response.toString());
        } catch (err) {
            this.logToTerminal("ERROR: UPLINK_FAILED", "system-msg");
        }
    },

    speakResponse(text) {
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set accent based on detection
        utterance.lang = this.detectedAccent;
        
        this.synth.speak(utterance);
        this.logToTerminal(text, 'ai-msg');
    },

    logToTerminal(msg, type) {
        const stream = document.getElementById('output-stream');
        if (!stream) return;
        const p = document.createElement('p');
        p.className = type;
        let icon = type === 'user-msg' ? "👤 " : type === 'ai-msg' ? "🤖 " : "⚙️ ";
        p.innerText = icon + msg;
        stream.appendChild(p);
        stream.scrollTop = stream.scrollHeight;
    },

    // UI Helper for the Mic Button
    updateUI(text, active) {
        const btnText = document.getElementById('mic-text');
        if(btnText) btnText.innerText = text;
    },

   async shareReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // FIX: Look at 'terminal' instead of 'output-stream'
    const termContainer = document.getElementById('terminal');
    const elements = termContainer.querySelectorAll('.user-msg, .ai-msg');
    
    let y = 50;
    let validEntries = 0;

    // Header Branding
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(0, 255, 0);
    doc.setFont("courier", "bold");
    doc.text("PIONEERX STRATEGIC AUDIT", 15, 20);

    elements.forEach((el) => {
        validEntries++;
        const isUser = el.classList.contains('user-msg');
        
        // Clean text by removing the [USER] or [PIONEER] tags
        const cleanText = el.innerText.replace('[USER] ', '').replace('[PIONEER] ', '');
        
        doc.setTextColor(isUser ? 100 : 0);
        doc.setFont("courier", isUser ? "bold" : "normal");
        const prefix = isUser ? "Q: " : "A: ";
        const lines = doc.splitTextToSize(prefix + cleanText, 180);
        
        // Page overflow check
        if (y + (lines.length * 7) > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text(lines, 15, y);
        y += (lines.length * 7) + 5;
    });

    if (validEntries === 0) return alert("Pioneer: No conversation data found to export.");
    doc.save(`PioneerX_Strategic_Report.pdf`);
}

PioneerVoice.init();
