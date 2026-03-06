/**
 * PIONEERX INTEGRATED CORE 
 * [LOGIC]: SPEECH-TO-TEXT -> PUTER AI -> MIRROR-TTS
 */

const PioneerVoice = {
    recognition: null,
    synth: window.speechSynthesis,
    isListening: false,
    detectedAccent: 'en-US',

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.logToTerminal("CRITICAL: Browser Speech API not supported.", "system-msg");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        // --- 1. THE EAR (Listen) ---
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI("LISTENING...", true);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.detectedAccent = event.results[0][0].lang || 'en-US';
            
            this.logToTerminal(`YOU: ${transcript}`, 'user-msg');
            
            // Send captured voice text directly to AI
            this.executeCommand(transcript);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI("SYSTEM LISTEN", false);
        };
    },

    toggleMic() {
        if (this.synth.speaking) this.synth.cancel();

        if (!this.isListening) {
            // Wake up audio engine (Security bypass)
            this.synth.speak(new SpeechSynthesisUtterance(""));
            try {
                this.recognition.start();
            } catch (e) { console.error(e); }
        } else {
            this.recognition.stop();
        }
    },

    // --- 2. THE BRAIN (Puter.js Integration) ---
    async executeCommand(cmd) {
        this.logToTerminal("THINKING...", "system-msg");
        
        try {
            // LIVE AI CALL - No Mocks. Uses Puter's default 120B-class models.
            const response = await puter.ai.chat(cmd);
            const responseText = response.toString();

            // Send result to the voice mouth
            this.speakResponse(responseText);

        } catch (error) {
            console.error("Puter AI Error:", error);
            this.speakResponse("Connection to the strategic core failed. Check network.");
        }
    },

    // --- 3. THE MOUTH (Mirror Accent TTS) ---
    speakResponse(text) {
        this.synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = this.synth.getVoices();

        // MIRROR PROTOCOL: Target the voice matching your accent
        let targetVoice = voices.find(v => v.lang === this.detectedAccent) || 
                          voices.find(v => v.lang.startsWith(this.detectedAccent.split('-')[0])) || 
                          voices[0];

        utterance.voice = targetVoice;
        utterance.rate = 0.95; 

        this.synth.speak(utterance);
        this.logToTerminal(text, 'ai-msg');
    },

    logToTerminal(msg, type) {
        const stream = document.getElementById('output-stream');
        if(!stream) return;
        const p = document.createElement('p');
        p.className = type || 'system-msg';
        p.innerText = `> ${msg}`;
        stream.appendChild(p);
        stream.scrollTop = stream.scrollHeight;
    },

    updateUI(text, active) {
        const btnText = document.getElementById('mic-text');
        if(btnText) btnText.innerText = text;
    }
};

// Start System
PioneerVoice.init();
