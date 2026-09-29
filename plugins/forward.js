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
    description: "Powerful Forward to Group/User/Channel",
    usage: `${process.env.PREFIX || '.'}forward <JID>`,

    async execute(sock, msg, args, isOwner) {
        const jid = msg.key.remoteJid;
        if (!isOwner) return await sock.sendMessage(jid, { text: "❌ *Owner only!*" }, { quoted: msg });

        const target = getTarget(args.join(" "));
        if (!target) return await sock.sendMessage(jid, { text: "⚠️ *Invalid JID!*\nExample: .fwd 120363xxx@newsletter" }, { quoted: msg });

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
                const text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
                await sock.sendMessage(target, { text: text });
                
            // 2. Audio & Voice Notes
            } else if (mimeType === 'audioMessage') {
                const stream = await downloadContentFromMessage(content, 'audio');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                // PTT (Voice note) aayi thanne ayakkanam
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
                
                await sock.sendMessage(target, { 
                    image: buffer, 
                    caption: content.caption || '' 
                });

            // 4. Video Messages
            } else if (mimeType === 'videoMessage') {
                const stream = await downloadContentFromMessage(content, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                await sock.sendMessage(target, { 
                    video: buffer, 
                    caption: content.caption || '',
                    mimetype: content.mimetype || 'video/mp4'
                });

            // 5. Document Messages
            } else if (mimeType === 'documentMessage') {
                const stream = await downloadContentFromMessage(content, 'document');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                await sock.sendMessage(target, { 
                    document: buffer,
                    fileName: content.fileName || 'document',
                    mimetype: content.mimetype,
                    caption: content.caption || ''
                });

            // 6. Sticker Messages
            } else if (mimeType === 'stickerMessage') {
                const stream = await downloadContentFromMessage(content, 'sticker');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
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