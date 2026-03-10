/**
 * PIONEERX COMPREHENSIVE CORE
 * [FEATURES]: Text Input + Voice Input + Multilingual AI + Unified Share Button
 */

const PioneerVoice = {
    recognition: null,
    synth: window.speechSynthesis,
    isListening: false,
    detectedAccent: 'en-US',

    init() {
        // --- 1. SPEECH RECOGNITION (The Ear) ---
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = navigator.language || 'en-US';

            this.recognition.onstart = () => { 
                this.isListening = true; 
                this.updateUI("LISTENING...", true); 
            };
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.detectedAccent = event.results[0][0].lang;
                this.logToTerminal(`USER: ${transcript}`, 'user-msg');
                this.executeCommand(transcript);
            };
            this.recognition.onend = () => { 
                this.isListening = false; 
                this.updateUI("SYSTEM LISTEN", false); 
            };
        }

        // --- 2. TEXT PROMPT (The Keyboard) ---
        const inputField = document.getElementById('pioneer-input');
        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && inputField.value.trim() !== "") {
                    const cmd = inputField.value;
                    // Reset to system language for text inputs
                    this.detectedAccent = navigator.language || 'en-US'; 
                    this.logToTerminal(`USER: ${cmd}`, 'user-msg');
                    inputField.value = ""; 
                    this.executeCommand(cmd);
                }
            });
        }
    },

    toggleMic() {
        if (this.synth.speaking) this.synth.cancel();
        if (!this.isListening) {
            this.synth.speak(new SpeechSynthesisUtterance("")); // Audio Wakeup
            try { this.recognition.start(); } catch (e) { console.error(e); }
        } else { this.recognition.stop(); }
    },

    async executeCommand(cmd) {
        this.logToTerminal("PROCESSING...", "system-msg");
        try {
            const response = await puter.ai.chat(cmd);
            const responseText = response.toString();
            this.speakResponse(responseText);
        } catch (error) {
            this.logToTerminal("ERROR: UPLINK_LOST", "system-msg");
        }
    },

    speakResponse(text) {
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.detectedAccent;
        
        const voices = this.synth.getVoices();
        utterance.voice = voices.find(v => v.lang === this.detectedAccent) || voices[0];
        utterance.rate = 0.95;
        
        this.synth.speak(utterance);
        this.logToTerminal(text, 'ai-msg');
    },

    // --- 3. THE UNIFIED SHARE BUTTON LOGIC ---
    async shareReport() {
        const stream = document.getElementById('output-stream');
        if(!stream || stream.innerText.trim() === "") {
            alert("No data to share.");
            return;
        }

        const timestamp = new Date().toLocaleString();
        const fullContent = `*PIONEERX STRATEGIC REPORT [${timestamp}]*\n\n${stream.innerText}`;

        // Try System Share (WhatsApp/Email/etc)
        if (navigator.share) {
            try {
                await navigator.share({ title: 'PioneerX Audit', text: fullContent });
            } catch (err) { this.fallbackWhatsApp(fullContent); }
        } else {
            this.fallbackWhatsApp(fullContent);
        }
    },

    fallbackWhatsApp(text) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    },

    logToTerminal(msg, type) {
        const stream = document.getElementById('output-stream');
        if(!stream) return;
        const p = document.createElement('p');
        p.className = type;
        p.innerText = `> ${msg}`;
        stream.appendChild(p);
        stream.scrollTop = stream.scrollHeight;
    },

    updateUI(text, active) {
        const btnText = document.getElementById('mic-text');
        if(btnText) btnText.innerText = text;
    }
};

PioneerVoice.init();
