const DataConfirmation = artifacts.require('DataConfirmation');
//Using CommonJS modules because NodeJS doesn't understand ES6
const utils = require('./utils');
var expect = require('chai').expect;

contract('DataConfirmation', (accounts) => {
	let dataConfirmation;

	before(async () => {
		dataConfirmation = await DataConfirmation.deployed();
	});

	describe('Mapping cloud providers to hashes and then checking verification process', async () => {
		let correctData = 'ThisIsData1234';
		let incorrectData = 'ThisIsCorruptedData1234';
		let dataOwner = accounts[0];
		let cloudProvider = accounts[1];
		let dataHash;

		before('Map a cloud provider to a data hash', async () => {
			// Hash data
			dataHash = await web3.utils.soliditySha3({t: 'bytes32', v: correctData});

			// Map the data hash to the cloud provider on-chain
			await dataConfirmation.mapProviderToData(dataHash, cloudProvider, {from: dataOwner});
		});

		it('Should initialize a confirmation\'s verifiedHash to false', async () => {
			// Accesses the mapping with cloud provider's address, which returns an array of pending/verified confirmations
			let confirmationsArray = await dataConfirmation.getDataConfirmations(cloudProvider);

			let errMsg = 'Pending confirmation should not be marked as verified but is!';
			expect(confirmationsArray[0].verifiedHash, errMsg).to.equal(false);
		});

		it('Should not verify the hash if the cloud provider received a wrong/incomplete data set', async () => {
			// Generate cloud provider's (incorrect) data hash
			let cloudProviderHash = await web3.utils.soliditySha3({t: 'bytes32', v: incorrectData});

			// Attempt to verify cloud provider's hash
			await dataConfirmation.verifyDataHash(cloudProviderHash, {from: cloudProvider});

			// Accesses the mapping with the cloud provider's address, which returns an array of pending/verified confirmations
			let confirmationsArray = await dataConfirmation.getDataConfirmations(cloudProvider);

			let errMsg = 'Hash should not have been verified but was!';
			expect(confirmationsArray[0].verifiedHash, errMsg).to.equal(false);
		});

		it('Should mark the cloud provider as eligible after they have verified their hashed data set', async () => {
			// Generate the cloud provider's data hash
			let cloudProviderHash = await web3.utils.soliditySha3({t: 'bytes32', v: correctData});

			// Verify the cloud provider's hash
			await dataConfirmation.verifyDataHash(cloudProviderHash, {from: cloudProvider});

			// Accesses the mapping with cloud provider's address, which returns an array of pending/verified confirmations
			let confirmationsArray = await dataConfirmation.getDataConfirmations(cloudProvider);

			let errMsg = 'Hash should have been verified but was not!';
			expect(confirmationsArray[0].verifiedHash, errMsg).to.equal(true);
		});

		it('Should throw an error upon attempting to map a cloud provider to a duplicate data hash', async () => {
			// dataHash was already mapped once before, so the below request should throw an error
			await utils.shouldThrow(dataConfirmation.mapProviderToData(dataHash, cloudProvider, {from: dataOwner}));
		});
	});
});
