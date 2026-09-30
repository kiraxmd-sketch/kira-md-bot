module.exports = [
    {
        name: 'kick',
        category: 'group',
        description: 'Remove a member from the group',
        
        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return sock.sendMessage(jid, { text: "❌ *This command can only be used in groups!*" }, { quoted: msg });

            // 🚨 PERFECT JID NORMALIZATION
            const botNumber = sock.user.id.split(":")[0].replace(/[^0-9]/g, "");
            
            const senderRaw = msg.key.fromMe ? botNumber : (msg.key.participant || msg.key.remoteJid || "");
            const senderNumber = senderRaw.split(":")[0].replace(/[^0-9]/g, "");
            const senderJid = senderNumber + '@s.whatsapp.net';

            let groupMetadata;
            try {
                groupMetadata = await sock.groupMetadata(jid);
            } catch (e) {
                return sock.sendMessage(jid, { text: "❌ *Failed to get group metadata!*" }, { quoted: msg });
            }

            // Check Admins
            const participants = groupMetadata.participants;
            
            // 🔥 Bot Admin Check FIX (Matching exact raw number to avoid : syntax issues)
            const botAdmin = participants.find(p => p.id.split(":")[0].replace(/[^0-9]/g, "") === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));
            const senderAdmin = participants.find(p => p.id.split(":")[0].replace(/[^0-9]/g, "") === senderNumber && (p.admin === 'admin' || p.admin === 'superadmin'));

            if (!senderAdmin && !isOwner) {
                return sock.sendMessage(jid, { text: "❌ *Group Admins only!*" }, { quoted: msg });
            }

            if (!botAdmin) {
                return sock.sendMessage(jid, { text: "❌ *Make sure I have Admin privileges first!*" }, { quoted: msg });
            }

            // Target extraction
            const quotedJid = msg.message?.extendedTextMessage?.contextInfo?.participant;
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            let target = quotedJid || (mentionedJid && mentionedJid.length > 0 ? mentionedJid[0] : null);

            if (!target && args.length > 0) {
                target = args[0];
            }

            if (!target) return sock.sendMessage(jid, { text: "❌ *Reply to or mention the user to kick!*" }, { quoted: msg });

            // Normalize Target ID securely
            const targetNumber = target.split(":")[0].replace(/[^0-9]/g, "");
            target = targetNumber + '@s.whatsapp.net';

            if (targetNumber === botNumber) return sock.sendMessage(jid, { text: "❌ *I can't kick myself!*" }, { quoted: msg });
            if (targetNumber === senderNumber && !msg.key.fromMe) return sock.sendMessage(jid, { text: "❌ *You can't kick yourself!*" }, { quoted: msg });

            // Check if target is admin (Bot cannot kick creator)
            const targetAdmin = participants.find(p => p.id.split(":")[0].replace(/[^0-9]/g, "") === targetNumber && (p.admin === 'admin' || p.admin === 'superadmin'));
            if (targetAdmin && !isOwner) {
                return sock.sendMessage(jid, { text: "❌ *You cannot kick another admin!*" }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                await sock.groupParticipantsUpdate(jid, [target], "remove");
                await sock.sendMessage(jid, { text: `✅ *@${targetNumber} has been kicked!*`, mentions: [target] }, { quoted: msg });
            } catch (e) {
                console.error("Kick Error:", e);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed! Need higher admin privilege or user is the creator.*" }, { quoted: msg });
            }
        }
    },

    {
        name: 'kickall',
        category: 'group',
        description: 'Remove all non-admin members from the group',
        
        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return sock.sendMessage(jid, { text: "❌ *This command can only be used in groups!*" }, { quoted: msg });

            const botNumber = sock.user.id.split(":")[0].replace(/[^0-9]/g, "");
            
            const senderRaw = msg.key.fromMe ? botNumber : (msg.key.participant || msg.key.remoteJid || "");
            const senderNumber = senderRaw.split(":")[0].replace(/[^0-9]/g, "");

            let groupMetadata;
            try {
                groupMetadata = await sock.groupMetadata(jid);
            } catch (e) {
                return sock.sendMessage(jid, { text: "❌ *Failed to get group metadata!*" }, { quoted: msg });
            }

            const participants = groupMetadata.participants;
            
            // 🔥 Bot Admin Check FIX 
            const botAdmin = participants.find(p => p.id.split(":")[0].replace(/[^0-9]/g, "") === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));
            const senderAdmin = participants.find(p => p.id.split(":")[0].replace(/[^0-9]/g, "") === senderNumber && (p.admin === 'admin' || p.admin === 'superadmin'));

            if (!senderAdmin && !isOwner) {
                return sock.sendMessage(jid, { text: "❌ *Group Admins only!*" }, { quoted: msg });
            }

            if (!botAdmin) {
                return sock.sendMessage(jid, { text: "❌ *Make sure I have Admin privileges first!*" }, { quoted: msg });
            }

            // Mattu adminmareyum botineyum ozhivakki membersine mathram select cheyyunnu
            const targetMembers = participants
                .filter(p => {
                    const idNum = p.id.split(":")[0].replace(/[^0-9]/g, "");
                    return idNum !== botNumber && idNum !== senderNumber && p.admin !== 'admin' && p.admin !== 'superadmin';
                })
                .map(p => p.id);

            if (targetMembers.length === 0) {
                return sock.sendMessage(jid, { text: "⚠️ *No non-admin members found to kick!*" }, { quoted: msg });
            }

            await sock.sendMessage(jid, { 
                text: `⚠️ *KICKALL INITIATED!* ⚠️\n\nRemoving ${targetMembers.length} members...\n\n_To stop this process immediately, use .restart or .reboot_` 
            }, { quoted: msg });

            // Safe delay 
            for (const target of targetMembers) {
                try {
                    await sock.groupParticipantsUpdate(jid, [target], "remove");
                    await new Promise(resolve => setTimeout(resolve, 1500)); 
                } catch (e) {
                    console.error("Kickall Error:", e.message);
                }
            }

            await sock.sendMessage(jid, { text: "✅ *Kickall process completed.*" }, { quoted: msg });
        }
    }
];