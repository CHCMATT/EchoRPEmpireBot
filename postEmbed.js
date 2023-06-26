let dbCmds = require('./dbCmds.js');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

module.exports.postEmbed = async (client) => {
	let employeeStats = await dbCmds.currStats();
	let overallDescList = '';

	let now = Math.floor(new Date().getTime() / 1000.0);
	let today = `<t:${now}:d>`;

	for (let i = 0; i < employeeStats.length; i++) {
		if (employeeStats[i].housesSold > 0 || employeeStats[i].warehousesSold > 0 || employeeStats[i].propertiesQuoted > 0 || employeeStats[i].propertiesRepod > 0 || employeeStats[i].activityChecks > 0 || employeeStats[i].miscSales > 0 || employeeStats[i].financialAgreements > 0 || employeeStats[i].financialPayments > 0) {
			overallDescList = overallDescList.concat(`__${employeeStats[i].charName}__: 
• **Houses Sold:** ${employeeStats[i].housesSold}
• **Warehouses Sold:** ${employeeStats[i].warehousesSold}
• **Properties Quoted:** ${employeeStats[i].propertiesQuoted}
• **Properties Repossessed:** ${employeeStats[i].propertiesRepod}
• **Train Activities Checked:** ${employeeStats[i].activityChecks}
• **Misc. Sales Completed:** ${employeeStats[i].miscSales}
• **Financial Agreements Filed:** ${employeeStats[i].financialAgreements}
• **Financial Payments Accepted:** ${employeeStats[i].financialPayments}\n\n`);
		}
	}

	if (overallDescList == '') {
		overallDescList = "There is no realtor data to display yet."
	}

	let overallStatsEmbed = new EmbedBuilder()
		.setTitle(`Overall Realtor Statistics as of ${today}:`)
		.setDescription(overallDescList)
		.setColor('A47E1B');

	let monthlyDescList = '';

	for (let i = 0; i < employeeStats.length; i++) {
		if (employeeStats[i].monthlyHousesSold > 0 || employeeStats[i].monthlyWarehousesSold > 0 || employeeStats[i].monthlyPropertiesQuoted > 0 || employeeStats[i].monthlyPropertiesRepod > 0 || employeeStats[i].monthlyActivityChecks > 0 || employeeStats[i].monthlyMiscSales > 0 || employeeStats[i].monthlyFinancialAgreements > 0 || employeeStats[i].monthlyFinancialPayments > 0) {
			monthlyDescList = monthlyDescList.concat(`__${employeeStats[i].charName}__:
• **Houses Sold:** ${employeeStats[i].monthlyHousesSold}
• **Warehouses Sold:** ${employeeStats[i].monthlyWarehousesSold}
• **Properties Quoted:** ${employeeStats[i].monthlyPropertiesQuoted}
• **Properties Repossessed:** ${employeeStats[i].monthlyPropertiesRepod}
• **Train Activities Checked:** ${employeeStats[i].monthlyActivityChecks}
• **Misc. Sales Completed:** ${employeeStats[i].monthlyMiscSales}
• **Financial Agreements Filed:** ${employeeStats[i].monthlyFinancialAgreements}
• **Financial Payments Accepted:** ${employeeStats[i].monthlyFinancialPayments}\n\n`);
		}
	}

	if (monthlyDescList == '') {
		monthlyDescList = "There is no realtor data to display yet."
	}

	let monthlyStatsEmbed = new EmbedBuilder()
		.setTitle(`Monthly Realtor Statistics as of ${today}:`)
		.setDescription(monthlyDescList)
		.setColor('926C15');

	client.statsMsg = await client.channels.cache.get(process.env.EMBED_CHANNEL_ID).send({ embeds: [overallStatsEmbed, monthlyStatsEmbed] });

	await dbCmds.setMsgId("statsMsg", client.statsMsg.id);

	let countHousesSold = await dbCmds.readSummValue("countHousesSold");
	let countWarehousesSold = await dbCmds.readSummValue("countWarehousesSold");
	let countPropertiesQuoted = await dbCmds.readSummValue("countPropertiesQuoted");
	let countPropertiesRepod = await dbCmds.readSummValue("countPropertiesRepod");
	let countTrainActivitiesChecked = await dbCmds.readSummValue("countTrainActivitiesChecked");
	let countMiscSales = await dbCmds.readSummValue("countMiscSales");
	let countFinancialAgreements = await dbCmds.readSummValue("countFinancialAgreements");
	let activeFinancialAgreements = await dbCmds.readSummValue("activeFinancialAgreements");
	let countFinancialPayments = await dbCmds.readSummValue("countFinancialPayments");

	// theme color palette: https://coolors.co/palette/ffe169-fad643-edc531-dbb42c-c9a227-b69121-a47e1b-926c15-805b10-76520e

	countHousesSold = countHousesSold.toString();
	countWarehousesSold = countWarehousesSold.toString();
	countPropertiesQuoted = countPropertiesQuoted.toString();
	countPropertiesRepod = countPropertiesRepod.toString();
	countTrainActivitiesChecked = countTrainActivitiesChecked.toString();
	countMiscSales = countMiscSales.toString();
	countFinancialAgreements = countFinancialAgreements.toString();
	activeFinancialAgreements = activeFinancialAgreements.toString();
	countFinancialPayments = countFinancialPayments.toString();

	let housesSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Houses Sold:')
		.setDescription(countHousesSold)
		.setColor('#805B10');

	let warehousesSoldEmbed = new EmbedBuilder()
		.setTitle('Amount of Warehouses Sold:')
		.setDescription(countWarehousesSold)
		.setColor('#926C15');

	let propertiesQuotedEmbed = new EmbedBuilder()
		.setTitle('Amount of Properties Quoted:')
		.setDescription(countPropertiesQuoted)
		.setColor('#A47E1B');

	let propertiesRepodEmbed = new EmbedBuilder()
		.setTitle('Amount of Properties Repossessed:')
		.setDescription(countPropertiesRepod)
		.setColor('#B69121');

	let trainActivitiesCheckedEmbed = new EmbedBuilder()
		.setTitle('Amount of Train Activities Checked:')
		.setDescription(countTrainActivitiesChecked)
		.setColor('#C9A227');

	let miscSalesEmbed = new EmbedBuilder()
		.setTitle('Amount of Miscellaneous Sales Completed:')
		.setDescription(countMiscSales)
		.setColor('#C9A227');

	let finanAgreeEmbed = new EmbedBuilder()
		.setTitle('Amount of Financial Agreements Filed:')
		.setDescription(`${countFinancialAgreements} (${activeFinancialAgreements} active)`)
		.setColor('#DBB42C');

	let finanPaymentsEmbed = new EmbedBuilder()
		.setTitle('Amount of Financial Payments Accepted:')
		.setDescription(countFinancialPayments)
		.setColor('#EDC531');

	let btnRows = addBtnRows();

	client.embedMsg = await client.channels.cache.get(process.env.EMBED_CHANNEL_ID).send({ embeds: [housesSoldEmbed, warehousesSoldEmbed, propertiesQuotedEmbed, propertiesRepodEmbed, trainActivitiesCheckedEmbed, miscSalesEmbed, finanAgreeEmbed, finanPaymentsEmbed], components: btnRows });

	await dbCmds.setMsgId("embedMsg", client.embedMsg.id);
};

function addBtnRows() {
	let row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addHouseSold')
			.setLabel('Add a House Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addWarehouseSold')
			.setLabel('Add a Warehouse Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addMiscSale')
			.setLabel('Add a Misc. Sale')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addHouseRemodel')
			.setLabel('Add a House Remodel')
			.setStyle(ButtonStyle.Success),

		new ButtonBuilder()
			.setCustomId('addWarehouseRemodel')
			.setLabel('Add a Warehouse Remodel')
			.setStyle(ButtonStyle.Success),
	);

	let row2 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addPropQuoted')
			.setLabel('Add a Property Quote')
			.setStyle(ButtonStyle.Primary),

		new ButtonBuilder()
			.setCustomId('addPropRepod')
			.setLabel('Add a Property Repo')
			.setStyle(ButtonStyle.Primary),

		new ButtonBuilder()
			.setCustomId('addTrainCheck')
			.setLabel('Add a Train Check')
			.setStyle(ButtonStyle.Primary),
	);

	let row3 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('addFinancingAgreement')
			.setLabel('Add a Financing Agreement')
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId('addFinancingPayment')
			.setLabel('Add a Financing Payment')
			.setStyle(ButtonStyle.Secondary),
	);

	let rows = [row1, row2, row3];
	return rows;
};