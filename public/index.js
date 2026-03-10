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
    // 1. Target the terminal
    const stream = document.getElementById('output-stream');
    
    // 2. Extract clean text (handles HTML and extra spaces)
    const rawText = stream.innerText || stream.textContent;
    const cleanText = rawText.trim();

    // 3. Robust Data Validation
    if (!cleanText || cleanText.length < 10) {
        this.logToTerminal("CRITICAL: NO_CONTENT_TO_PDF", "system-msg");
        alert("Pioneer: Please wait for the AI to finish or enter a prompt first.");
        return;
    }

    const timestamp = new Date().toLocaleString();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // --- CASE 1: MOBILE (WhatsApp/System) ---
    if (isMobile && navigator.share) {
        const formattedReport = `*PIONEERX STRATEGIC AUDIT*\n_Date: ${timestamp}_\n\n` + 
                                cleanText.replace(/> /g, "\n");
        try {
            await navigator.share({ title: 'PioneerX Audit', text: formattedReport });
        } catch (err) { this.fallbackWhatsApp(formattedReport); }
    } 
    
    // --- CASE 2: PC/WINDOWS (Direct PDF Download) ---
    else {
        this.logToTerminal("INITIATING_PDF_ENGINE...", "system-msg");
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Professional Branding
            doc.setFillColor(20, 20, 20); // Dark Header
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(0, 255, 0); // Pioneer Green
            doc.setFont("courier", "bold");
            doc.setFontSize(22);
            doc.text("PIONEERX STRATEGIC AUDIT", 15, 20);
            
            doc.setFontSize(10);
            doc.text(`MOTTO: Pioneer doesn't know to rest.`, 15, 30);
            doc.setTextColor(150, 150, 150);
            doc.text(`TIMESTAMP: ${timestamp}`, 15, 35);

            // The Data Body
            doc.setTextColor(40, 40, 40);
            doc.setFont("courier", "normal");
            doc.setFontSize(11);
            
            // Split text to fit page width
            const splitText = doc.splitTextToSize(cleanText, 180);
            doc.text(splitText, 15, 55);

            // Final Export
            doc.save(`PioneerX_Audit_${Date.now()}.pdf`);
            this.logToTerminal("PDF_GENERATION_SUCCESSFUL", "system-msg");
        } catch (error) {
            console.error("PDF Error:", error);
            alert("PDF Engine failed. Check if jsPDF library is loaded.");
        }
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
