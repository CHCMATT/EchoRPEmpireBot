require('discord.js');
let dbCmds = require('./dbCmds.js');

module.exports.initPersonnel = async (client, userId) => {
	try {
		let guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
		let user = await guild.members.fetch(userId);
		let initCharName;
		if (user.nickname) {
			initCharName = user.nickname;
		} else {
			initCharName = user.user.username;
		}
		await dbCmds.initPersStats(userId, initCharName);
	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			console.error(error);
		} else {
			console.error(error);

			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.log(`Error occured at ${errTime} at file ${fileName}!`);

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};