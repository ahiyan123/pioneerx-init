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
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                this.detectedAccent = e.results[0][0].lang;
                this.logToTerminal(`USER: ${transcript}`, 'user-msg');
                this.executeCommand(transcript);
            };
        }

        // Text Input Listener
        document.getElementById('pioneer-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cmd = e.target.value;
                this.logToTerminal(`USER: ${cmd}`, 'user-msg');
                e.target.value = "";
                this.executeCommand(cmd);
            }
        });
    },

    async executeCommand(cmd) {
        this.logToTerminal("ANALYZING...", "system-msg");
        try {
            const response = await puter.ai.chat(cmd);
            this.speakResponse(response.toString());
        } catch (err) { this.logToTerminal("ERROR: UPLINK LOST", "system-msg"); }
    },

    speakResponse(text) {
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.detectedAccent;
        this.synth.speak(utterance);
        this.logToTerminal(text, 'ai-msg');
    },

    async shareReport() {
    const stream = document.getElementById('output-stream');
    
    // 1. Check if the stream exists and has content
    if (!stream || stream.innerText.trim().length < 5) {
        this.logToTerminal("ERROR: NO_DATA_TO_EXPORT", "system-msg");
        alert("Pioneer: Terminal is empty. Generate a strategy first.");
        return;
    }

    // 2. Format the content for WhatsApp (Clean up the terminal formatting)
    const rawText = stream.innerText;
    const timestamp = new Date().toLocaleString();
    
    // This makes the report look clean: [USER] instead of > USER
    const formattedReport = `*PIONEERX STRATEGIC AUDIT*\n_Date: ${timestamp}_\n\n` + 
                            rawText.replace(/> USER:/g, "👤 *USER:*")
                                   .replace(/> /g, "🤖 *PIONEER:* ");

    // 3. Execute Share
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'PioneerX Strategic Briefing',
                text: formattedReport
            });
        } else {
            // Desktop/Old Browser Fallback
            window.open(`https://wa.me/?text=${encodeURIComponent(formattedReport)}`, '_blank');
        }
    } catch (err) {
        console.log("Share aborted by user.");
    }
},

    logToTerminal(msg, type) {
        const stream = document.getElementById('output-stream');
        const p = document.createElement('p');
        p.className = type;
        p.innerText = `> ${msg}`;
        stream.appendChild(p);
        stream.scrollTop = stream.scrollHeight;
    }
};
PioneerVoice.init();
