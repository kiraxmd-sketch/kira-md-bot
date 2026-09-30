module.exports = {
    name: "delete",
    alias: ["del,dlt"],
    category: "owner",

    async execute(sock, msg, args, isOwner) {
        const jid = msg.key.remoteJid;

        // Owner / Sudo Check
        if (!isOwner) {
            return await sock.sendMessage(jid, { text: "❌ *Owner only!*" }, { quoted: msg });
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        if (!quoted) {
            return await sock.sendMessage(jid, {
                text: "❌ *Reply to a bot message to delete it*"
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(
                jid,
                {
                    delete: {
                        remoteJid: jid,
                        fromMe: true,
                        id: quoted.stanzaId,
                        participant: quoted.participant // Added for better group support
                    }
                }
            );
            
            // Reaction for successful delete
            await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
        } catch (err) {
            console.error("Delete Error:", err);
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        }
    }
};