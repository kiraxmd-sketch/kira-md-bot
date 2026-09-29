// plugins/getpp.js - KIRA X MD (Direct WhatsApp DP Fetcher & Group DP Updater)
const fs = require("fs");

module.exports = [
    {
        name: 'getpp',
        alias: ['dp', 'profilepic', 'wa-dp'],
        category: 'tools',
        description: 'Get WhatsApp Profile Picture directly bypassing external API blocks.',
        usage: `${process.env.PREFIX || '.'}getpp <number> OR reply to a message`,

        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            let targetJid = null;

            // 1. Check if user is replying to someone's message
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
            if (quoted) {
                targetJid = quoted;
            } 
            // 2. Check if a number is provided in command
            else if (args.length > 0) {
                let number = args.join('').replace(/[^0-9]/g, '');
                // Check if it's a group ID (usually starts with numbers and ends with @g.us)
                if (number.length > 15) {
                   targetJid = `${number}@g.us`;
                } else {
                   targetJid = `${number}@s.whatsapp.net`;
                }
            } 
            // 3. If used in a group without reply or args, get the group's DP
            else if (jid.endsWith('@g.us')) {
                targetJid = jid;
            }
            else {
                return sock.sendMessage(jid, { 
                    text: "❌ *Usage:* Reply to a person's message with `.getpp` or type `.getpp 919876543210`" 
                }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                
                let dpUrl;
                try {
                    // 🔥 THE MAGIC: Direct Baileys function to fetch DP from WhatsApp Server 🔥
                    dpUrl = await sock.profilePictureUrl(targetJid, 'image');
                } catch (e) {
                    // If it fails here, it means 100% the user has set privacy to 'Nobody' or 'My Contacts'
                    await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                    return sock.sendMessage(jid, { 
                        text: "❌ Profile picture not found.\n\n_Reason: Account has privacy enabled ('My Contacts' / 'Nobody') or no DP exists._" 
                    }, { quoted: msg });
                }

                // 3. Send the fetched DP directly to chat
                const typeText = targetJid.endsWith('@g.us') ? 'Group' : 'User';
                await sock.sendMessage(jid, { 
                    image: { url: dpUrl }, 
                    caption: `📸 *WhatsApp Profile Picture*\n📞 Target ${typeText}: \`${targetJid.split('@')[0]}\`\n⚡ Powered by KIRA X MD Direct Fetch` 
                }, { quoted: msg });
                
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.error("GETPP Error:", err);
                await sock.sendMessage(jid, { react: { text: "⚠️", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ Something went wrong." }, { quoted: msg });
            }
        }
    },

    {
        name: "gpp",
        alias: ["setgpp", "groupdp"],
        category: "group",
        description: "Change the Group Profile Picture (Reply to an image)",
        usage: `${process.env.PREFIX || '.'}gpp <reply to image>`,

        async execute(sock, msg, args, isOwner) {
            const jid = msg.key.remoteJid;

            if (!jid.endsWith("@g.us")) {
                return await sock.sendMessage(jid, { text: "❌ *This command can only be used in groups!*" }, { quoted: msg });
            }

            // Group Admin Check
            const groupMetadata = await sock.groupMetadata(jid);
            const senderRaw = msg.key.participant || msg.key.remoteJid || "";
            const sender = senderRaw.split('@')[0].split(':')[0] + '@s.whatsapp.net';
            const botNumber = (sock.user?.id || "").split('@')[0].split(':')[0] + '@s.whatsapp.net';

            const isSenderAdmin = groupMetadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
            const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));

            if (!isSenderAdmin && !isOwner) {
                return await sock.sendMessage(jid, { text: "❌ *Group Admins only!*" }, { quoted: msg });
            }

            if (!isBotAdmin) {
                return await sock.sendMessage(jid, { text: "❌ *Make sure the bot is an admin first!*" }, { quoted: msg });
            }

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted?.imageMessage) {
                return await sock.sendMessage(jid, { text: "❌ *Please reply to an image to set it as Group DP!*" }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });

                const buffer = await sock.downloadMediaMessage({ message: quoted });
                const tempPath = `./temp_gpp_${Date.now()}.jpg`;

                fs.writeFileSync(tempPath, buffer);

                await sock.updateProfilePicture(jid, fs.readFileSync(tempPath));

                fs.unlinkSync(tempPath);

                await sock.sendMessage(jid, { text: "✅ *Group Profile Picture updated successfully!*" }, { quoted: msg });
                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.error("GPP Error:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed to update Group DP. Please try again later.*" }, { quoted: msg });
            }
        }
    }
];