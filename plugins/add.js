// plugins/add.js – KIRA X MD (Minimalist Add User)
module.exports = {
    name: 'add',
    alias: ['addmember'],
    category: 'group',
    description: 'Add a user to the group (mention, reply, or number)',
    usage: `${process.env.PREFIX || '.'}add <@mention | reply | phone number>`,

    async execute(sock, msg, args, isOwner) {
        const jid = msg.key.remoteJid;
        if (!jid.endsWith('@g.us')) return;

        // ─── Admin Check ───
        const sender = msg.key.participant || msg.key.remoteJid;
        const groupMetadata = await sock.groupMetadata(jid);
        const isAdmin = groupMetadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));

        if (!isAdmin && !isOwner) {
            return await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        }

        // ─── Get Target ───
        let target = null;

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentioned && mentioned.length > 0) {
            target = mentioned[0];
        }

        if (!target) {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant;
                if (quotedSender) target = quotedSender;
                else if (quoted.key?.participant) target = quoted.key.participant;
                else if (quoted.key?.remoteJid) target = quoted.key.remoteJid;
            }
        }

        if (!target && args && args.length > 0) {
            const phone = args[0].replace(/[^0-9]/g, '');
            if (phone.length >= 10) {
                target = phone + '@s.whatsapp.net';
            }
        }

        if (!target || target === sender) {
            return await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        }

        // ─── Try to add ───
        try {
            await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
            const res = await sock.groupParticipantsUpdate(jid, [target], "add");
            
            // 🔥 Baileys Error Check
            let isRestricted = false;
            if (Array.isArray(res) && res[0]) {
                if (res[0].status == 403 || res[0].status == 463 || res[0].status == 409 || res[0].status == 408) {
                    isRestricted = true;
                }
            }

            if (isRestricted) {
                throw new Error("restricted"); 
            }

            // Success Message
            await sock.sendMessage(jid, {
                text: `✅ User added: @${target.split('@')[0]}`,
                mentions: [target]
            }, { quoted: msg });
            
            await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

        } catch (err) {
            // Failed -> Just Reaction, no messages!
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
        }
    }
};