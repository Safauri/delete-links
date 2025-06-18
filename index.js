const {
    Client,
    GatewayIntentBits,
    Events,
    WebhookClient,
    EmbedBuilder
} = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: Object.values(GatewayIntentBits)
});
const {
    TOKEN,
    WEBHOOK_URL
} = process.env;

const flaggedFiles = new Set(["1.jpg", "2.jpg", "3.jpg"]);
const Uve = "https://cdn.discordapp.com/attachments/";
const linkRegex = new RegExp(`${Uve}[^\\s]+/(\\d+\\.jpg)`, "g");
const uve = new WebhookClient({
    url: WEBHOOK_URL
});

client.once(Events.ClientReady, () =>
    console.log(`✅ Logged in as ${client.user.username} (${client.user.id})`)
);

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const foundLinks = [...message.content.matchAll(linkRegex)]
        .map(match => match[1])
        .filter(file => flaggedFiles.has(file));
    if (foundLinks.length < 2) return;

    await message.delete();

    try {
        await message.member.kick("Spamming flagged images.");
        await uve.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("🚨 User Kicked")
                    .setDescription(`**${message.author.username}** was kicked for spamming flagged images in <#${message.channel.id}>.\n📌 **Flagged Images:** ${foundLinks.join(", ")}`)
                    .setTimestamp()
            ]
        });
    } catch (error) {
        await uve.send({ content: `⚠️ Failed to kick **${message.author.username}** in <#${message.channel.id}>. Error: ${error.message}` });
    }
});


client.login(TOKEN);