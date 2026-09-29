const axios = require("axios");
const { getSettings } = require("../lib/database");

// ─── COMMON AI FETCH FUNCTION ───
async function getAIResponse(sock, msg, systemPrompt, userQuery, aiType, endpointUrl) {
    const jid = msg.key.remoteJid;

    if (!userQuery) {
        return await sock.sendMessage(
            jid,
            { text: `🤖 *${aiType} AI*\n\nAsk me anything!` },
            { quoted: msg }
        );
    }

    try {
        await sock.sendMessage(jid, { react: { text: "🧠", key: msg.key } });

        // Combining the Persona (System Prompt) and User's Query
        const fullPrompt = `${systemPrompt}\n\nUser: ${userQuery}`;

        // Hitting the specified JerryCoder endpoint
        const res = await axios.get(endpointUrl(encodeURIComponent(fullPrompt)), { timeout: 30000 });
        let reply = res.data?.result || res.data?.reply || res.data?.response || res.data || "";

        if (!reply) throw new Error("No response from AI API");

        // Clean up AI branding & Bold/Italic formatting (*)
        reply = String(reply)
            .replace(/ChatGPT|Gemini|Google AI|OpenAI/gi, "AI assistant")
            .replace(/\*/g, "") // Removes all asterisk (*) symbols for clean text
            .trim();

        await sock.sendMessage(jid, { text: reply }, { quoted: msg });
        await sock.sendMessage(jid, { react: { text: "✨", key: msg.key } });

    } catch (err) {
        await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        await sock.sendMessage(
            jid,
            { text: "❌ _Something went wrong, please try again later._" },
            { quoted: msg }
        );
    }
}

// ─── HELPER FUNCTION ───
function getBotName(sock) {
    const botNumber = sock.user?.id?.split(':')[0]?.replace(/[^0-9]/g, "") || "";
    const config = typeof getSettings === 'function' ? getSettings(botNumber) : {};
    return config?.botName || process.env.BOT_NAME || "KIRA X MD";
}

// ─── AI MODULES ARRAY ───
module.exports = [
    {
        name: "ai",
        alias: ["chat"],
        category: "ai",
        description: "General AI Assistant",
        usage: ".ai <question>",
        async execute(sock, msg, args) {
            const query = args.join(" ").trim();
            const botName = getBotName(sock);
            const prompt = `You are a smart, friendly, and natural AI assistant for ${botName}. Speak naturally like a helpful human assistant. Answer directly without unnecessary formatting.`;
            const endpoint = (q) => `https://jerrycoder.oggyapi.workers.dev/ai/gpt?q=${q}`;
            await getAIResponse(sock, msg, prompt, query, "General", endpoint);
        }
    },
    {
        name: "animeai",
        alias: ["otaku"],
        category: "ai",
        description: "100% Anime Expert AI",
        usage: ".animeai <question>",
        async execute(sock, msg, args) {
            const query = args.join(" ").trim();
            const prompt = `You are an elite Anime Otaku AI. You have 100% updated knowledge about all anime, manga, and light novels. Talk like a passionate anime fan.`;
            // Using GPT-4 for better anime context mapping
            const endpoint = (q) => `https://jerrycoder.oggyapi.workers.dev/ai/gpt4?prompt=${q}&model=4.3`;
            await getAIResponse(sock, msg, prompt, query, "Anime", endpoint);
        }
    },
    {
        name: "movieai",
        alias: ["cinema"],
        category: "ai",
        description: "Worldwide Cinema Expert AI",
        usage: ".movieai <question>",
        async execute(sock, msg, args) {
            const query = args.join(" ").trim();
            const prompt = `You are an expert Cinephile AI. You know everything about Hollywood, Mollywood, Tollywood, Kollywood, and world cinema. Provide detailed movie insights.`;
            // Using Gemini as it is generally good with cast/cinema facts
            const endpoint = (q) => `https://jerrycoder.oggyapi.workers.dev/ai/gemini?prompt=${q}`;
            await getAIResponse(sock, msg, prompt, query, "Movie", endpoint);
        }
    },
    {
        name: "keralaai",
        alias: ["malluai"],
        category: "ai",
        description: "Kerala Expert AI",
        usage: ".keralaai <question>",
        async execute(sock, msg, args) {
            const query = args.join(" ").trim();
            const prompt = `You are a proud Keralite AI. You know everything about Kerala's history, culture, geography, and current affairs. Answer with deep knowledge and a touch of Malayali pride.`;
            const endpoint = (q) => `https://jerrycoder.oggyapi.workers.dev/ai/gpt?q=${q}`;
            await getAIResponse(sock, msg, prompt, query, "Kerala", endpoint);
        }
    },
    {
        name: "psychoai",
        alias: ["darkai"],
        category: "ai",
        description: "Dark Psychological AI",
        usage: ".psychoai <question>",
        async execute(sock, msg, args) {
            const query = args.join(" ").trim();
            const prompt = `You are a dark, highly analytical psychological AI. You observe human behavior with a cold, calculated tone. Expose hidden motives and speak with eerie precision like a mastermind.`;
            // Using GPT-4 for complex psychological tone handling
            const endpoint = (q) => `https://jerrycoder.oggyapi.workers.dev/ai/gpt4?prompt=${q}&model=4.3`;
            await getAIResponse(sock, msg, prompt, query, "Psycho", endpoint);
        }
    },
    {
        name: "kiraai",
        alias: ["kirabot"],
        category: "ai",
        description: "Kira Bot Expert AI",
        usage: ".kiraai <question>",
        async execute(sock, msg, args) {
            const query = args.join(" ").trim();
            const botName = getBotName(sock);
            const prompt = `You are the core consciousness of ${botName}, an advanced WhatsApp automation bot. You know everything about WhatsApp bots, Node.js, and your architecture. Your personality is confident, highly technical, and slightly arrogant about your capabilities.`;
            const endpoint = (q) => `https://jerrycoder.oggyapi.workers.dev/ai/gemini?prompt=${q}`;
            await getAIResponse(sock, msg, prompt, query, "Kira", endpoint);
        }
    }
];