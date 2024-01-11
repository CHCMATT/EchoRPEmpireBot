let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let personnelCmds = require('./personnelCmds.js');
let { EmbedBuilder, time } = require('discord.js');

function toTitleCase(str) {
	str = str.toLowerCase().split(' ');
	for (let i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
	return str.join(' ');
}

function strCleanup(str) {
	let cleaned = str.replaceAll('`', '-').replaceAll('\\', '-').trimEnd().trimStart();
	return cleaned;
};

module.exports.modalSubmit = async (interaction) => {
	try {
		let modalID = interaction.customId;
		switch (modalID) {
			case 'newPurchaseAgreementModal':
				await interaction.deferReply({ ephemeral: true });
				let salespersonName;
				if (interaction.member.nickname) {
					salespersonName = interaction.member.nickname;
				} else {
					salespersonName = interaction.member.user.username;
				}

				let now = Math.floor(new Date().getTime() / 1000.0);
				let saleDate = time(now, 'd');
				let contractEndDateTime = now + (86400 * 60); // 86400 seconds in a day times 60 days
				let contractEndDate = time(contractEndDateTime, 'd');
				let contractEndDateRelative = time(contractEndDateTime, 'R');

				let buyerName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('buyerName')));
				let buyerCid = strCleanup(interaction.fields.getTextInputValue('buyerCid'));
				let vehicleName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('vehicleName')));

				let newFile = await interaction.client.driveFiles.copy({
					auth: interaction.client.driveAuth, fileId: process.env.PURCHASE_AGREEMENT_TEMPLATE_DOC_ID, resource: { name: `${buyerName} - Empire Imports Purchase Agreement` }
				});

				let documentLink = `https://docs.google.com/document/d/${newFile.data.id}`;

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Purchase Agreements!A:E", valueInputOption: "RAW", resource: { values: [[`${salespersonName} (<@${interaction.user.id}>)`, saleDate, buyerName, buyerCid, vehicleName]] }
				});

				let todayDate = moment().format('MMMM DD, YYYY');

				await interaction.client.googleDocs.batchUpdate({
					auth: interaction.client.driveAuth, documentId: newFile.data.id, resource: {
						requests: [{
							replaceAllText: {
								replaceText: buyerName,
								containsText: {
									"text": "{buyer_name}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: buyerCid,
								containsText: {
									"text": "{buyer_cid}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: vehicleName,
								containsText: {
									"text": "{vehicle_name}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: todayDate,
								containsText: {
									"text": "{today_date}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: salespersonName,
								containsText: {
									"text": "{salesperson_name}",
									"matchCase": true
								}
							},
						}]
					}
				});

				let embeds = [new EmbedBuilder()
					.setTitle('A new Purchase Agreement has been filed!')
					.addFields(
						{ name: `Salesperson:`, value: `${salespersonName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}`, inline: true },
						{ name: `Contract End Date:`, value: `${contractEndDate} (${contractEndDateRelative})`, inline: true },
						{ name: `Buyer Name:`, value: `${buyerName}` },
						{ name: `Buyer CID:`, value: `${buyerCid}` },
						{ name: `Vehicle Name:`, value: `${vehicleName}` },
						{ name: `Purchase Agreement:`, value: `[Click to view the Purchase Agreement](${documentLink})` },
					)
					.setColor('4EA8DE')];

				await interaction.client.channels.cache.get(process.env.PURCHASE_AGREEMENTS_CHANNEL_ID).send({ embeds: embeds });

				let personnelStats = await dbCmds.readPersStats(interaction.member.user.id);
				if (personnelStats == null || personnelStats.charName == null) {
					await personnelCmds.initPersonnel(interaction.client, interaction.member.user.id);
				}

				await dbCmds.addOneSumm("countPurchaseAgreements");
				await dbCmds.addOnePersStat(interaction.user.id, "purchaseAgreements");

				await editEmbed.editEmbed(interaction.client);

				let newPurchaseAgreementsTotal = await dbCmds.readSummValue("countPurchaseAgreements");

				await interaction.editReply({ content: `Successfully created a new Purchase Agreement! There have now been \`${newPurchaseAgreementsTotal}\` total Purchase Agreements created.\n\nDetails about this agreement:\n> Buyer Name: \`${buyerName}\`\n> Buyer CID: \`${buyerCid}\`\n> Vehicle Name: \`${vehicleName}\`\n> [Click to view the Purchase Agreement](<${documentLink}>)`, ephemeral: true });

				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		if (process.env.BOT_NAME == 'test') {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];

			console.error(errTime, fileName, error);
		} else {
			let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			let fileParts = __filename.split(/[\\/]/);
			let fileName = fileParts[fileParts.length - 1];
			console.error(errTime, fileName, error);

			console.log(`An error occured at ${errTime} at file ${fileName} and was created by ${interaction.member.nickname} (${interaction.member.user.username}).`);

			let errString = error.toString();
			let errHandled = false;

			if (errString === 'Error: The service is currently unavailable.' || errString === 'Error: Internal error encountered.' || errString === 'HTTPError: Service Unavailable') {
				try {
					await interaction.editReply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
				} catch {
					await interaction.reply({ content: `:warning: One of the service providers we use had a brief outage. Please try to submit your request again!`, ephemeral: true });
				}
				errHandled = true;
			}

			let errorEmbed = [new EmbedBuilder()
				.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
				.setDescription(`\`\`\`${errString}\`\`\``)
				.addFields(
					{ name: `Created by:`, value: `${interaction.member.nickname} (<@${interaction.user.id}>)`, inline: true },
					{ name: `Error handled?`, value: `${errHandled}`, inline: true },
				)
				.setColor('B80600')
				.setFooter({ text: `${errTime}` })];

			await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
		}
	}
};


