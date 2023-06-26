let dbCmds = require('./dbCmds.js');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, time } = require('discord.js');

module.exports.postEmbed = async (client) => {
	let salespersonStats = await dbCmds.currStats();
	let overallDescList = '';

	let now = Math.floor(new Date().getTime() / 1000.0);
	let today = time(now, 'd');

	for (let i = 0; i < salespersonStats.length; i++) {
		if (salespersonStats[i].purchaseAgreements > 0) {
			overallDescList = overallDescList.concat(`__${salespersonStats[i].charName}__: 
• Purchase Agreements: ${salespersonStats[i].purchaseAgreements}\n\n`);
		}
	}

	let countPurchaseAgreements = await dbCmds.readSummValue("countPurchaseAgreements");

	countPurchaseAgreements = countPurchaseAgreements.toString();

	// theme color palette: https://coolors.co/palette/7400b8-6930c3-5e60ce-5390d9-4ea8de-48bfe3-56cfe1-64dfdf-72efdd-80ffdb

	if (overallDescList == '') {
		overallDescList = "There is no salesperson data to display yet."
	}

	let overallStatsEmbed = new EmbedBuilder()
		.setTitle(`Overall Salesperson Statistics as of ${today}:`)
		.setDescription(overallDescList)
		.setColor('5390D9');

	let purchaseAgreementsEmbed = new EmbedBuilder()
		.setTitle('Amount of Purchase Agreements Created:')
		.setDescription(countPurchaseAgreements)
		.setColor('4EA8DE');

	let btnRows = addBtnRows();

	client.embedMsg = await client.channels.cache.get(process.env.EMBED_CHANNEL_ID).send({ embeds: [overallStatsEmbed, purchaseAgreementsEmbed], components: btnRows });

	await dbCmds.setMsgId("embedMsg", client.embedMsg.id);
};

function addBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('newPurchaseAgreement')
			.setLabel('Create a Purchase Agreement')
			.setStyle(ButtonStyle.Primary),
	);

	let rows = [row1];
	return rows;
};