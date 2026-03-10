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
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // --- PDF Header ---
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(0, 255, 0);
    doc.setFont("courier", "bold");
    doc.setFontSize(18);
    doc.text("PIONEERX STRATEGIC AUDIT", 15, 22);
    doc.setFontSize(10);
    doc.text(`VALUE: Pioneer doesn't know to rest.`, 15, 30);

    // --- The Filtering Engine ---
    let y = 50;
    const messages = stream.querySelectorAll('p');
    let hasData = false;

    messages.forEach((p) => {
        // SKIP if it's a system log (ANALYZING, ERROR, etc.)
        if (p.classList.contains('system-msg')) return;

        hasData = true;
        const isUser = p.classList.contains('user-msg');
        
        // Format for the PDF
        doc.setFont("courier", isUser ? "bold" : "normal");
        doc.setTextColor(isUser ? 0 : 50, isUser ? 0 : 50, isUser ? 0 : 50);
        
        const label = isUser ? "QUESTION: " : "STRATEGY: ";
        const cleanText = p.innerText.replace("👤 ", "").replace("🤖 ", "");
        const wrappedText = doc.splitTextToSize(label + cleanText, 180);

        doc.text(wrappedText, 15, y);
        y += (wrappedText.length * 7) + 5;

        // New page if we run out of space
        if (y > 270) { doc.addPage(); y = 20; }
    });

    if (!hasData) {
        alert("No strategy data found to export.");
        return;
    }

    // --- Final Step: Smart Export ---
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
        // On mobile, just share the clean text to WhatsApp
        let shareText = "PIONEERX REPORT:\n";
        messages.forEach(p => { if(!p.classList.contains('system-msg')) shareText += p.innerText + "\n"; });
        await navigator.share({ text: shareText });
    } else {
        // On PC, download the clean PDF
        doc.save(`PioneerX_Strategic_Report.pdf`);
        this.logToTerminal("CLEAN_REPORT_DOWNLOADED", "system-msg");
    }
},

  logToTerminal(msg, type) {
    const stream = document.getElementById('output-stream');
    if (!stream) return;

    const p = document.createElement('p');
    p.className = type; // This MUST be 'user-msg', 'ai-msg', or 'system-msg'
    
    // Simple visual for the terminal UI
    p.innerText = (type === 'user-msg' ? "👤 " : type === 'ai-msg' ? "🤖 " : "⚙️ ") + msg;

    stream.appendChild(p);
    stream.scrollTop = stream.scrollHeight;
}
};
PioneerVoice.init();
