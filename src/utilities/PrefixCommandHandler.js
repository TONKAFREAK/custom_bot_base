const fs = require('fs');
const path = require('path');

class PrefixCommandHandler {

    constructor(client, commandPrefix) {

        this.client = client;
        this.commandPrefix = commandPrefix;
        this.commands = new Map();
    }

    loadCommands(commandsPath) {

        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
        for (const file of commandFiles) {

            const command = require(path.join(commandsPath, file));
            // Assume each command file exports an object with name and execute properties
            this.commands.set(command.name, command);
        }
        console.log(`Loaded ${this.commands.size} prefix commands.`);
    }

    handleCommand(message) {

        if (!message.content.startsWith(this.commandPrefix) || message.author.bot) return;

        const args = message.content.slice(this.commandPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!this.commands.has(commandName)) return;

        const command = this.commands.get(commandName);

        try {

            command.execute(message, args);
        } catch (error) {
            
            console.error(`Error executing command ${commandName}:`, error);

        }
    }
}

module.exports = PrefixCommandHandler;
