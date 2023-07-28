let moment = require('moment');
let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		let buttonID = interaction.customId;
		switch (buttonID) {
			case 'newPurchaseAgreement':
				let newPurchaseAgreementModal = new ModalBuilder()
					.setCustomId('newPurchaseAgreementModal')
					.setTitle('Create a new Purchase Agreement');
				let buyerNameInput = new TextInputBuilder()
					.setCustomId('buyerName')
					.setLabel("What is the name of the buyer?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName')
					.setRequired(true);
				let buyerCidInput = new TextInputBuilder()
					.setCustomId('buyerCid')
					.setLabel("What is the CID of the buyer?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('12345')
					.setRequired(true);
				let vehicleNameInput = new TextInputBuilder()
					.setCustomId('vehicleName')
					.setLabel("What is the name of the vehicle?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('Aurora Sport')
					.setRequired(true);

				let buyerNameInputRow = new ActionRowBuilder().addComponents(buyerNameInput);
				let buyerCidInputRow = new ActionRowBuilder().addComponents(buyerCidInput);
				let vehicleNameInputRow = new ActionRowBuilder().addComponents(vehicleNameInput);

				newPurchaseAgreementModal.addComponents(buyerNameInputRow, buyerCidInputRow, vehicleNameInputRow);

				await interaction.showModal(newPurchaseAgreementModal);
				break;
			default:
				await interaction.editReply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
		}
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