const Discord = require('discord.js');
const fetch = require('node-fetch');

const client = new Discord.Client({
    intents: ['Guilds', 'GuildMessages', 'MessageContent']
});

const BACKEND_URL = 'https://mentech-backend.pxxl.click';

client.on('ready', () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // Ignorer les messages du bot
    if (message.author.bot) return;
    
    // Check si c'est une réponse dans le channel support
    if (message.channel.id === '1473846257326751896') { // ID d #support
        // Chercher le sessionId dans l'embed
        const embed = message.embeds[0];
        if (embed && embed.fields) {
            const sessionField = embed.fields.find(f => f.name.includes('Session'));
            if (sessionField) {
                const sessionId = sessionField.value.replace(/`/g, '').trim();
                
                // Envoyer la réponse au backend
                await fetch(`${BACKEND_URL}/api/support/reply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: sessionId,
                        message: message.content
                    })
                });
            }
        }
    }
});

client.login('TON_BOT_TOKEN');
