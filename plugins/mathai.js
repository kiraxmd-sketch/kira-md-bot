const axios = require('axios');

module.exports = {
    name: 'mathai',
    alias: ['math', 'mathgpt'],
    category: 'ai',
    description: 'Solve math problems with step-by-step explanations',
    usage: '.mathai <math problem>',
    
    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const query = args.join(' ').trim();

        if (!query) {
            return await sock.sendMessage(jid, { 
                text: '⚠️ *Please provide a math problem!*\n_Example: .mathai 2x + 5 = 15_' 
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, { react: { text: '⏳', key: msg.key } });

            // API Call
            const apiUrl = `https://eliteprotech-apis.zone.id/ai/mathgpt?q=${encodeURIComponent(query)}`;
            const res = await axios.get(apiUrl, { timeout: 30000 }); 

            if (!res.data || !res.data.status || !res.data.raw || !res.data.raw.content) {
                throw new Error('Invalid response from MathAI API');
            }

            let answerText = res.data.raw.content.trim();

            // 🔥 AI ഫോർമാറ്റിംഗ് വാട്സ്ആപ്പിന് അനുയോജ്യമായി മാറ്റുന്നു (Cleaning Extra Symbols)
            answerText = answerText
                .replace(/\$/g, '')        // $ ചിഹ്നങ്ങൾ പൂർണ്ണമായി ഒഴിവാക്കുന്നു
                .replace(/\*\*/g, '*')     // ** എന്നുള്ളത് മാറ്റി വാട്സ്ആപ്പ് ബോൾഡ് (*) ആക്കുന്നു
                .replace(/\\\(/g, '')      // \( ഒഴിവാക്കുന്നു                 .replace(/\\\)/g, '')      // \) ഒഴിവാക്കുന്നു
                .replace(/\\\[/g, '')      // \[ ഒഴിവാക്കുന്നു                 .replace(/\\\]/g, '');     // \] ഒഴിവാക്കുന്നു

            const finalMessage = `🧮 *MATH AI*\n\n*Q:* ${query}\n\n${answerText}`;

            await sock.sendMessage(jid, { text: finalMessage }, { quoted: msg });
            await sock.sendMessage(jid, { react: { text: '✅', key: msg.key } });

        } catch (err) {
            console.error('MATHAI ERROR:', err.message);
            await sock.sendMessage(jid, { react: { text: '❌', key: msg.key } });
            await sock.sendMessage(jid, { 
                text: '❌ Failed to solve the math problem. Please try again later.' 
            }, { quoted: msg });
        }
    }
};