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
    
    // 1. Check for data
    if (!stream || stream.children.length === 0) {
        alert("Pioneer: No conversation found to export.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // --- PDF BRANDING ---
    doc.setFillColor(0, 0, 0); 
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(0, 255, 0); 
    doc.setFont("courier", "bold");
    doc.setFontSize(18);
    doc.text("PIONEERX STRATEGIC REPORT", 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`DATE: ${timestamp}`, 15, 40);
    doc.text(`VALUE: Pioneer doesn't know to rest.`, 15, 45);
    doc.setDrawColor(0, 255, 0);
    doc.line(15, 50, 195, 50);

    // --- TEXT EXTRACTION ---
    let y = 60;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    // Loop through each paragraph in the terminal
    const entries = stream.querySelectorAll('p');
    entries.forEach((entry) => {
        let cleanLine = entry.innerText.replace(/> /g, "").trim();
        
        // Skip system messages like "ANALYZING..."
        if (cleanLine.includes("ANALYZING") || cleanLine.includes("CONSULTING")) return;

        // Apply styling based on who spoke
        if (entry.classList.contains('user-msg')) {
            doc.setFont("courier", "bold");
            cleanLine = `QUESTION: ${cleanLine.replace("USER:", "")}`;
        } else {
            doc.setFont("courier", "normal");
            cleanLine = `STRATEGY: ${cleanLine.replace("AI:", "")}`;
        }

        const splitText = doc.splitTextToSize(cleanLine, 175);
        
        // Check for page overflow
        if (y + (splitText.length * 7) > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text(splitText, 15, y);
        y += (splitText.length * 7) + 5; // Add space between entries
    });

    // --- EXPORT ---
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
        // On Mobile, we still use the share sheet for WhatsApp
        const textForShare = stream.innerText;
        await navigator.share({ title: 'PioneerX Report', text: textForShare });
    } else {
        // On PC, download the cleaned PDF
        doc.save(`PioneerX_Strategic_Audit.pdf`);
        this.logToTerminal("CLEAN_PDF_DOWNLOADED", "system-msg");
    }
},

   logToTerminal(msg, type) {
    const stream = document.getElementById('output-stream');
    if (!stream) return;

    const p = document.createElement('p');
    
    // 1. Assign the Class (Critical for the PDF Filter)
    p.className = type; // Expects 'user-msg', 'ai-msg', or 'system-msg'
    
    // 2. Add visual prefixes for the UI
    let prefix = "> ";
    if (type === 'user-msg') prefix = "👤 USER: ";
    if (type === 'ai-msg') prefix = "🤖 PIONEER: ";
    if (type === 'system-msg') prefix = "⚙️ ";

    p.innerText = `${prefix}${msg}`;
    
    // 3. Append and Auto-Scroll
    stream.appendChild(p);
    stream.scrollTop = stream.scrollHeight;
}
};
PioneerVoice.init();
