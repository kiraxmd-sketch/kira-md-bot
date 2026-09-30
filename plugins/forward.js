const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

function getTarget(s) {
    s = String(s || "").trim();
    if (s.includes("@g.us") || s.includes("@s.whatsapp.net") || s.includes("@newsletter")) return s;
    if (/^\d+$/.test(s)) return `${s}@s.whatsapp.net`;
    return null;
}

module.exports = {
    name: "forward",
    alias: ["fwd", "push"],
    category: "owner",
    description: "Powerful Forward to Group/User/Channel with custom caption",
    usage: `${process.env.PREFIX || '.'}forward <JID> [Custom Caption]`,

    async execute(sock, msg, args, isOwner) {
        const jid = msg.key.remoteJid;
        if (!isOwner) return await sock.sendMessage(jid, { text: "❌ *Owner only!*" }, { quoted: msg });

        if (args.length === 0) {
            return await sock.sendMessage(jid, { text: "⚠️ *Usage:*\n.fwd <Target JID> [Optional Caption]" }, { quoted: msg });
        }

        // ─── Extract Target and Custom Caption ───
        const target = getTarget(args[0]);
        if (!target) return await sock.sendMessage(jid, { text: "⚠️ *Invalid JID!*\nExample: .fwd 120363xxx@newsletter My Caption" }, { quoted: msg });

        // ബാക്കിയുള്ള ആർഗ്യുമെന്റ്സ് എല്ലാം കൂട്ടി കസ്റ്റം ക്യാപ്ഷൻ ആക്കുന്നു
        const customCaption = args.slice(1).join(" ").trim();

        const ctx = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = ctx?.quotedMessage;
        
        if (!quotedMsg) {
            return await sock.sendMessage(jid, { text: "⚠️ *Reply to a message to forward!*" }, { quoted: msg });
        }

        await sock.sendMessage(jid, { react: { text: "🚀", key: msg.key } });

        try {
            const mimeType = Object.keys(quotedMsg)[0];
            const content = quotedMsg[mimeType];

            // 1. Text Messages
            if (mimeType === 'conversation' || mimeType === 'extendedTextMessage') {
                // ടെക്സ്റ്റ് മെസ്സേജ് ആണെങ്കിൽ കസ്റ്റം ക്യാപ്ഷൻ ഉണ്ടെങ്കിൽ അത് അയക്കും, അല്ലെങ്കിൽ പഴയ മെസ്സേജ് തന്നെ അയക്കും
                const originalText = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
                const finalToSend = customCaption ? `${customCaption}\n\n${originalText}` : originalText;
                
                await sock.sendMessage(target, { text: finalToSend });
                
            // 2. Audio & Voice Notes
            } else if (mimeType === 'audioMessage') {
                const stream = await downloadContentFromMessage(content, 'audio');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                // ഓഡിയോയ്ക്ക് ക്യാപ്ഷൻ ഇല്ല, അതുകൊണ്ട് നേരിട്ട് അയക്കുന്നു
                await sock.sendMessage(target, { 
                    audio: buffer, 
                    mimetype: content.mimetype || 'audio/ogg; codecs=opus', 
                    ptt: content.ptt || false 
                });

            // 3. Image Messages
            } else if (mimeType === 'imageMessage') {
                const stream = await downloadContentFromMessage(content, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                const finalCaption = customCaption !== "" ? customCaption : (content.caption || '');
                
                await sock.sendMessage(target, { 
                    image: buffer, 
                    caption: finalCaption 
                });

            // 4. Video Messages
            } else if (mimeType === 'videoMessage') {
                const stream = await downloadContentFromMessage(content, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                const finalCaption = customCaption !== "" ? customCaption : (content.caption || '');

                await sock.sendMessage(target, { 
                    video: buffer, 
                    caption: finalCaption,
                    mimetype: content.mimetype || 'video/mp4'
                });

            // 5. Document Messages
            } else if (mimeType === 'documentMessage') {
                const stream = await downloadContentFromMessage(content, 'document');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                const finalCaption = customCaption !== "" ? customCaption : (content.caption || '');

                await sock.sendMessage(target, { 
                    document: buffer,
                    fileName: content.fileName || 'document',
                    mimetype: content.mimetype,
                    caption: finalCaption
                });

            // 6. Sticker Messages
            } else if (mimeType === 'stickerMessage') {
                const stream = await downloadContentFromMessage(content, 'sticker');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                // സ്റ്റിക്കറിന് ക്യാപ്ഷൻ ഇല്ല
                await sock.sendMessage(target, { sticker: buffer });
            } else {
                return await sock.sendMessage(jid, { text: "⚠️ *Unsupported message type!*" }, { quoted: msg });
            }

            await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

        } catch (error) {
            console.error("❌ FORWARD ERROR:", error);
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            await sock.sendMessage(jid, { text: `❌ *Failed to forward!*\nError: ${error.message}` }, { quoted: msg });
        }
    }
};