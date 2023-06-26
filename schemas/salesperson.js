let { Schema, model, models } = require('mongoose');

let reqString = {
	type: String,
	required: true,
};

let reqNum = {
	type: Number,
	required: true,
};

let salespersonSchema = new Schema({
	discordId: reqString,
	charName: reqString,
	purchaseAgreements: reqNum,
});

module.exports = models['salesperson'] || model('salesperson', salespersonSchema);