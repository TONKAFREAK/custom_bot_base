process.env.TF_CPP_MIN_LOG_LEVEL = '3';

//---------------- Imports ------------

require('dotenv').config();
const path = require('path'); 

const {getModeration} = require('./utilities/Tools');

const  {loadModel, chatModeration} = require('./utilities/Moderation');
const PrefixCommandHandler = require('./utilities/PrefixCommandHandler');

//-------------------------------------

//---------------- Client -------------

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions]
});

//-------------------------------------

const prefixCommandHandler = new PrefixCommandHandler(client, '>');
const prefixCommandsPath = path.join(__dirname, 'commands', 'prefix_commands');

//---------------- Events -------------

client.on('ready', (c) => {

    console.log(c.user.tag + " is turning on.....");

    client.user.setActivity('Edging hard', { type: 4 });
    prefixCommandHandler.loadCommands(prefixCommandsPath);
    loadModel();

    console.log(c.user.tag + " is on.");

});

client.on('messageCreate', async (message) =>    {

    if (message.author.bot) return;

    prefixCommandHandler.handleCommand(message);

    if (getModeration()) {
        chatModeration(message);
    }

});

client.on('messageUpdate', async (oldMessage, newMessage) => {

    if (oldMessage.author.bot) return;

    if (getModeration()) {
        chatModeration(oldMessage);
    }


});

client.on('guildMemberAdd', async (member) => {});
client.on('guildMemberRemove', async (member) => {});

//-------------------------------------

//---------------- Login --------------

client.login(process.env.BOT_TOKEN);

//-------------------------------------