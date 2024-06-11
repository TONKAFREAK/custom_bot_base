const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const nsfwjs = require('nsfwjs');
const tf = require('@tensorflow/tfjs-node');

const bannedWordsFilePath = "./src/data/banned_words.txt";

//---------------- Chat moderation ---------------

async function chatModeration(message) {

    //---------------- Check if its a command---------------

    isCommand(message);

    //---------------- Check if its a Discord invite ---------------

    isDiscordInviteLink(message);

        
    //---------------- Check if its a NSFW ---------------

    isImageNSFW(message);

    //---------------- Check banned word -----------------

    isBannedWord(message, bannedWordsFilePath);
    
}



//---------------- Helper functions ---------------

function isURL(str) {
    
    var pattern = new RegExp('^(https?:\\/\\/)?'+ 
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ 
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
      '(\\#[-a-z\\d_]*)?$','i');
  
    return pattern.test(str);
}

//------------------------------------------------

async function isCommand(message){

    const commandPrefixes = ['>ubw', '>bw'];
    const messageContent = message.content.toLowerCase();
    const member = await message.guild.members.fetch(message.author.id);

    for (const prefix of commandPrefixes) {
        if (messageContent.startsWith(prefix) && member.permissions.has(PermissionFlagsBits.Administrator)) {
            return;
        }
    }
}

//------------------------------------------------

async function isDiscordInviteLink(message) {
    
    var pattern = new RegExp('^(https?:\\/\\/)?(www\\.)?(discord\\.(gg|io|me|li|com|net|org|app)|discord(?:app)?\\.com\\/invite)\\/([a-zA-Z0-9]+)$','i');

    if(pattern.test(message.content)){

        try {
            await message.delete();
        } catch (error) {
            console.error(`Could not delete message: ${error.message}`);
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`**Your message was deleted and you have received a warning**
                            <--------------------------------------->
                            **Reason:** Discord invite URL 
                            **Message:** ||${message.content}||`); 
        try {
            return await message.author.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Could not send DM to ${message.author.tag}: ${error.message}`);
        }
    }
}

//------------------------------------------------

async function isBannedWord(message, bannedWordsFilePath ) {

    const messageContent = message.content.toLowerCase();

    let bannedWords = [];
    try {
        const data = fs.readFileSync(bannedWordsFilePath, 'utf-8');
        bannedWords = data.split('\n').map(word => word.trim().toLowerCase()).filter(word => word.length > 0);
        //console.log("Banned words loaded:", bannedWords);  
    } catch (error) {
        console.error(`Could not read the banned words file: ${error.message}`);
        return;
    }

    //--------------- Check if the message contains banned words ---------------

    for (const word of bannedWords) {
        if (word && messageContent.includes(word)) {
            try {
                await message.delete();
            } catch (error) {
                console.error(`Could not delete message: ${error.message}`);
            }

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`**Your message was deleted and you have received a warning**
                                <--------------------------------------->
                                **Reason:** Message contains banned words 
                                **Message:** ||${message.content}||`); 
            try {
                await message.author.send({ embeds: [embed] });
            } catch (error) {
                console.error(`Could not send DM to ${message.author.tag}: ${error.message}`);
            }
            break;
        }
    }
}

//------------------------------------------------

let nsfwModel;

async function loadModel() {
    nsfwModel = await nsfwjs.load('MobileNetV2');
}

async function isImageNSFW(message) {
    if (message.attachments.size > 0) {
        const checkPromises = message.attachments.map(async (attachment) => {
            if (attachment.contentType.startsWith('image/')) {
                try {
                    const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(response.data, 'binary');
                    const image = await tf.node.decodeImage(imageBuffer, 3);
                    const predictions = await nsfwModel.classify(image);

                    image.dispose(); 

                    console.log('NSFW predictions:', predictions);

                    const nsfwPredictions = predictions.filter(prediction =>
                        ['Porn', 'Hentai', 'Sexy'].includes(prediction.className) &&
                        ((prediction.className === 'Hentai' && prediction.probability > 0.5) ||
                         (prediction.className === 'Sexy' && prediction.probability > 0.8) ||
                         (prediction.className === 'Porn' && prediction.probability > 0.5))
                    );

                    if (nsfwPredictions.length > 0) {
                        await message.delete();
                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: message.author.username,
                                iconURL: message.author.displayAvatarURL({ dynamic: true }),
                            })
                            .setDescription(`**Your message was deleted and you have received a warning**
                                            <--------------------------------------->
                                            **Reason:** NSFW image 
                                            **Message:** ||[attachment](${attachment.url})||`);

                        try {
                            await message.author.send({ embeds: [embed] });
                        } catch (error) {
                            console.error(`Could not send DM to ${message.author.tag}: ${error.message}`);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing NSFW image: ${error.message}`);
                }
            }
        });

        await Promise.all(checkPromises);
    }
}


module.exports = {chatModeration, loadModel};

