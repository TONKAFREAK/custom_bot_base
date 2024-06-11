const { EmbedBuilder } = require("discord.js");

const badgeIcons = {
    'HypeSquadOnlineHouse1' : '<:HypeSquad_Bravery:1250055170805465118>',
    'HypeSquadOnlineHouse2' : '<:HypeSquad_Brilliance:1250055528198176911>',
    'HypeSquadOnlineHouse3' : '<:HypeSquad_Balance:1250056095821725716>',
    'BugHunterLevel1' : '<a:Discord_Bug_Hunter_animated:1250056748933320725>',
    'BugHunterLevel2' : '<a:Discord_Gold_Bug_Hunter_animated:1250056630582644820>',
    'ActiveDeveloper' : '<a:Active_Developer_Badge_animated:1250058152548896768>',
    'CertifiedModerator' : '<a:Certified_Moderator_animated:1250056997374660661>',
    'Staff' : '<a:Discord_Staff_animated:1250057377366151251>',
    'PartneredServerOwner' : '<a:Partnered_Server_Owner_a:1250057682862211154>',
    'EarlyVerifiedBotDeveloper' : '<a:Early_Verified_Bot_Developer_a:1250058406220533862>',
};


module.exports = {

    name : "whois",
    async execute(message, args){

        //---------------- Check if a user is mentioned --------------

        const taggedUser = message.mentions.users.first();
        if (!taggedUser) {
            return message.reply('Please tag a user to get information about them.');
        }

        //---------------- Fetch the member information --------------
        
        try {
            const taggedMember = await message.guild.members.fetch(taggedUser.id);

            const userBadges = taggedUser.flags.toArray().map(flag => badgeIcons[flag] || flag).join(' ');

            //const memberRoles = taggedMember.roles.cache.filter(role => role.name!== '@everyone').map(role => `@${role.name}`);

            const embedDescription = `
                General information:
                **Name**: \`${taggedUser.username}\`
                ***  ID***: ${taggedMember.id}  
                **Created**: ${taggedUser.createdAt.toDateString()}
                **Joined**: ${taggedMember.joinedAt.toDateString()}
                **Color**: ${taggedMember.displayHexColor}
                **Discord Badges**: ${userBadges}

                Moderation information:
                **Suspicious?**: No
                **Warnings**: 0

                Server information:
                **Boosting "${message.guild.name}"?**: ${taggedMember.premiumSince ? 'Yes' : 'No'}
            `;

            //**Roles**: ${memberRoles.join(', ')}

            const embed = new EmbedBuilder()
                .setColor('#36393e')
                .setTitle(`Who is ${taggedUser.tag}`)
                .setThumbnail(taggedUser.displayAvatarURL({ dynamic: true }))
                .setDescription(embedDescription)

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Could not fetch member information: ${error.message}`);
            message.reply('There was an error fetching the user information.');
        }

    },   
};
