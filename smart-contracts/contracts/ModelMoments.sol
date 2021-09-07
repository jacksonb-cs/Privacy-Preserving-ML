// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Stores model moments of most successful model participant as well as their model hash
/// @author Jackson Bullard
contract ModelMoments is Ownable {
	// Raw ciphertext from Python-Paillier of model moments
	string firstMoment;
	string secondMoment;
	
	// Hash of the most successful model
	bytes32 modelHash;

	// Public key's "n" (See Python-Paillier documentation)
	string publicKeyN;

	// Address of the cloud owner with the (potentially/verified) most accurate model
	address winningCloudProvider;

	// Keeps track of how many points every cloud provider has
	mapping (address => int) cloudProviderPoints;

	/**
	 * @notice Updates model information; Called by model owner
	 *
	 * @dev The below 'string' params should be converted to integers upon deserialisation.
	 * You can then use the respective constructors (EncryptedNumber, PaillierPublicKey)
	 * assuming you are using Python-Paillier.
	 *
	 * @param _firstMoment Raw Paillier ciphertext of the model's first moment
	 * @param _secondMoment Raw Paillier ciphertext of the model's second moment
	 * @param _publicKeyN Part of the public key used for deserialising the raw encrypted moments
	 * @param _cloudProvider Address of the cloud provider with the verified most successful model
	 */
	function update(
		string calldata _firstMoment,
		string calldata _secondMoment,
		string calldata _publicKeyN,
		bytes32 _modelHash,
		address _cloudProvider
	)
	external onlyOwner
	{
		firstMoment = _firstMoment;
		secondMoment = _secondMoment;
		publicKeyN = _publicKeyN;
		modelHash = _modelHash;
		winningCloudProvider = _cloudProvider;
		cloudProviderPoints[_cloudProvider]++;
	}

	function retrieveModel() external view returns (string memory, string memory, string memory) {
		return (firstMoment, secondMoment, publicKeyN);
	}
}
