/**
 * PIONEERX COMPREHENSIVE CORE (v3.0)
 * [INTEGRATION]: Text + Voice -> Puter AI -> Multilingual TTS -> PDF/WA Export
 */

const PioneerVoice = {
    recognition: null,
    synth: window.speechSynthesis,
    isListening: false,
    detectedAccent: 'en-US',

    init() {
        // --- 1. SPEECH ENGINE SETUP ---
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = navigator.language || 'en-US';

            this.recognition.onstart = () => { 
                this.isListening = true; 
                this.updateUI("LISTENING...", true); 
            };
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.detectedAccent = event.results[0][0].lang || navigator.language;
                this.logToTerminal(`USER (VOICE): ${transcript}`, 'user-msg');
                this.executeCommand(transcript);
            };
            this.recognition.onend = () => { 
                this.isListening = false; 
                this.updateUI("SYSTEM LISTEN", false); 
            };
        }

        // --- 2. TEXT INPUT SETUP ---
        const inputField = document.getElementById('pioneer-input');
        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && inputField.value.trim() !== "") {
                    const cmd = inputField.value;
                    // For text input, we use the browser's default lang for the voice
                    this.detectedAccent = navigator.language || 'en-US'; 
                    this.logToTerminal(`USER (TEXT): ${cmd}`, 'user-msg');
                    inputField.value = ""; 
                    this.executeCommand(cmd);
                }
            });
        }
    },

    toggleMic() {
        if (this.synth.speaking) this.synth.cancel();
        if (!this.isListening) {
            this.synth.speak(new SpeechSynthesisUtterance("")); // Unlock browser audio
            try { this.recognition.start(); } catch (e) { console.error(e); }
        } else { this.recognition.stop(); }
    },

    // --- 3. THE BRAIN (Integrated AI) ---
    async executeCommand(cmd) {
        this.logToTerminal("ANALYZING STRATEGIC DATA...", "system-msg");
        try {
            const response = await puter.ai.chat(cmd);
            const responseText = response.toString();
            this.speakResponse(responseText);
        } catch (error) {
            this.logToTerminal("ERROR: UPLINK TIMEOUT", "system-msg");
            this.speakResponse("Connection lost. Re-verify protocols.");
        }
    },

    // --- 4. THE MOUTH (Multilingual Mirror) ---
    speakResponse(text) {
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.detectedAccent;
        
        const voices = this.synth.getVoices();
        let targetVoice = voices.find(v => v.lang === this.detectedAccent) || 
                          voices.find(v => v.lang.startsWith(this.detectedAccent.split('-')[0])) || 
                          voices[0];
        
        utterance.voice = targetVoice;
        utterance.rate = 0.95;
        this.synth.speak(utterance);
        this.logToTerminal(text, 'ai-msg');
    },

    // --- 5. UNIFIED SHARE ENGINE (Text & Voice) ---
    async shareReport() {
        const stream = document.getElementById('output-stream');
        if (!stream || stream.innerText.trim() === "") return;

        const timestamp = new Date().toLocaleString();
        const fullContent = `--- PIONEERX STRATEGIC AUDIT [${timestamp}] ---\n\n${stream.innerText}`;

        // 1. WhatsApp & System Share
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `PioneerX Audit ${timestamp}`,
                    text: fullContent,
                });
            } catch (err) { this.fallbackWhatsApp(fullContent); }
        } else {
            this.fallbackWhatsApp(fullContent);
        }

        // 2. PDF Download
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFont("courier", "bold");
        doc.text("PIONEERX AUDIT LOG", 10, 10);
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(fullContent, 180);
        doc.text(splitText, 10, 20);
        doc.save(`Audit_${Date.now()}.pdf`);
    },

    fallbackWhatsApp(text) {
        const encodedText = encodeURIComponent(`*PIONEERX REPORT*\n${text}`);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    },

    logToTerminal(msg, type) {
        const stream = document.getElementById('output-stream');
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
