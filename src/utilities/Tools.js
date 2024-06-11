const { mod } = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

const moderationFilePath = "./src/data/moderation.txt";

function getModeration() {
    let data;

    try {
        data = fs.readFileSync(moderationFilePath, 'utf-8');
        // console.log("Moderation data loaded:", data);
    } catch (error) {
        // console.error(`Could not load moderation data: ${error.message}`);
        return false; 
    }

    return data.trim().toLowerCase() === 'on';
}

function setModeration(value) {

    try {

        fs.writeFileSync(moderationFilePath, value);

    } catch (error) {
        console.error(`Could not save moderation data: ${error.message}`);
    }

}

module.exports =  {getModeration, setModeration};