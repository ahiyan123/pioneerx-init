/**
 * PIONEERX COMPREHENSIVE CORE (v4.0)
 * [INTEGRATION]: Text/Voice Input -> AI -> Multilingual TTS -> Per-Prompt Auto-Share
 */

const PioneerVoice = {
    recognition: null,
    synth: window.speechSynthesis,
    isListening: false,
    detectedAccent: 'en-US',

    init() {
        // --- 1. ENGINES SETUP ---
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = navigator.language || 'en-US';

            this.recognition.onstart = () => { this.isListening = true; this.updateUI("LISTENING...", true); };
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.detectedAccent = event.results[0][0].lang;
                this.logToTerminal(`USER: ${transcript}`, 'user-msg');
                this.executeCommand(transcript);
            };
            this.recognition.onend = () => { this.isListening = false; this.updateUI("SYSTEM LISTEN", false); };
        }

        const inputField = document.getElementById('pioneer-input');
        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && inputField.value.trim() !== "") {
                    const cmd = inputField.value;
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

    // --- 2. BRAIN & MOUTH ---
    async executeCommand(cmd) {
        this.logToTerminal("CONSULTING_PIONEER_120B...", "system-msg");
        try {
            const response = await puter.ai.chat(cmd);
            const responseText = response.toString();
            this.speakResponse(responseText);
        } catch (error) {
            this.logToTerminal("ERROR: UPLINK_TIMEOUT", "system-msg");
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
        
        // Final Log with the Auto-Share trigger enabled
        this.logToTerminal(text, 'ai-msg', true);
    },

    // --- 3. THE UNIFIED LOGGER & SHARE ENGINE ---
    logToTerminal(msg, type, showShare = false) {
        const stream = document.getElementById('output-stream');
        if(!stream) return;

        const p = document.createElement('p');
        p.className = type;
        p.innerHTML = `> ${msg}`;
        
        if (showShare) {
            // Create the individual share link for this specific response
            const shareBtn = document.createElement('span');
            shareBtn.innerHTML = ` <a href="#" style="color: #00ff00; font-size: 0.8em; text-decoration: none; border: 1px solid #00ff00; padding: 0 4px; margin-left: 10px; cursor: pointer;">SHARE</a>`;
            shareBtn.onclick = (e) => {
                e.preventDefault();
                this.shareToWhatsApp(msg);
            };
            p.appendChild(shareBtn);
        }

        stream.appendChild(p);
        stream.scrollTop = stream.scrollHeight;
    },

    async shareToWhatsApp(text) {
        const timestamp = new Date().toLocaleTimeString();
        const formattedText = `*PIONEERX REPORT [${timestamp}]*\n\n${text}`;
        
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Strategic Alert', text: formattedText });
            } catch (err) { this.fallbackWhatsApp(formattedText); }
        } else {
            this.fallbackWhatsApp(formattedText);
        }
    },

    fallbackWhatsApp(text) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    },

    updateUI(text, active) {
        const btnText = document.getElementById('mic-text');
        if(btnText) btnText.innerText = text;
    }
};

PioneerVoice.init();
