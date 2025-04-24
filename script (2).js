const API_KEY = 'AIzaSyAqSmOEMOAgG8WvN2pIpzji8PR3XJvs_g0';
const quotes = {
    en: [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Life is what happens when you're busy making other plans. - John Lennon",
        "In the middle of every difficulty lies opportunity. - Albert Einstein",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
    ],
    es: [
        "La vida es lo que pasa mientras estás ocupado haciendo otros planes. - John Lennon",
        "El éxito no es definitivo, el fracaso no es fatal: es el coraje para continuar lo que cuenta. - Winston Churchill",
        "La única forma de hacer un gran trabajo es amar lo que haces. - Steve Jobs",
        "En medio de cada dificultad yace la oportunidad. - Albert Einstein",
        "El futuro pertenece a quienes creen en la belleza de sus sueños. - Eleanor Roosevelt"
    ],
    fr: [
        "La vie est ce qui se passe pendant que vous êtes occupé à faire d'autres projets. - John Lennon",
        "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte. - Winston Churchill",
        "La seule façon de faire du bon travail est d'aimer ce que vous faites. - Steve Jobs",
        "Au milieu de chaque difficulté se trouve une opportunité. - Albert Einstein",
        "L'avenir appartient à ceux qui croient en la beauté de leurs rêves. - Eleanor Roosevelt"
    ],
    de: [
        "Das Leben ist das, was passiert, während du damit beschäftigt bist, andere Pläne zu machen. - John Lennon",
        "Erfolg ist nicht endgültig, Misserfolg ist nicht fatal: Es ist der Mut weiterzumachen, der zählt. - Winston Churchill",
        "Die einzige Möglichkeit, großartige Arbeit zu leisten, ist, das zu lieben, was man tut. - Steve Jobs",
        "In der Mitte jeder Schwierigkeit liegt eine Gelegenheit. - Albert Einstein",
        "Die Zukunft gehört denen, die an die Schönheit ihrer Träume glauben. - Eleanor Roosevelt"
    ],
    it: [
        "La vita è ciò che accade mentre sei impegnato a fare altri progetti. - John Lennon",
        "Il successo non è definitivo, il fallimento non è fatale: è il coraggio di continuare che conta. - Winston Churchill",
        "L'unico modo per fare un lavoro straordinario è amare quello che fai. - Steve Jobs",
        "In mezzo a ogni difficoltà si trova l'opportunità. - Albert Einstein",
        "Il futuro appartiene a coloro che credono nella bellezza dei propri sogni. - Eleanor Roosevelt"
    ]
};

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const languageSelect = document.getElementById('language-select');

// Language codes mapping for speech synthesis
const languageCodes = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT'
};

function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getGeminiResponse(prompt, language) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate a meaningful quote in ${language} about: ${prompt}`
                    }]
                }]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        }
        return getRandomQuote(language);
    } catch (error) {
        console.error('Error fetching from Gemini API:', error);
        return getRandomQuote(language);
    }
}

function getRandomQuote(language) {
    const languageQuotes = quotes[language] || quotes['en'];
    return languageQuotes[Math.floor(Math.random() * languageQuotes.length)];
}

function speakQuote(quote, language) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance(quote);
    speech.lang = languageCodes[language] || 'en-US';
    
    // Set voice based on language
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(language)) || voices[0];
    speech.voice = voice;
    
    // Configure speech settings
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;
    
    window.speechSynthesis.speak(speech);
}

async function handleUserInput() {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        userInput.value = '';
        
        const language = languageSelect.value;
        
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot typing';
        typingIndicator.innerHTML = '<div class="message-content">Bot is typing...</div>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            const quote = await getGeminiResponse(message, language);
            typingIndicator.remove();
            addMessage(quote);
            speakQuote(quote, language);
        } catch (error) {
            typingIndicator.remove();
            const fallbackQuote = getRandomQuote(language);
            addMessage(fallbackQuote);
            speakQuote(fallbackQuote, language);
        }
    }
}

// Initialize speech synthesis voices
window.speechSynthesis.onvoiceschanged = function() {
    // Voices are now loaded
};

sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput();
    }
}); 