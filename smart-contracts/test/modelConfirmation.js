const ModelConfirmation = artifacts.require('ModelConfirmation');
var expect = require('chai').expect;

contract('ModelConfirmation', (accounts) => {
	let modelConfirmation;

	before(async () => {
		modelConfirmation = await ModelConfirmation.deployed();
	});

	describe('Mapping cloud providers to hashes and then checking verification process', async () => {
		let correctModel = 'ThisIsAModel42';
		let incorrectModel = 'ThisIsACorruptedModel42';
		let modelOwner = accounts[0];
		let cloudProvider = accounts[1];
		let modelHash;

		before('Map a cloud provider to a model hash', async () => {
			// Hash model
			modelHash = await web3.utils.soliditySha3({t: 'bytes32', v: correctModel});

			// Map the model hash to the cloud provider on-chain
			await modelConfirmation.mapProviderToModel(modelHash, cloudProvider, {from: modelOwner});
		});

		it('Should initialize a confirmation\'s verifiedHash to false', async () => {
			// Accesses the mapping with cloud provider's address, which returns an array of pending/verified confirmations
			let confirmationsArray = await modelConfirmation.getModelConfirmations(cloudProvider);

			let errMsg = 'Pending confirmation should not be marked as verified but is!';
			expect(confirmationsArray[0].verifiedHash, errMsg).to.equal(false);
		});

		it('Should not verify the hash if the cloud provider received a wrong/incomplete model', async () => {
			// Generate cloud provider's (incorrect) model hash
			let cloudProviderHash = await web3.utils.soliditySha3({t: 'bytes32', v: incorrectModel});

			// Attempt to verify cloud provider's hash
			await modelConfirmation.verifyModelHash(cloudProviderHash, {from: cloudProvider});

			// Access the mapping with the cloud provider's address, which returns an array of pending/verified confirmations
			let confirmationsArray = await modelConfirmation.getModelConfirmations(cloudProvider);

			let errMsg = 'Hash should not have been verified but was!';
			expect(confirmationsArray[0].verifiedHash, errMsg).to.equal(false);
		});

		it('Should mark the cloud provider as eligible after they have verified their hashed model', async () => {
			// Generate the cloud provider's model hash
			let cloudProviderHash = await web3.utils.soliditySha3({t: 'bytes32', v: correctModel});

			// Verify the cloud provider's hash
			await modelConfirmation.verifyModelHash(cloudProviderHash, {from: cloudProvider});

			// Access the mapping with the cloud provider's address, which returns an array of pending/verified confirmations
			let confirmationsArray = await modelConfirmation.getModelConfirmations(cloudProvider);

			let errMsg = 'Hash should have been verified but was not!';
			expect(confirmationsArray[0].verifiedHash, errMsg).to.equal(true);
		});
	});
});