// ============================================================
// KICK.JS
// Fixed for WhatsApp JID formats such as:
// 917907199765:9@s.whatsapp.net
// 917907199765@s.whatsapp.net
// @lid / device-suffixed participant IDs
// ============================================================

function getNumber(jid = "") {
    return String(jid)
        .split("@")[0]
        .split(":")[0]
        .replace(/[^0-9]/g, "");
}

function isAdmin(participant) {
    return (
        participant?.admin === "admin" ||
        participant?.admin === "superadmin"
    );
}

function findParticipantByNumber(participants, jidOrNumber) {
    const number = getNumber(jidOrNumber);

    if (!number) return null;

    return (
        participants.find((participant) => {
            return getNumber(participant?.id) === number;
        }) || null
    );
}

function getSenderRaw(msg, sock) {
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

function getTargetFromMessage(msg, args = []) {
    const contextInfo =
        msg.message?.extendedTextMessage?.contextInfo ||
        msg.message?.imageMessage?.contextInfo ||
        msg.message?.videoMessage?.contextInfo ||
        msg.message?.documentMessage?.contextInfo ||
        {};

    // Reply target
    const quotedJid = contextInfo?.participant;

    // Mention target
    const mentionedJid =
        Array.isArray(contextInfo?.mentionedJid) &&
        contextInfo.mentionedJid.length
            ? contextInfo.mentionedJid[0]
            : null;

    // Priority:
    // 1. Reply
    // 2. Mention
    // 3. Number argument
    return quotedJid || mentionedJid || args[0] || null;
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

            // ----------------------------------------------------
            // GROUP CHECK
            // ----------------------------------------------------
            if (!jid || !jid.endsWith("@g.us")) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *This command can only be used in groups!*"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // GET GROUP METADATA
            // ----------------------------------------------------
            let groupMetadata;

            try {
                groupMetadata = await sock.groupMetadata(jid);
            } catch (error) {

                console.error(
                    "❌ Kick metadata error:",
                    error
                );

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Failed to get group metadata!*"
                    },
                    { quoted: msg }
                );
            }

            const participants =
                groupMetadata?.participants || [];

            if (!participants.length) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Could not find group participants!*"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // BOT INFORMATION
            // ----------------------------------------------------
            const botJid = sock.user?.id || "";
            const botNumber = getNumber(botJid);

            if (!botNumber) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Could not detect bot number!*"
                    },
                    { quoted: msg }
                );
            }

            // IMPORTANT:
            // Find bot by NUMBER, not exact JID.
            const botParticipant =
                findParticipantByNumber(
                    participants,
                    botNumber
                );

            const botAdmin =
                isAdmin(botParticipant);

            // ----------------------------------------------------
            // DEBUG
            // ----------------------------------------------------
            console.log("\n========== KICK DEBUG ==========");
            console.log("Bot JID:", botJid);
            console.log("Bot Number:", botNumber);

            console.log(
                "Group Participants:"
            );

            for (const participant of participants) {
                console.log({
                    id: participant?.id,
                    number: getNumber(participant?.id),
                    admin: participant?.admin || null
                });
            }

            console.log(
                "Bot Participant:",
                botParticipant
            );

            console.log(
                "Bot Admin:",
                botAdmin
            );

            console.log(
                "================================\n"
            );

            // ----------------------------------------------------
            // BOT ADMIN CHECK
            // ----------------------------------------------------
            if (!botAdmin) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *I need admin privileges first!*\n\n" +
                            `🤖 Bot: ${botNumber}\n` +
                            "🛡️ Admin status: Not detected\n\n" +
                            "Please make the bot a group admin and try again."
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // SENDER INFORMATION
            // ----------------------------------------------------
            const senderJid =
                getSenderRaw(msg, sock);

            const senderNumber =
                getNumber(senderJid);

            const senderParticipant =
                findParticipantByNumber(
                    participants,
                    senderNumber
                );

            const senderAdmin =
                isAdmin(senderParticipant);

            console.log("========== SENDER DEBUG ==========");
            console.log("Sender JID:", senderJid);
            console.log("Sender Number:", senderNumber);
            console.log(
                "Sender Participant:",
                senderParticipant
            );
            console.log(
                "Sender Admin:",
                senderAdmin
            );
            console.log("==================================");

            // ----------------------------------------------------
            // SENDER ADMIN CHECK
            // ----------------------------------------------------
            if (!senderAdmin && !isOwner) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Group Admins only!*"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // GET TARGET
            // ----------------------------------------------------
            let target =
                getTargetFromMessage(
                    msg,
                    args
                );

            if (!target) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Reply to or mention the user to kick!*\n\n" +
                            "Examples:\n" +
                            "• Reply to a message → `.kick`\n" +
                            "• Mention → `.kick @user`\n" +
                            "• Number → `.kick 919876543210`"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // TARGET NORMALIZATION
            // ----------------------------------------------------
            const targetNumber =
                getNumber(target);

            if (!targetNumber) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Invalid target number!*"
                    },
                    { quoted: msg }
                );
            }

            // Find the actual participant from metadata.
            const targetParticipant =
                findParticipantByNumber(
                    participants,
                    targetNumber
                );

            if (!targetParticipant) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *That user is not a member of this group!*"
                    },
                    { quoted: msg }
                );
            }

            // IMPORTANT:
            // Always use the actual JID returned by groupMetadata.
            const targetJid =
                targetParticipant.id;

            // ----------------------------------------------------
            // TARGET DEBUG
            // ----------------------------------------------------
            console.log("\n========== TARGET DEBUG ==========");
            console.log("Requested Target:", target);
            console.log("Target Number:", targetNumber);
            console.log(
                "Target Participant:",
                targetParticipant
            );
            console.log(
                "Actual Target JID:",
                targetJid
            );
            console.log("==================================\n");

            // ----------------------------------------------------
            // DON'T KICK BOT
            // ----------------------------------------------------
            if (targetNumber === botNumber) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *I can't kick myself!*"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // DON'T KICK YOURSELF
            // ----------------------------------------------------
            if (
                targetNumber === senderNumber &&
                !msg.key?.fromMe
            ) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *You can't kick yourself!*"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // TARGET ADMIN CHECK
            // ----------------------------------------------------
            const targetAdmin =
                isAdmin(targetParticipant);

            if (targetAdmin && !isOwner) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *You cannot kick another admin!*"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // REMOVE TARGET
            // ----------------------------------------------------
            try {

                await sock.sendMessage(
                    jid,
                    {
                        react: {
                            text: "⏳",
                            key: msg.key
                        }
                    }
                );

                console.log(
                    `🚨 Removing ${targetJid} from ${jid}`
                );

                const result =
                    await sock.groupParticipantsUpdate(
                        jid,
                        [targetJid],
                        "remove"
                    );

                console.log(
                    "Kick result:",
                    result
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

            } catch (error) {

                console.error(
                    "❌ Kick Error:",
                    error
                );

                try {
                    await sock.sendMessage(
                        jid,
                        {
                            react: {
                                text: "❌",
                                key: msg.key
                            }
                        }
                    );
                } catch {}

                await sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Failed to remove the user!*\n\n" +
                            "Possible reasons:\n" +
                            "• Bot is no longer admin\n" +
                            "• Target is the group creator\n" +
                            "• Target is an admin\n" +
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
        description: "Remove all non-admin members from the group",

        async execute(sock, msg, args, isOwner) {

            const jid = msg.key?.remoteJid;

            // ----------------------------------------------------
            // GROUP CHECK
            // ----------------------------------------------------
            if (!jid || !jid.endsWith("@g.us")) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *This command can only be used in groups!*"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // GROUP METADATA
            // ----------------------------------------------------
            let groupMetadata;

            try {
                groupMetadata =
                    await sock.groupMetadata(jid);
            } catch (error) {

                console.error(
                    "❌ Kickall metadata error:",
                    error
                );

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Failed to get group metadata!*"
                    },
                    { quoted: msg }
                );
            }

            const participants =
                groupMetadata?.participants || [];

            if (!participants.length) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Could not find group participants!*"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // BOT
            // ----------------------------------------------------
            const botJid =
                sock.user?.id || "";

            const botNumber =
                getNumber(botJid);

            if (!botNumber) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Could not detect bot number!*"
                    },
                    { quoted: msg }
                );
            }

            // Find bot by number.
            const botParticipant =
                findParticipantByNumber(
                    participants,
                    botNumber
                );

            const botAdmin =
                isAdmin(botParticipant);

            // ----------------------------------------------------
            // KICKALL DEBUG
            // ----------------------------------------------------
            console.log(
                "\n========== KICKALL DEBUG =========="
            );

            console.log(
                "Bot JID:",
                botJid
            );

            console.log(
                "Bot Number:",
                botNumber
            );

            console.log(
                "Bot Participant:",
                botParticipant
            );

            console.log(
                "Bot Admin:",
                botAdmin
            );

            console.log(
                "===================================\n"
            );

            // ----------------------------------------------------
            // BOT ADMIN CHECK
            // ----------------------------------------------------
            if (!botAdmin) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *I need admin privileges first!*\n\n" +
                            `🤖 Bot: ${botNumber}\n` +
                            "🛡️ Admin status: Not detected\n\n" +
                            "Please make the bot a group admin and try again."
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // SENDER
            // ----------------------------------------------------
            const senderJid =
                getSenderRaw(msg, sock);

            const senderNumber =
                getNumber(senderJid);

            const senderParticipant =
                findParticipantByNumber(
                    participants,
                    senderNumber
                );

            const senderAdmin =
                isAdmin(senderParticipant);

            console.log(
                "\n========== SENDER DEBUG =========="
            );

            console.log(
                "Sender JID:",
                senderJid
            );

            console.log(
                "Sender Number:",
                senderNumber
            );

            console.log(
                "Sender Participant:",
                senderParticipant
            );

            console.log(
                "Sender Admin:",
                senderAdmin
            );

            console.log(
                "==================================\n"
            );

            // ----------------------------------------------------
            // SENDER ADMIN CHECK
            // ----------------------------------------------------
            if (!senderAdmin && !isOwner) {
                return sock.sendMessage(
                    jid,
                    {
                        text:
                            "❌ *Group Admins only!*"
                    },
                    { quoted: msg }
                );
            }

            // ----------------------------------------------------
            // SELECT MEMBERS
            // ----------------------------------------------------
            const targetMembers =
                participants
                    .filter((participant) => {

                        const number =
                            getNumber(
                                participant?.id
                            );

                        // Never remove bot.
                        if (
                            number === botNumber
                        ) {
                            return false;
                        }

                        // Never remove command sender
                        // unless owner is deliberately using
                        // owner privileges.
                        if (
                            number === senderNumber &&
                            !isOwner
                        ) {
                            return false;
                        }

                        // Never remove admins.
                        if (
                            isAdmin(participant)
                        ) {
                            return false;
                        }

                        return true;

                    })
                    .map(
                        participant =>
                            participant.id
                    );

            // ----------------------------------------------------
            // NOTHING TO REMOVE
            // ----------------------------------------------------
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

            // ----------------------------------------------------
            // START MESSAGE
            // ----------------------------------------------------
            await sock.sendMessage(
                jid,
                {
                    text:
                        "⚠️ *KICKALL INITIATED!* ⚠️\n\n" +
                        `👥 Members found: ${targetMembers.length}\n` +
                        "🛡️ Admins will be protected.\n" +
                        "🤖 Bot will be protected.\n\n" +
                        "_Starting removal process..._"
                },
                { quoted: msg }
            );

            // ----------------------------------------------------
            // REMOVE MEMBERS ONE BY ONE
            // ----------------------------------------------------
            let success = 0;
            let failed = 0;

            for (
                const targetJid of targetMembers
            ) {

                try {

                    // Double safety check.
                    if (
                        getNumber(targetJid) ===
                        botNumber
                    ) {
                        continue;
                    }

                    await sock.groupParticipantsUpdate(
                        jid,
                        [targetJid],
                        "remove"
                    );

                    success++;

                    console.log(
                        `✅ Kickall removed: ${targetJid}`
                    );

                    // Delay between removals.
                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                1500
                            )
                    );

                } catch (error) {

                    failed++;

                    console.error(
                        `❌ Kickall failed for ${targetJid}:`,
                        error?.message ||
                        error
                    );

                    // Continue with next member.
                }
            }

            // ----------------------------------------------------
            // COMPLETED
            // ----------------------------------------------------
            await sock.sendMessage(
                jid,
                {
                    text:
                        "✅ *Kickall process completed!*\n\n" +
                        `✔️ Removed: ${success}\n` +
                        `❌ Failed: ${failed}\n` +
                        `🛡️ Admins protected`
                },
                { quoted: msg }
            );
        }
    }
];
