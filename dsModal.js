let moment = require('moment');
let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder, time } = require('discord.js');

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

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = time(now, 'd');
				var contractEndDateTime = now + (86400 * 60); // 86400 seconds in a day times 60 days
				var contractEndDate = time(contractEndDateTime, 'd');
				var contractEndDateRelative = time(contractEndDateTime, 'R');

				var clientName = strCleanup(interaction.fields.getTextInputValue('clientNameInput'));
				var clientInfo = strCleanup(interaction.fields.getTextInputValue('clientInfoInput'));
				var clientContact = strCleanup(interaction.fields.getTextInputValue('clientContactInput'));
				var lotNumStreetName = strCleanup(interaction.fields.getTextInputValue('lotNumStreetNameInput'));
				var price = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('priceInput')).replaceAll(',', '').replaceAll('$', '')));

				if (isNaN(price)) { // validate quantity of money
					await interaction.editReply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('priceInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var downPayment = (price * 0.3);
				var interest = ((price - downPayment) * .14);
				var amountOwed = (price - downPayment + interest);
				var totalOwed = (price + interest);

				var formattedPrice = formatter.format(price);
				var formattedDownPayment = formatter.format(downPayment);
				var formattedAmountOwed = formatter.format(amountOwed);
				var formattedTotalOwed = formatter.format(totalOwed);
				var formattedInterest = formatter.format(interest);

				let newFile = await interaction.client.driveFiles.copy({
					auth: interaction.client.driveAuth, fileId: process.env.FINANCE_TEMPLATE_DOC_ID, resource: { name: `${clientName} | Dynasty 8 Financing & Sales Agreement` }
				});

				let documentLink = `https://docs.google.com/document/d/${newFile.data.id}`;

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Finance Agreements!A:G", valueInputOption: "RAW", resource: { values: [[`${realtorName} (<@${interaction.user.id}>)`, saleDate, clientName, clientInfo, clientContact, lotNumStreetName, price, documentLink]] }
				});

				let todayDate = moment().format('MMMM DD, YYYY');

				await interaction.client.googleDocs.batchUpdate({
					auth: interaction.client.driveAuth, documentId: newFile.data.id, resource: {
						requests: [{
							replaceAllText: {
								replaceText: clientName,
								containsText: {
									"text": "{client_name}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: clientInfo,
								containsText: {
									"text": "{client_info}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: clientContact,
								containsText: {
									"text": "{client_contact}",
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
								replaceText: lotNumStreetName,
								containsText: {
									"text": "{street_address}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: formattedPrice,
								containsText: {
									"text": "{purchase_price}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: formattedDownPayment,
								containsText: {
									"text": "{down_payment}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: formattedTotalOwed,
								containsText: {
									"text": "{total_owed}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: financeNum,
								containsText: {
									"text": "{financing_number}",
									"matchCase": true
								}
							},
						}, {
							replaceAllText: {
								replaceText: realtorName,
								containsText: {
									"text": "{realtor_name}",
									"matchCase": true
								}
							},
						}]
					}
				});

				var embeds = [new EmbedBuilder()
					.setTitle('A new Financing Agreement has been submitted!')
					.addFields(
						{ name: `Realtor Name:`, value: `${realtorName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}`, inline: true },
						{ name: `Latest Payment:`, value: `${saleDate}`, inline: true },
						{ name: `Next Payment Due:`, value: `${nextPaymentDate} (${nextPaymentDateRelative})`, inline: true },
						{ name: `Financing ID Number:`, value: `${financeNum}` },
						{ name: `Client Name:`, value: `${clientName}`, inline: true },
						{ name: `Client Info:`, value: `${clientInfo}`, inline: true },
						{ name: `Client Contact:`, value: `${clientContact}`, inline: true },
						{ name: `Street Address:`, value: `${lotNumStreetName}` },
						{ name: `Sale Price:`, value: `${formattedPrice}`, inline: true },
						{ name: `Down Payment:`, value: `${formattedDownPayment}`, inline: true },
						{ name: `Amount Owed:`, value: `${formattedAmountOwed}`, inline: true },
						{ name: `Financing Agreement:`, value: `${documentLink}` },
					)
					.setColor('FAD643')];

				await interaction.client.channels.cache.get(process.env.FINANCING_AGREEMENTS_CHANNEL_ID).send({ embeds: embeds });

				await dbCmds.addOneSumm("countFinancialAgreements");
				await dbCmds.addOneSumm("countMonthlyFinancialAgreements");
				await dbCmds.addOneSumm("activeFinancialAgreements");
				await dbCmds.addValueSumm("activeFinancialAmount", Math.round(amountOwed));
				await dbCmds.addOnePersStat(interaction.member.user.id, "financialAgreements");
				await dbCmds.addOnePersStat(interaction.member.user.id, "monthlyFinancialAgreements");

				await editEmbed.editEmbed(interaction.client);

				var newFinancialAgreementsTotal = await dbCmds.readSummValue("countFinancialAgreements");

				await interaction.editReply({ content: `Successfully added \`1\` to the \`Financial Agreements\` counter and added this sale to the <#${process.env.FINANCING_AGREEMENTS_CHANNEL_ID}> channel - the new total is \`${newFinancialAgreementsTotal}\`.\n\nDetails about this agreement:\n> Sale Price: \`${formattedPrice}\`\n> Down Payment: \`${formattedDownPayment}\`\n> Interest Cost: \`${formattedInterest}\`\n> Amount Owed Remaining: \`${formattedAmountOwed}\`\n> Financing Agreement: <${documentLink}>`, ephemeral: true });
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		console.log(`Error in modal popup!`);
		console.error(error);
	}
};


