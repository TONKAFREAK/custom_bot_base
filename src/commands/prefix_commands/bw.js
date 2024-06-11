const fs = require('fs');
const bannedWordsFilePath = "./src/data/banned_words.txt";
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: 'bw',
    async execute(message, args) {

        //-------------- Check args and permission --------------
        const member = await message.guild.members.fetch(message.author.id);
        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
            return ;
        }
        
        if (!args.length) {
            return message.reply('Please provide a word to add to the banned words list.');
        }

        //-------------- Add the word to the banned words list --------------

        const newWord = args[0].toLowerCase();

        let bannedWords = [];
        try {
            const data = fs.readFileSync(bannedWordsFilePath, 'utf-8');
            bannedWords = data.split('\n').map(word => word.trim().toLowerCase());
        } catch (error) {
            console.error(`Could not read the banned words file: ${error.message}`);
        }

        if (bannedWords.includes(newWord)) {
            return message.reply('This word is already in the banned words list.');
        }

        bannedWords.push(newWord);
        try {
            fs.appendFileSync(bannedWordsFilePath, `\n${newWord}`);
            return message.reply(`The word "${newWord}" has been added to the banned words list.`);
        } catch (error) {
            console.error(`Could not write to the banned words file: ${error}`);
            return message.reply('There was an error adding the word to the banned words list.');
        }
    },
};
