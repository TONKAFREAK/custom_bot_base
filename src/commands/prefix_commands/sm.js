const { setModeration } = require("../../utilities/Tools");

module.exports = {
    name: 'sm',
    async execute(message, args) {

        if (args[0] === 'on') {
            setModeration('on');
            message.channel.send('Moderation is now on.');
        } else if (args[0] === 'off') {
            setModeration('off');
            message.channel.send('Moderation is now off.');
        } else {
            message.channel.send('Invalid argument. Please use `on` or `off`.');
        }

    }
}