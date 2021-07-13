const ModelMoments = artifacts.require("ModelMoments");
const DataConfirmation = artifacts.require("DataConfirmation");
const ModelConfirmation = artifacts.require("ModelConfirmation");

module.exports = function (deployer) {
	deployer.deploy(ModelMoments);
	deployer.deploy(DataConfirmation);
	deployer.deploy(ModelConfirmation);
};