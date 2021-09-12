const ModelMoments = artifacts.require('ModelMoments');

const utils = require('./utils');
var expect = require('chai').expect;

contract('ModelMoments', (accounts) => {
	let modelMoments;
	let modelOwner = accounts[0];
	let cloudProvider = accounts[1];

	before(async () => {
		modelMoments = await ModelMoments.deployed();
	});

	describe('Uploading and retrieving model information', async () => {
		let firstMoment = '1234';
		let secondMoment = '9876';
		let publicKeyN = 'publickeymodulus42';
		let modelHash;

		before('Upload model information', async () => {
			// Hash model
			modelHash = await web3.utils.soliditySha3({t: 'bytes32', v: 'ficticiousModel#4'});

			// Upload round information
			//await modelMoments.update(firstMoment, secondMoment, publicKeyN, modelHash, cloudProvider, {from: modelOwner});
		});

		// TO-DO: Basic test (model information)

		// TO-DO: Test 'onlyOwner'

		// TO-DO: Test point system
	});
});