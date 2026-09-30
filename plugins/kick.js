// plugins/kick.js

function cleanNumber(jid = "") {
    return String(jid)
        .split(":")[0]
        .split("@")[0]
        .replace(/[^0-9]/g, "");
}

function isAdmin(participant) {
    return participant?.admin === "admin" ||
           participant?.admin === "superadmin";
}

function findParticipant(participants, jid) {
    if (!jid) return null;

    const targetNumber = cleanNumber(jid);

    return participants.find(p => {
        const participantNumber = cleanNumber(p.id);

        return (
            p.id === jid ||
            participantNumber === targetNumber
        );
    });
}

function getSenderJid(msg, sock) {
    if (msg.key?.fromMe) {
        return sock.user?.id || "";
    }

    return (
        msg.key?.participant ||
        msg.participant ||
        msg.key?.remoteJid ||
        ""
    );
}

module.exports = [

    // ============================================================
    // KICK
    // ============================================================
    {
        name: "kick",
        category: "group",
        description: "Remove a member from the group",

        async execute(sock, msg, args, isOwner) {

            const jid = msg.key?.remoteJid;

            if (!jid?.endsWith("@g.us")) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ *This command can only be used in groups!*" },
                    { quoted: msg }
                );
            }

            let metadata;

            try {
                metadata = await sock.groupMetadata(jid);
            } catch (err) {
                console.error("Kick metadata error:", err);

                return sock.sendMessage(
                    jid,
                    { text: "❌ *Failed to get group metadata!*" },
                    { quoted: msg }
                );
            }

            const participants = metadata?.participants || [];

            // ----------------------------------------------------
            // BOT
            // ----------------------------------------------------
            const botJid = sock.user?.id || "";
            const botNumber = cleanNumber(botJid);

            const botParticipant = findParticipant(
                participants,
                botJid
            );

            const botAdmin = isAdmin(botParticipant);

            console.log("========== KICK DEBUG ==========");
            console.log("Bot JID:", botJid);
            console.log("Bot Number:", botNumber);
            console.log("Bot Participant:", botParticipant);
            console.log("Bot Admin:", botAdmin);

            if (!botAdmin) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *I need admin privileges first!*\n\n" +
                            `🤖 Bot: ${botNumber}\n` +
                            "🛡️ Status: Not detected as admin"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // SENDER
            // ----------------------------------------------------
            const senderJid = getSenderJid(msg, sock);
            const senderNumber = cleanNumber(senderJid);

            const senderParticipant = findParticipant(
                participants,
                senderJid
            );

            const senderAdmin = isAdmin(senderParticipant);

            console.log("Sender JID:", senderJid);
            console.log("Sender Number:", senderNumber);
            console.log("Sender Participant:", senderParticipant);
            console.log("Sender Admin:", senderAdmin);
            console.log("================================");

            if (!senderAdmin && !isOwner) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ *Group Admins only!*" },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // TARGET
            // ----------------------------------------------------
            const contextInfo =
                msg.message?.extendedTextMessage?.contextInfo;

            const quotedJid = contextInfo?.participant;

            const mentionedJid =
                contextInfo?.mentionedJid?.[0];

            let target =
                quotedJid ||
                mentionedJid ||
                args?.[0];

            if (!target) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Reply to or mention the user to kick!*\n\n" +
                            "Example:\n" +
                            ".kick @user"
                    },
                    { quoted: msg }
                );
            }

            // If user gives 919876543210 instead of JID
            if (!String(target).includes("@")) {
                target =
                    cleanNumber(target) +
                    "@s.whatsapp.net";
            }

            const targetParticipant =
                findParticipant(participants, target);

            if (!targetParticipant) {
                return sock.sendMessage(
                    jid,
                    {
                        text: "❌ *That user is not a member of this group!*"
                    },
                    { quoted: msg }
                );
            }

            const targetJid = targetParticipant.id;
            const targetNumber = cleanNumber(targetJid);

            // ----------------------------------------------------
            // SAFETY CHECKS
            // ----------------------------------------------------
            if (targetNumber === botNumber) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ *I can't kick myself!*" },
                    { quoted: msg }
                );
            }

            if (
                targetNumber === senderNumber &&
                !msg.key?.fromMe
            ) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ *You can't kick yourself!*" },
                    { quoted: msg }
                );
            }

            const targetIsAdmin =
                isAdmin(targetParticipant);

            if (targetIsAdmin && !isOwner) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ *You cannot kick another admin!*" },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // REMOVE
            // ----------------------------------------------------
            try {

                await sock.sendMessage(jid, {
                    react: {
                        text: "⏳",
                        key: msg.key
                    }
                });

                await sock.groupParticipantsUpdate(
                    jid,
                    [targetJid],
                    "remove"
                );

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            `✅ *@${targetNumber} has been kicked!*`,
                        mentions: [targetJid]
                    },
                    { quoted: msg }
                );

            } catch (err) {

                console.error("❌ Kick Error:", err);

                await sock.sendMessage(jid, {
                    react: {
                        text: "❌",
                        key: msg.key
                    }
                });

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Failed to remove the user!*\n\n" +
                            "Possible reasons:\n" +
                            "• Bot lost admin privileges\n" +
                            "• Target is group creator/admin\n" +
                            "• WhatsApp rejected the operation"
                    },
                    { quoted: msg }
                );
            }
        }
    },

    // ============================================================
    // KICKALL
    // ============================================================
    {
        name: "kickall",
        category: "group",
        description: "Remove all non-admin members",

        async execute(sock, msg, args, isOwner) {

            const jid = msg.key?.remoteJid;

            if (!jid?.endsWith("@g.us")) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ *This command can only be used in groups!*" },
                    { quoted: msg }
                );
            }

            let metadata;

            try {
                metadata = await sock.groupMetadata(jid);
            } catch (err) {
                console.error("Kickall metadata error:", err);

                return sock.sendMessage(
                    jid,
                    { text: "❌ *Failed to get group metadata!*" },
                    { quoted: msg }
                );
            }

            const participants =
                metadata?.participants || [];

            // ----------------------------------------------------
            // BOT CHECK
            // ----------------------------------------------------
            const botJid = sock.user?.id || "";
            const botNumber = cleanNumber(botJid);

            const botParticipant =
                findParticipant(
                    participants,
                    botJid
                );

            const botAdmin =
                isAdmin(botParticipant);

            console.log("========== KICKALL DEBUG ==========");
            console.log("Bot JID:", botJid);
            console.log("Bot Participant:", botParticipant);
            console.log("Bot Admin:", botAdmin);

            if (!botAdmin) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *I need admin privileges first!*\n\n" +
                            `🤖 Bot: ${botNumber}\n` +
                            "🛡️ Status: Not detected as admin"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // SENDER CHECK
            // ----------------------------------------------------
            const senderJid =
                getSenderJid(msg, sock);

            const senderNumber =
                cleanNumber(senderJid);

            const senderParticipant =
                findParticipant(
                    participants,
                    senderJid
                );

            const senderAdmin =
                isAdmin(senderParticipant);

            console.log("Sender JID:", senderJid);
            console.log("Sender Participant:", senderParticipant);
            console.log("Sender Admin:", senderAdmin);
            console.log("===================================");

            if (!senderAdmin && !isOwner) {
                return sock.sendMessage(
                    jid,
                    { text: "❌ *Group Admins only!*" },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // SELECT NON-ADMINS
            // ----------------------------------------------------
            const targetMembers =
                participants.filter(p => {

                    const number =
                        cleanNumber(p.id);

                    // Never remove bot
                    if (number === botNumber) {
                        return false;
                    }

                    // Never remove sender
                    if (
                        number === senderNumber &&
                        !isOwner
                    ) {
                        return false;
                    }

                    // Never remove admins
                    if (isAdmin(p)) {
                        return false;
                    }

                    return true;

                }).map(p => p.id);

            if (!targetMembers.length) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "⚠️ *No non-admin members found to kick!*"
                    },
                    { quoted: msg }
                );
            }

            await sock.sendMessage(
                jid,
                {
                    text:
                        `⚠️ *KICKALL INITIATED!* ⚠️\n\n` +
                        `👥 Members to remove: ${targetMembers.length}\n\n` +
                        `🛡️ Admins and bot will be protected.`
                },
                { quoted: msg }
            );

            // ----------------------------------------------------
            // REMOVE MEMBERS
            // ----------------------------------------------------
            let success = 0;
            let failed = 0;

            for (const target of targetMembers) {

                try {

                    await sock.groupParticipantsUpdate(
                        jid,
                        [target],
                        "remove"
                    );

                    success++;

                    await new Promise(
                        resolve => setTimeout(resolve, 1500)
                    );

                } catch (err) {

                    failed++;

                    console.error(
                        "Kickall error:",
                        target,
                        err?.message || err
                    );
                }
            }

            await sock.sendMessage(
                jid,
                {
                    text:
                        `✅ *Kickall completed!*\n\n` +
                        `✔️ Removed: ${success}\n` +
                        `❌ Failed: ${failed}`
                },
                { quoted: msg }
            );
        }
    }
];
