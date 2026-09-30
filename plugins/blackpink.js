// plugins/blackpink.js - KIRA X MD (Combined Logo Plugins)
const axios = require("axios");

module.exports = [
    {
        name: "blackpink",
        alias: ["blackpinklogo", "bplogo"],
        category: "logo",
        description: "Generate Blackpink Style Logo",

        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const text = args.join(" ").trim();

            if (!text) {
                return await sock.sendMessage(
                    jid,
                    { text: `❌ Give some text.\n\nExample:\n.blackpink Kira` },
                    { quoted: msg }
                );
            }

            try {
                await sock.sendMessage(jid, { react: { text: "🎀", key: msg.key } });

                const { data } = await axios.get(
                    `https://jerrycoder.oggyapi.workers.dev/ephoto/blackpinklogo?text=${encodeURIComponent(text)}`
                );

                const imageUrl = data.result || data.url || data.image;

                if (!imageUrl) throw new Error("No image URL returned");

                await sock.sendMessage(
                    jid,
                    {
                        image: { url: imageUrl },
                        caption: `🎀 *BLACKPINK LOGO*\n\n📝 Text: ${text}`
                    },
                    { quoted: msg }
                );

                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.log("BLACKPINK ERROR:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ Failed to generate Blackpink logo." }, { quoted: msg });
            }
        }
    },
    {
        name: "typography",
        alias: ["typotext", "typo"],
        category: "logo",
        description: "Generate Typography Style Text Logo",

        async execute(sock, msg, args) {
            const jid = msg.key.remoteJid;
            const text = args.join(" ").trim();

            if (!text) {
                return await sock.sendMessage(
                    jid,
                    { text: `❌ Give some text.\n\nExample:\n.typography Kira` },
                    { quoted: msg }
                );
            }

            try {
                await sock.sendMessage(jid, { react: { text: "🎨", key: msg.key } });

                const { data } = await axios.get(
                    `https://jerrycoder.oggyapi.workers.dev/ephoto/typographytext?text=${encodeURIComponent(text)}`
                );

                const imageUrl = data.result || data.url || data.image;

                if (!imageUrl) throw new Error("No image URL returned");

                await sock.sendMessage(
                    jid,
                    {
                        image: { url: imageUrl },
                        caption: `🎨 *TYPOGRAPHY LOGO*\n\n📝 Text: ${text}`
                    },
                    { quoted: msg }
                );

                await sock.sendMessage(jid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                console.log("TYPOGRAPHY ERROR:", err.message);
                await sock.sendMessage(jid, { react: { text: "❌", key: msg.key } });
                await sock.sendMessage(jid, { text: "❌ Failed to generate Typography logo." }, { quoted: msg });
            }
        }
    }
];