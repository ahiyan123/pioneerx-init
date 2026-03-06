/**
 * PIONEERX UNIFIED COMMAND CORE
 * [SYSTEM STATUS]: ONLINE
 * [LOGIC]: SPEECH-TO-TEXT + ACCENT-MIRRORING TTS
 */

const PioneerVoice = {
    recognition: new (window.webkitSpeechRecognition || window.speechRecognition)(),
    synth: window.speechSynthesis,
    isListening: false,
    detectedAccent: 'en-US',

    init() {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        // --- THE EAR: SPEECH TO TEXT ---
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI("LISTENING...", true);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.detectedAccent = event.results[0][0].lang || 'en-US';
            
            // Sync detected accent to UI
            const accentDisplay = document.getElementById('display-accent');
            if(accentDisplay) accentDisplay.innerText = this.detectedAccent.toUpperCase();
            
            const inputField = document.getElementById('pioneer-input');
            if(inputField) inputField.value = transcript;

            this.logToTerminal(`VOICE_IN: ${transcript}`, 'user-msg');
            
            // AUTO-EXECUTE COMMAND
            this.executeCommand(transcript);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI("SYSTEM LISTEN", false);
        };

        // Pre-load voices to ensure Mirror Protocol is ready
        this.synth.getVoices();
    },

    toggleMic() {
        // [FIX]: Security unlock for audio engine on first click
        if (this.synth.speaking) this.synth.cancel();

        if (!this.isListening) {
            // "Silent Wakeup" - enables the voice engine for the upcoming response
            const wakeup = new SpeechSynthesisUtterance("");
            this.synth.speak(wakeup);
            
            try {
                this.recognition.start();
            } catch (e) {
                this.logToTerminal("ERROR: MIC_ALREADY_ACTIVE", "system-msg");
            }
        } else {
            this.recognition.stop();
        }
    },

    // --- THE VOICE: MIRROR PROTOCOL ---
    speakResponse(text) {
        this.synth.cancel(); // Stop any pending speech
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = this.synth.getVoices();

        // [LOGIC]: Identify voice matching the speaker's accent
        let targetVoice = voices.find(v => v.lang === this.detectedAccent);
        
        // Fallback to language group if regional accent isn't installed
        if (!targetVoice) {
            const baseLang = this.detectedAccent.split('-')[0];
            targetVoice = voices.find(v => v.lang.startsWith(baseLang));
        }

        utterance.voice = targetVoice || voices[0];
        utterance.rate = 0.9;  // Measured tactical speed
        utterance.pitch = 1.0; 
        
        this.synth.speak(utterance);
        this.logToTerminal(text, 'ai-msg');
    },

    // --- UI & TERMINAL LOGISTICS ---
    updateUI(text, active) {
        const btnText = document.getElementById('mic-text');
        const indicator = document.getElementById('mic-indicator');
        const wave = document.getElementById('voice-wave');
        
        if(btnText) btnText.innerText = text;
        if(active) {
            if(indicator) indicator.classList.add('pulse-active');
            if(wave) wave.classList.remove('hidden');
        } else {
            if(indicator) indicator.classList.remove('pulse-active');
            if(wave) wave.classList.add('hidden');
        }
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

    async executeCommand(cmd) {
        /**
         * LINKING TO AI CORE:
         * Replace the mock response with your 120B / Puter.js fetch logic.
         */
        setTimeout(() => {
            const response = "PioneerX: Command processed. Mirror Protocol online. All systems are nominal.";
            this.speakResponse(response);
        }, 600);
    }
};

// INITIALIZE
PioneerVoice.init();

// Ensure voices load correctly on all browsers
window.speechSynthesis.onvoiceschanged = () => {
    console.log("[PIONEERX] Tactical Voice Engine: RE-SYNCED");
};
