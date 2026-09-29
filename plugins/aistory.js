const axios = require('axios');

module.exports = {
    name: 'aistory',
    alias: ['story', 'makestory'],
    category: 'ai',
    description: 'Generate an AI story based on a prompt',
    usage: '.aistory <topic>',
    
    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const prompt = args.join(' ').trim();

        if (!prompt) {
            return await sock.sendMessage(jid, { 
                text: '⚠️ *Please provide a topic or theme!*\n_Example: .aistory a dark psychological thriller_' 
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });

            let storyText = "";

            try {
                // Primary API Call
                const apiUrl = `https://eliteprotech-apis.zone.id/ai/story?text=${encodeURIComponent(prompt)}`;
                const res = await axios.get(apiUrl, { timeout: 30000 }); 
                
                if (res.data && res.data.success && res.data.story) {
                    storyText = res.data.story;
                }
            } catch (apiErr) {
                console.log("Primary story API failed, trying fallback...");
            }

            // Fallback API (JerryCoder GPT-4) if Primary fails
            if (!storyText) {
                const systemPrompt = "You are a master storyteller. Write a gripping, suspenseful story based on the user's prompt. Incorporate elements of psychological thrillers akin to Death Note or Jeethu Joseph films where applicable. Do NOT use markdown formatting like asterisks for bolding.";
                const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;
                const fallbackUrl = `https://jerrycoder.oggyapi.workers.dev/ai/gpt4?prompt=${encodeURIComponent(fullPrompt)}&model=4.3`;
                
                const fallbackRes = await axios.get(fallbackUrl, { timeout: 30000 });
                storyText = fallbackRes.data?.reply || fallbackRes.data?.result || fallbackRes.data || "";
            }

            if (!storyText) {
                throw new Error('Invalid response from AI Story APIs');
            }

            // Clean up Markdown (Asterisks)
            storyText = String(storyText).replace(/\*/g, "").trim();

            const finalMessage = `📖 *AI STORY GENERATOR*\n\n*Prompt:* ${prompt}\n\n${storyText}`;

            await sock.sendMessage(jid, { text: finalMessage }, { quoted: msg });
            await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });

        } catch (err) {
            console.error('AISTORY ERROR:', err.message);
            await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
            await sock.sendMessage(jid, { 
                text: '❌ _Failed to generate story. Please try again later._' 
            }, { quoted: msg });
        }
    }
};