const moment = require('moment');

module.exports = (client) => {
	client.on('messageCreate', async message => {
		try {
			if (message.guild == null && message.author.id !== client.user.id) {
				await message.channel.sendTyping();

				let now = Math.floor(new Date().getTime() / 1000.0);

				client.users.send(`177088916250296320`, `${message.author} sent a DM at <t:${now}:T> (<t:${now}:R>):\n> ${message.content}`);

				await message.author.send({ content: `Hi there! I am not able help you via DM, if you have a request or problem, please DM my developer <@177088916250296320> directly.` });
			}
		} catch (error) {
			if (process.env.BOT_NAME == 'test') {
				console.error(error);
			} else {
				console.error(error);

				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];

				console.log(`An error occured at ${errTime} at file ${fileName}!`);

				let errString = error.toString();

				if (errString === 'Error: The service is currently unavailable.') {
					try {
						await interaction.editReply({ content: `⚠ A service provider we use has had a temporary outage. Please try to submit your request again.`, ephemeral: true });
					} catch {
						await interaction.reply({ content: `⚠ A service provider we use has had a temporary outage. Please try to submit your request again.`, ephemeral: true });
					}
				}

				let errorEmbed = [new EmbedBuilder()
					.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
					.setDescription(`\`\`\`${errString}\`\`\``)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
			}
		}
	});
};
