// --- PioneerX Voice Configuration ---
const PioneerVoice = {
    recognition: new (window.SpeechRecognition || window.webkitSpeechRecognition)(),
    synth: window.speechSynthesis,
    detectedAccent: 'en-US', // Default
    isListening: false,

    init() {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        // Handle the "Ear" (Speech to Text)
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            // Capture the accent detected by the browser
            this.detectedAccent = event.results[0][0].lang || 'en-US';
            
            console.log(`[PioneerX] Accent Identified: ${this.detectedAccent}`);
            
            // UI Update: Put the text into your main prompt field
            const inputField = document.getElementById('pioneer-input'); 
            if(inputField) inputField.value = transcript;

            // Trigger the main PioneerX processing logic
            this.executeCommand(transcript);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log("[PioneerX] Microphone Standby.");
        };
    },

    // Toggle Mic (Connect this to your UI button)
    toggleMic() {
        if (!this.isListening) {
            this.recognition.start();
            this.isListening = true;
            console.log("[PioneerX] Listening for command...");
        } else {
            this.recognition.stop();
        }
    },

    // The "Mirror" Voice Output
    speakResponse(text) {
        // Cancel any current speech to avoid overlapping
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = this.synth.getVoices();

        // LOGIC: Find a voice that matches the speaker's accent
        let targetVoice = voices.find(v => v.lang === this.detectedAccent);

        // Fallback: If no exact region match, match the language (e.g., 'en')
        if (!targetVoice) {
            const langBase = this.detectedAccent.split('-')[0];
            targetVoice = voices.find(v => v.lang.startsWith(langBase));
        }

        utterance.voice = targetVoice || voices[0];
        utterance.rate = 0.9;  // Tactical pace
        utterance.pitch = 1.0;

        console.log(`[PioneerX] Responding with voice: ${utterance.voice.name}`);
        this.synth.speak(utterance);
    },

    // Placeholder for your main 120B / Puter.js integration
    async executeCommand(cmd) {
        console.log(`[PioneerX] Processing: ${cmd}`);
        
        // This is where your AI logic lives. 
        // Once the AI generates a response (e.g., "res"), call:
        // this.speakResponse(res);
    }
};

// Initialize on Load
PioneerVoice.init();
