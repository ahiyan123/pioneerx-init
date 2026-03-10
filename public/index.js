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
    if (!stream || stream.innerText.trim().length < 5) {
        alert("Pioneer: No data found for report generation.");
        return;
    }

    const rawText = stream.innerText;
    const timestamp = new Date().toLocaleString();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // --- CASE 1: MOBILE (WhatsApp/System Share) ---
    if (isMobile && navigator.share) {
        const formattedReport = `*PIONEERX STRATEGIC AUDIT*\n_Date: ${timestamp}_\n\n` + 
                                rawText.replace(/> /g, "\n");
        try {
            await navigator.share({ title: 'PioneerX Audit', text: formattedReport });
        } catch (err) { this.fallbackWhatsApp(formattedReport); }
    } 
    
    // --- CASE 2: PC / WINDOWS (Direct PDF Download) ---
    else {
        this.logToTerminal("GENERATING_PDF_DOCUMENT...", "system-msg");
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // PDF Styling
        doc.setFillColor(0, 0, 0); // Black Background Header
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(0, 255, 0); // Pioneer Green
        doc.setFont("courier", "bold");
        doc.setFontSize(18);
        doc.text("PIONEERX STRATEGIC AUDIT", 15, 20);
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Timestamp: ${timestamp}`, 15, 40);
        doc.text(`Motto: Pioneer doesn't know to rest.`, 15, 45);

        // Content
        doc.setTextColor(0, 0, 0);
        doc.setFont("courier", "normal");
        const splitText = doc.splitTextToSize(rawText, 180);
        doc.text(splitText, 15, 60);

        // Save
        const filename = `PioneerX_Report_${Date.now()}.pdf`;
        doc.save(filename);
        this.logToTerminal(`DOCUMENT_SAVED: ${filename}`, "system-msg");
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
