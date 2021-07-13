const _DataConfirmation = artifacts.require("DataConfirmation");
var expect = require('chai').expect;

contract("DataConfirmation", (accounts) => {
	let DataConfirmation;

	before(async () => {
		DataConfirmation = await _DataConfirmation.deployed();
	});

	describe("Mapping 'cloud providers' to hashes and then checking verification process...", async () => {
		before("map a 'cloud provider' to a 'model hash'", async () => {
			// Generate keccak256 hash using built in web3.utils.keccak256
			// Call mapProviderToData
		});

		// Test verifyDataHash works with matching hash

		// Test verifyDataHash works with mismatching hash
	});
});