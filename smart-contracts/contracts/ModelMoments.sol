// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// @title Stores model moments of most successful model participant as well as their model hash
/// @author Jackson Bullard
contract ModelMoments {
	// Raw ciphertext from Python-Paillier of model moments
	string firstMoment;
	string secondMoment;
	// Public key's "n" (See Python-Paillier documentation)
	string publicKeyN;
	// Hash of most successful model of all cloud providers
	bytes32 modelHash;
	// Address of the winning cloud provider
	address cloudProvider;

	/**
	 * @notice Updates model information; Used by cloud provider with the most accurate model
	 *
	 * @dev The below 'string' params should be converted to integers upon deserialisation.
	 * You can then use the respective constructors (EncryptedNumber, PaillierPublicKey)
	 * assuming you are using Python-Paillier.
	 *
	 * @param _firstMoment Raw Paillier ciphertext of the model's first moment
	 * @param _secondMoment Raw Paillier ciphertext of the model's second moment
	 * @param _publicKeyN Part of the public key used for deserialising the raw encrypted moments
	 */
	function update(
		string calldata _firstMoment,
		string calldata _secondMoment,
		string calldata _publicKeyN,
		bytes32 _modelHash
	)
	external
	{
		firstMoment = _firstMoment;
		secondMoment = _secondMoment;
		publicKeyN = _publicKeyN;
		modelHash = _modelHash;
		cloudProvider = msg.sender;
	}
}
