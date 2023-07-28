let summary = require('./schemas/summary');
let salesperson = require('./schemas/salesperson');

module.exports.readSummValue = async (summaryName) => {
	let result = await summary.findOne({ summaryName }, { value: 1, _id: 0 });
	if (result !== null) {
		return result.value;
	}
	else {
		return `Value not found for ${summaryName}.`;
	}
};

module.exports.addOneSumm = async (summaryName) => {
	await summary.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: 1 } }, { upsert: true });
};

module.exports.subtractOneSumm = async (summaryName) => {
	await summary.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: -1 } }, { upsert: true });
};

module.exports.resetSummValue = async (summaryName) => {
	await summary.findOneAndUpdate({ summaryName: summaryName }, { value: 0 }, { upsert: true });
};

// for finding and adding to the salesperson's statistics
module.exports.initPersStats = async (discordId, discordNickname) => {
	await salesperson.findOneAndUpdate({ discordId: discordId }, { discordId: discordId, charName: discordNickname, purchaseAgreements: 0 }, { upsert: true });
};

module.exports.readPersStats = async (discordId) => {
	let result = await salesperson.findOne({ discordId: discordId }, { discordId: 1, charName: 1, purchaseAgreements: 1, _id: 0 });
	return result;
};

module.exports.addOnePersStat = async (discordId, statName) => {
	await salesperson.findOneAndUpdate({ discordId: discordId }, { $inc: { [statName]: 1 } });
};

module.exports.subtractOnePersStat = async (discordId, statName) => {
	await salesperson.findOneAndUpdate({ discordId: discordId }, { $inc: { [statName]: -1 } });
};

module.exports.resetPersStat = async (discordId, statName) => {
	await salesperson.findOneAndUpdate({ discordId: discordId }, { [statName]: 0 });
};

module.exports.setCharName = async (discordId, charName) => {
	await salesperson.findOneAndUpdate({ discordId: discordId }, { charName: charName }, { upsert: true });
};

// for setting message ID of current Discord embed message
module.exports.setMsgId = async (summaryName, newValue) => {
	await summary.findOneAndUpdate({ summaryName: summaryName }, { msgId: newValue }, { upsert: true });
};

module.exports.readMsgId = async (summaryName) => {
	let result = await summary.findOne({ summaryName }, { msgId: 1, _id: 0 });
	if (result !== null) {
		return result.msgId;
	}
	else {
		return `Value not found for ${summaryName}.`;
	}
};

module.exports.currStats = async () => {
	let result = await salesperson.find({ charName: { $ne: null } }, { discordId: 1, charName: 1, purchaseAgreements: 1, _id: 0 });
	return result;
};