const fs = require('fs');
const bannedWordsFilePath = "./src/data/banned_words.txt";
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: 'ubw',
    async execute(message, args) {
        
        //---------------- Check args and permission --------------

        const member = await message.guild.members.fetch(message.author.id);
        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
            return;
        }

        if (!args.length) {
            return message.reply('Please provide a word to remove from the banned words list.');
        }

        //---------------- Remove the word from the banned words list --------------
        
        const wordToRemove = args[0].toLowerCase();

        let bannedWords = [];
        try {
            const data = fs.readFileSync(bannedWordsFilePath, 'utf-8');
            bannedWords = data.split('\n').map(word => word.trim().toLowerCase());
        } catch (error) {
            console.error(`Could not read the banned words file: ${error.message}`);
            return message.reply('There was an error reading the banned words file.');
        }

        if (!bannedWords.includes(wordToRemove)) {
            return message.reply('This word is not in the banned words list.');
        }

        //---------------- Write the updated banned words list --------------
        
        const updatedBannedWords = bannedWords.filter(word => word !== wordToRemove);

        try {
            fs.writeFileSync(bannedWordsFilePath, updatedBannedWords.join('\n'));
            return message.reply(`The word "${wordToRemove}" has been removed from the banned words list.`);
        } catch (error) {
            console.error(`Could not write to the banned words file: ${error.message}`);
            return message.reply('There was an error removing the word from the banned words list.');
        }
    },
};
