/**
 * PIONEERX COMPREHENSIVE CORE
 * [FEATURES]: Text Input + Voice Input + Multilingual AI + Unified Share Button
 */
const PioneerVoice = {
    recognition: null,
    synth: window.speechSynthesis,
    isListening: false,

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.onstart = () => {
                this.isListening = true;
                document.getElementById('mic-text').innerText = "LISTENING...";
            };
            this.recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                document.getElementById('user-input').value = transcript;
                window.runPioneer(); // Trigger your HTML's AI logic
            };
            this.recognition.onend = () => {
                this.isListening = false;
                document.getElementById('mic-text').innerText = "SYSTEM LISTEN";
            };
        }
    },

    toggleMic() {
        if (!this.recognition) return alert("Mic not supported");
        this.isListening ? this.recognition.stop() : this.recognition.start();
    },

    // --- THE MOUTH ---
    speakResponse(text) {
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        this.synth.speak(utterance);
    },

    // --- THE PDF FIX ---
    async shareReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Target the 'terminal' ID from your HTML
        const termContainer = document.getElementById('terminal');
        const entries = termContainer.querySelectorAll('.user-msg, .ai-msg');

        if (entries.length === 0) {
            alert("Pioneer: No data to export yet.");
            return;
        }

        let y = 40;
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(0, 255, 0);
        doc.setFont("courier", "bold");
        doc.text("PIONEERX STRATEGIC AUDIT", 15, 20);

       entries.forEach((el) => {
    const isUser = el.classList.contains('user-msg');
    // CLEANER: Remove bold stars and HTML tags before putting them in the PDF
    let cleanText = el.innerText.replace('[USER] ', '').replace('[PIONEER] ', '');
    cleanText = cleanText.replace(/\*\*/g, ''); // Removes the ** symbols
    
    doc.setTextColor(isUser ? 100 : 0);
    doc.setFont("courier", isUser ? "bold" : "normal");
    
    const prefix = isUser ? "Q: " : "A: ";
    // INCREASE WIDTH: Set to 170 to give the text more room to breathe
    const lines = doc.splitTextToSize(prefix + cleanText, 170);
    
    lines.forEach(line => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, 20, y);
        y += 7; // Standard line height
    });
    y += 3; // Extra gap between messages
});
        doc.save(`PioneerX_Strategic_Brief.pdf`);
    }
};

// Initialize the Ear
PioneerVoice.init();
