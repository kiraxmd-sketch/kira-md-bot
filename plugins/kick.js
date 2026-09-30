// plugins/kick.js - KIRA X MD (Ultra-Robust Admin & Kick System)

function getNumber(jid = "") {
    return String(jid).split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
}

function isAdmin(participant) {
    return participant?.admin === "admin" || participant?.admin === "superadmin";
}

function findParticipant(participants, query) {
    if (!query) return null;
    const queryNum = getNumber(query);
    return participants.find(p => p.id === query || p.id?.split(":")[0] === query || getNumber(p.id) === queryNum) || null;
}

module.exports = [
    {
        name: "kick",
        alias: ["remove"],
        category: "group",
        description: "Remove a member from the group",

        async execute(sock, msg, args, isOwner) {
            const jid = msg.key?.remoteJid;
            if (!jid || !jid.endsWith("@g.us")) {
                return sock.sendMessage(jid, { text: "❌ *This command can only be used in groups!*" }, { quoted: msg });
            }

            let groupMetadata;
            try {
                groupMetadata = await sock.groupMetadata(jid);
            } catch (e) {
                return sock.sendMessage(jid, { text: "❌ *Failed to get group metadata!*" }, { quoted: msg });
            }

            const participants = groupMetadata?.participants || [];
            const botJid = sock.user?.id || sock.user?.jid || "";
            const botNumber = getNumber(botJid);

            const senderRaw = msg.key?.fromMe ? botJid : (msg.key?.participant || msg.participant || msg.key?.remoteJid || "");
            const senderNumber = getNumber(senderRaw);

            // 🔍 Find Bot and Sender in group participants securely
            const botParticipant = participants.find(p => p.id === botJid || getNumber(p.id) === botNumber);
            const senderParticipant = participants.find(p => p.id === senderRaw || getNumber(p.id) === senderNumber);

            const botAdmin = isAdmin(botParticipant);
            const senderAdmin = isAdmin(senderParticipant);

            if (!senderAdmin && !isOwner) {
                return sock.sendMessage(jid, { text: "❌ *Group Admins only!*" }, { quoted: msg });
            }

            if (!botAdmin) {
                return sock.sendMessage(jid, { text: "❌ *Make sure I have Admin privileges first!*" }, { quoted: msg });
            }

            // 🎯 Target Extraction (Reply, Mention, or Number)
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo || msg.message?.imageMessage?.contextInfo || msg.message?.videoMessage?.contextInfo || {};
            const quotedJid = contextInfo?.participant;
            const mentionedJid = Array.isArray(contextInfo?.mentionedJid) && contextInfo.mentionedJid.length ? contextInfo.mentionedJid[0] : null;
            const argTarget = args[0] ? args.join("").replace(/[^0-9]/g, "") : null;

            let targetParticipant = null;
            if (quotedJid) {
                targetParticipant = findParticipant(participants, quotedJid);
            } else if (mentionedJid) {
                targetParticipant = findParticipant(participants, mentionedJid);
            } else if (argTarget) {
                targetParticipant = participants.find(p => getNumber(p.id) === argTarget);
            }

            if (!targetParticipant) {
                return sock.sendMessage(jid, { text: "❌ *Reply to, mention, or provide the number of the user to kick!*" }, { quoted: msg });
            }

            const targetJid = targetParticipant.id;
            const targetNumber = getNumber(targetJid);

            if (targetNumber === botNumber) {
                return sock.sendMessage(jid, { text: "❌ *I can't kick myself!*" }, { quoted: msg });
            }
            if (targetNumber === senderNumber && !msg.key.fromMe) {
                return sock.sendMessage(jid, { text: "❌ *You can't kick yourself!*" }, { quoted: msg });
            }

            const targetAdmin = isAdmin(targetParticipant);
            if (targetAdmin && !isOwner) {
                return sock.sendMessage(jid, { text: "❌ *You cannot kick another admin!*" }, { quoted: msg });
            }

            try {
                await sock.sendMessage(jid, { react: { text: "⏳", key: msg.key } });
                await sock.groupParticipantsUpdate(jid, [targetJid], "remove");
                await sock.sendMessage(jid, { text: `✅ *@${targetNumber} has been kicked!*`, mentions: [targetJid] }, { quoted: msg });
            } catch (e) {
                console.error("Kick Error:", e);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ *Failed! Need higher admin privilege or user is the creator.*" }, { quoted: msg });
            }
        }
    },

    {
        name: "kickall",
        category: "group",
        description: "Remove all non-admin members from the group",

        async execute(sock, msg, args, isOwner) {
            const jid = msg.key?.remoteJid;
            if (!jid || !jid.endsWith("@g.us")) {
                return sock.sendMessage(jid, { text: "❌ *This command can only be used in groups!*" }, { quoted: msg });
            }

            let groupMetadata;
            try {
                groupMetadata = await sock.groupMetadata(jid);
            } catch (e) {
                return sock.sendMessage(jid, { text: "❌ *Failed to get group metadata!*" }, { quoted: msg });
            }

            const participants = groupMetadata?.participants || [];
            const botJid = sock.user?.id || sock.user?.jid || "";
            const botNumber = getNumber(botJid);

            const senderRaw = msg.key?.fromMe ? botJid : (msg.key?.participant || msg.participant || msg.key?.remoteJid || "");
            const senderNumber = getNumber(senderRaw);

            const botParticipant = participants.find(p => p.id === botJid || getNumber(p.id) === botNumber);
            const senderParticipant = participants.find(p => p.id === senderRaw || getNumber(p.id) === senderNumber);

            const botAdmin = isAdmin(botParticipant);
            const senderAdmin = isAdmin(senderParticipant);

            if (!senderAdmin && !isOwner) {
                return sock.sendMessage(jid, { text: "❌ *Group Admins only!*" }, { quoted: msg });
            }

            if (!botAdmin) {
                return sock.sendMessage(jid, { text: "❌ *Make sure I have Admin privileges first!*" }, { quoted: msg });
            }

            const targetMembers = participants
                .filter(p => {
                    const num = getNumber(p.id);
                    if (num === botNumber) return false;
                    if (num === senderNumber && !isOwner) return false;
                    if (isAdmin(p)) return false;
                    return true;
                })
                .map(p => p.id);

            if (!targetMembers.length) {
                return sock.sendMessage(jid, { text: "⚠️ *No non-admin members found to kick!*" }, { quoted: msg });
            }

            await sock.sendMessage(jid, { 
                text: `⚠️ *KICKALL INITIATED!* ⚠️\n\nRemoving ${targetMembers.length} members...\n\n_To stop this process immediately, use .restart or .reboot_` 
            }, { quoted: msg });

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