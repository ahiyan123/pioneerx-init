/**
 * PIONEERX MULTILINGUAL INTEGRATED CORE 
 * [LOGIC]: AUTO-LANG STT -> PUTER AI -> AUTO-LANG TTS
 */

const PioneerVoice = {
    recognition: null,
    synth: window.speechSynthesis,
    isListening: false,
    detectedAccent: 'en-US', // Default

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.logToTerminal("CRITICAL: Browser Speech API not supported.", "system-msg");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        // Let the browser decide the language based on the user's speech
        this.recognition.lang = navigator.language || 'en-US'; 

        // --- 1. THE EAR (Listen) ---
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI("LISTENING...", true);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            
            // CAPTURE LANGUAGE: This detects if you spoke Bangla, English, etc.
            this.detectedAccent = event.results[0][0].lang || navigator.language;
            
            this.logToTerminal(`YOU (${this.detectedAccent}): ${transcript}`, 'user-msg');
            
            // Send captured voice text directly to Puter AI
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
            // Wake up audio engine for multilingual response
            this.synth.speak(new SpeechSynthesisUtterance(""));
            try {
                this.recognition.start();
            } catch (e) { console.error("Mic Error:", e); }
        } else {
            this.recognition.stop();
        }
    },

    // --- 2. THE BRAIN (Puter.js AI) ---
    async executeCommand(cmd) {
        this.logToTerminal("ANALYZING...", "system-msg");
        
        try {
            // Live AI Call: No Mocks.
            // Puter AI naturally responds in the language you speak to it.
            const response = await puter.ai.chat(cmd);
            const responseText = response.toString();

            this.speakResponse(responseText);

        } catch (error) {
            console.error("AI Error:", error);
            this.speakResponse("Connection lost. Re-verifying signal.");
        }
    },

    // --- 3. THE MOUTH (Multilingual Mirror TTS) ---
    speakResponse(text) {
        this.synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // [CRITICAL]: Set the utterance language to the detected accent
        // This stops it from speaking Bangla with an English accent.
        utterance.lang = this.detectedAccent;

        const voices = this.synth.getVoices();

        // Find the best matching voice for the detected language
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
        if(!stream) return;
        const p = document.createElement('p');
        p.className = type || 'system-msg';
        p.innerText = `> ${msg}`;
        stream.appendChild(p);
        stream.scrollTop = stream.scrollHeight;
    },

    updateUI(text, active) {
        const btnText = document.getElementById('mic-text');
        const indicator = document.getElementById('mic-indicator');
        if(btnText) btnText.innerText = text;
        if(active) {
            if(indicator) indicator.classList.add('pulse-active');
        } else {
            if(indicator) indicator.classList.remove('pulse-active');
        }
    }
};

PioneerVoice.init();
PioneerVoice.init();
