const ModelConfirmation = artifacts.require('ModelConfirmation');

const utils = require('./utils');
var expect = require('chai').expect;

contract('ModelConfirmation', (accounts) => {
	let modelConfirmation;
	let modelOwner = accounts[0];
	let cloudProvider = accounts[1];

	before(async () => {
		modelConfirmation = await ModelConfirmation.deployed();
	});

	describe('Mapping cloud providers to hashes and then checking verification process', async () => {
		let correctModel = 'ThisIsAModel42';
		let incorrectModel = 'ThisIsACorruptedModel42';
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

		it('Should throw an error upon attempting to map a cloud provider to a duplicate model hash', async () => {
			// modelHash was already mapped once before, so the below request should throw an error
			await utils.shouldThrow(modelConfirmation.mapProviderToModel(modelHash, cloudProvider, {from: modelOwner}));
		});
	});

	describe('Updating existing model confirmations for new rounds', async () => {
		let newModel = 'ModelIs98%Accurate';
		let confirmationsArray;

		before('Update existing model confirmation', async () => {
			// Hash new model
			let newModelHash = await web3.utils.soliditySha3({t: 'bytes32', v: newModel});
			// Map new model hash to existing confirmation
			await modelConfirmation.mapProviderToModel(newModelHash, cloudProvider, {from: modelOwner});

			confirmationsArray = await modelConfirmation.getModelConfirmations(cloudProvider);
		});

		it('Should not create a new Confirmation entirely and instead update existing', async () => {
			let errMsg = 'A new confirmation was created!';
			expect(confirmationsArray.length, errMsg).to.equal(1);
		});

		it('Should update the Confirmation with the new model hash', async () => {
			let hash = await web3.utils.soliditySha3({t: 'bytes32', v: newModel});

			let errMsg = 'Confirmation\'s hash was not appropriately updated!';
			expect(confirmationsArray[0].modelHash, errMsg).to.equal(hash);
		});

		it('Should set the new model hash as NOT verified', async () => {
			let errMsg = 'The new model hash is still set as verified!';
			expect(confirmationsArray[0].verifiedHash, errMsg).to.equal(false);
		});

		it('Should still create a new Confirmation from a different model owner', async () => {
			let hash = await web3.utils.soliditySha3({t: 'bytes32', v: 'CompletelyDifferentModel|/--'});
			let secondModelOwner = accounts[2];

			await modelConfirmation.mapProviderToModel(hash, cloudProvider, {from: secondModelOwner});
			confirmationsArray = await modelConfirmation.getModelConfirmations(cloudProvider);

			let errMsg = 'Two separate Confirmations should exist on-chain!';
			expect(confirmationsArray.length, errMsg).to.equal(2);
		});
	});
});