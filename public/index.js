const PioneerVoice = {
    recognition: null,
    synth: window.speechSynthesis,
    isListening: false,
    detectedAccent: 'en-US',

    init() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            console.log("[PIONEERX] Speech Engine Initialized.");
        } catch (e) {
            alert("Critical: Your browser does not support Speech Recognition.");
            return;
        }

        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        // --- 1. THE EAR (Detection) ---
        this.recognition.onstart = () => {
            console.log("[PIONEERX] Mic is now HOT.");
            this.updateUI("LISTENING...", true);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.detectedAccent = event.results[0][0].lang || 'en-US';
            
            console.log(`[PIONEERX] Heard: ${transcript} (Accent: ${this.detectedAccent})`);
            
            // UI SYNC
            const inputField = document.getElementById('pioneer-input');
            if(inputField) inputField.value = transcript;

            this.logToTerminal(`VOICE_IN: ${transcript}`, 'user-msg');
            this.executeCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error("[PIONEERX] Recognition Error:", event.error);
            this.logToTerminal(`ERROR: ${event.error}`, 'system-msg');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI("SYSTEM LISTEN", false);
        };
    },

    toggleMic() {
        // Unlock Audio Context
        if (this.synth.speaking) this.synth.cancel();
        
        if (!this.isListening) {
            console.log("[PIONEERX] Attempting to start Mic...");
            try {
                this.recognition.start();
            } catch (e) { console.error("Mic start failed:", e); }
        } else {
            this.recognition.stop();
        }
    },

    // --- 2. THE VOICE (Mirroring) ---
    speakResponse(text) {
        console.log(`[PIONEERX] Attempting to speak: ${text}`);
        this.synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = this.synth.getVoices();

        // Mirror Accent Logic
        let targetVoice = voices.find(v => v.lang === this.detectedAccent) || 
                          voices.find(v => v.lang.startsWith(this.detectedAccent.split('-')[0])) || 
                          voices[0];

        utterance.voice = targetVoice;
        utterance.rate = 0.9;
        
        this.synth.speak(utterance);
        this.logToTerminal(text, 'ai-msg');
    },

    logToTerminal(msg, type) {
        const stream = document.getElementById('output-stream');
        if (!stream) {
            console.error("CRITICAL: Element #output-stream not found in HTML!");
            return;
        }
        const p = document.createElement('p');
        p.className = type || 'system-msg';
        p.innerText = `> ${msg}`;
        stream.appendChild(p);
        stream.scrollTop = stream.scrollHeight;
    },

    async executeCommand(cmd) {
        // Mock AI Delay
        setTimeout(() => {
            this.speakResponse("PioneerX Sanctuary is standing by. All signals verified.");
        }, 500);
    }
};

// Start the engine
PioneerVoice.init();

// Ensure voices load correctly on all browsers
window.speechSynthesis.onvoiceschanged = () => {
    console.log("[PIONEERX] Tactical Voice Engine: RE-SYNCED");
};
