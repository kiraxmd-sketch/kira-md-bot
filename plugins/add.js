// plugins/add.js – KIRA X MD (Smart Add User - Super Strong Fix)
module.exports = {
    name: 'add',
    alias: ['addmember'],
    category: 'group',
    description: 'Add a user to the group (mention, reply, or number)',
    usage: `${process.env.PREFIX || '.'}add <@mention | reply | phone number>`,

    async execute(sock, msg, args, isOwner) {
        const jid = msg.key.remoteJid;
        if (!jid.endsWith('@g.us')) {
            return await sock.sendMessage(jid, { text: "❌ *This command can only be used in groups!*" }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // ─── Metadata & Admin Checks ───
        const groupMetadata = await sock.groupMetadata(jid);
        const isAdmin = groupMetadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
        const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));

        if (!isAdmin && !isOwner) {
            return await sock.sendMessage(jid, { text: "❌ *Group Admins only!*" }, { quoted: msg });
        }

        if (!isBotAdmin) {
            return await sock.sendMessage(jid, { text: "❌ *I need to be an Admin to add users!*" }, { quoted: msg });
        }

        // ─── Get Target Number ───
        let target = null;
        
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (mentioned && mentioned.length > 0) {
            target = mentioned[0]; // From mention
        } else if (quotedSender) {
            target = quotedSender; // From reply
        } else if (args && args.length > 0) {
            // 🔥 Fix: Combine all args so +91 98765 43210 or spaces work perfectly
            const phone = args.join('').replace(/[^0-9]/g, '');
            if (phone.length >= 10) {
                target = phone + '@s.whatsapp.net';
            }
        }

        if (!target) {
            return await sock.sendMessage(jid, {
                text: `❌ *No user found*\n\n➤ ${process.env.PREFIX || '.'}add @user (mention)\n➤ ${process.env.PREFIX || '.'}add (reply to user's message)\n➤ ${process.env.PREFIX || '.'}add 919876543210`
            }, { quoted: msg });
        }

        // ─── Prevent Self Adding / Duplicates ───
        if (target === sender) {
            return await sock.sendMessage(jid, { text: "❌ *You cannot add yourself!*" }, { quoted: msg });
        }
        if (target === botNumber) {
            return await sock.sendMessage(jid, { text: "❌ *I'm already here!*" }, { quoted: msg });
        }

        const isAlreadyInGroup = groupMetadata.participants.some(p => p.id === target);
        if (isAlreadyInGroup) {
            return await sock.sendMessage(jid, { text: `⚠️ *@${target.split('@')[0]} is already in this group!*`, mentions: [target] }, { quoted: msg });
        }

        // ─── Try to add ───
        await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

        try {
            const res = await sock.groupParticipantsUpdate(jid, [target], "add");
            
            // 🔥 Precise Error Checking for Baileys
            if (Array.isArray(res) && res.length > 0) {
                const status = res[0].status;

                if (status == 200) {
                    await sock.sendMessage(jid, {
                        text: `✅ *User added successfully!*\n📌 Welcome @${target.split('@')[0]}`,
                        mentions: [target]
                    }, { quoted: msg });
                    await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
                } 
                else if (status == 403 || status == 463) {
                    await sock.sendMessage(jid, {
                        text: `⚠️ *Privacy Restricted!*\n\nI couldn't add @${target.split('@')[0]} directly because their privacy settings restrict who can add them to groups.`,
                        mentions: [target]
                    }, { quoted: msg });
                    await sock.sendMessage(jid, { react: { text: "⚠️", key: msg.key } });
                } 
                else if (status == 409) {
                    await sock.sendMessage(jid, { text: `⚠️ *@${target.split('@')[0]} is already in the group!*`, mentions: [target] }, { quoted: msg });
                } 
                else if (status == 401) {
                    await sock.sendMessage(jid, { text: `❌ *Failed to add. I don't have enough permissions!*` }, { quoted: msg });
                } 
                else if (status == 408) {
                    await sock.sendMessage(jid, { text: `❌ *Network timeout while adding. Try again!*` }, { quoted: msg });
                } 
                else {
                    await sock.sendMessage(jid, { text: `❌ *Failed to add user! (Status: ${status})*` }, { quoted: msg });
                }
            } else {
                // Success fallback if response isn't an array but didn't throw
                await sock.sendMessage(jid, {
                    text: `✅ *Added successfully!*\n📌 Welcome @${target.split('@')[0]}`,
                    mentions: [target]
                }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });
            }

        } catch (err) {
            console.error("Add error:", err);
            await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
            await sock.sendMessage(jid, {
                text: `❌ *Failed to add user*\n➤ Make sure the number is valid and registered on WhatsApp.`
            }, { quoted: msg });
        }
    }
};