// plugins/aichat.js - KIRA X MD (Combined AI - No API Key Required, Fast & Clean)
const axios = require('axios');
const { getSettings } = require('../lib/database'); 

async function getAIResponse(sock, msg, jid, query, aiType, promptText) {
    try {
        const thinkingReact = aiType === 'gemini' ? '🧠' : '⚡';
        await sock.sendMessage(jid, { react: { text: thinkingReact, key: msg.key } });
        
        const thinking = await sock.sendMessage(jid, { text: `🤖 _Thinking..._` }, { quoted: msg });

        // 🔥 JerryCoder API-കളും EliteProTech ഫോള്‍ബാക്കും (Fast & Stable)
        const apis = [
            `https://jerrycoder.oggyapi.workers.dev/ai/gpt4?prompt=${encodeURIComponent(promptText)}&model=4.3`, // GPT-4 First Priority
            `https://jerrycoder.oggyapi.workers.dev/ai/gemini?prompt=${encodeURIComponent(promptText)}`,
            `https://jerrycoder.oggyapi.workers.dev/ai/gpt?q=${encodeURIComponent(promptText)}`,
            `https://eliteprotech-apis.zone.id/chatgpt?prompt=${encodeURIComponent(promptText)}`
        ];

        let aiReply = null;

        for (const apiUrl of apis) {
            try {
                const res = await axios.get(apiUrl, { timeout: 15000 });
                const data = res.data;

                if (typeof data === "string") {
                    aiReply = data;
                } else {
                    aiReply = data?.reply || data?.response || data?.result || data?.text || data?.message || "";
                }

                if (aiReply) break; 
            } catch (e) {
                console.log(`[${aiType.toUpperCase()}] API failed, trying next...`);
            }
        }

        if (!aiReply) {
            throw new Error("All AI APIs failed.");
        }

        // അനാവശ്യ പേരുകളും Formatting-ഉം ക്ലീൻ ആക്കുന്നു
        aiReply = String(aiReply)
            .replace(/ChatGPT|Gemini|Google AI|OpenAI|Groq/gi, "AI assistant")
            .replace(/\*/g, "") // Removes Bold Formatting
            .trim();

        // പഴയ Thinking മെസ്സേജ് മാറ്റി ഒറിജിനൽ മറുപടി വെക്കുന്നു
        try {
            await sock.sendMessage(jid, { text: aiReply }, { edit: thinking.key });
        } catch {
            await sock.sendMessage(jid, { text: aiReply }, { quoted: msg });
        }

        await sock.sendMessage(jid, { react: { text: "✨", key: msg.key } });

    } catch (err) {
        console.error(`${aiType.toUpperCase()} ERROR:`, err.message);
        await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        await sock.sendMessage(jid, { text: "❌ _Something went wrong, please try again later._" }, { quoted: msg });
    }
}

// ─── HELPER FUNCTION ───
function getBotConfig(sock) {
    const botNumber = sock.user.id.split(':')[0].replace(/[^0-9]/g, "");
    const config = getSettings(botNumber) || {};
    const botName = config.botName || process.env.BOT_NAME || 'KIRA X MD';
    const ownerName = config.ownerName || process.env.OWNER_NAME || 'the owner';
    return { botName, ownerName };
}

module.exports = [
    {
        name: 'gemini',
        alias: ['ai', 'ask'],
        category: 'ai',
        description: 'Ask anything to AI (Native Script Support)',
        usage: '.ai <question>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || '';
            
            let query = (args && Array.isArray(args)) ? args.join(' ') : '';
            if (!query && quotedText) query = quotedText;

            if (!query) {
                return await sock.sendMessage(jid, { text: "⚠️ *ചോദ്യം ടൈപ്പ് ചെയ്യുക!*\n_Example: .ai Who is Goku?_" }, { quoted: msg });
            }

            const { botName, ownerName } = getBotConfig(sock);
            const promptText = `You are ${botName}, a smart WhatsApp assistant created by ${ownerName}. You love anime. STRICT LANGUAGE RULE: You must reply in the EXACT SAME LANGUAGE the user uses. If the user types in English (e.g., 'Hi', 'How are you'), reply ONLY in English. If the user types in Malayalam, reply in pure Malayalam script. Never force Malayalam unless the user initiates it. Be friendly and casual.\n\nUser: ${query}`;

            await getAIResponse(sock, msg, jid, query, 'gemini', promptText);
        }
    },
    {
        name: 'groq',
        alias: ['groqai', 'chat'],
        category: 'ai',
        description: 'Ask anything to AI (Manglish Support)',
        usage: '.groq <question>',
        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || '';
            
            let query = (args && Array.isArray(args)) ? args.join(' ') : '';
            if (!query && quotedText) query = quotedText;

            if (!query) {
                return await sock.sendMessage(jid, { text: "⚠️ *Type a question!*\n_Example: .groq Who is Goku?_" }, { quoted: msg });
            }

            const { botName, ownerName } = getBotConfig(sock);
            const promptText = `You are ${botName}, a smart WhatsApp assistant created by ${ownerName}. You love anime. STRICT LANGUAGE RULE: You must reply in the EXACT SAME LANGUAGE the user uses. If the user types in English, reply ONLY in English. If the user types in Malayalam, reply in Manglish (Malayalam written in English letters) because your Malayalam script is bad. Do not use weird Malayalam script. Be friendly and casual.\n\nUser: ${query}`;

            await getAIResponse(sock, msg, jid, query, 'groq', promptText);
        }
    }
];