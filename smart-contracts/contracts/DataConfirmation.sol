// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Stores and compares hashes of encrypted data sets between data owners and cloud providers
/// @author Jackson Bullard
contract DataConfirmation {
	// Maps cloud provider to data hash generated by data owner.
	mapping (address => Confirmation[]) public cloudProviderToData;

	// Stores the data hash generated by a data owner and
	// whether the cloud provider's hash has been verified
	struct Confirmation {
		bytes32 dataHash;
		bool verifiedHash;
	}

	/**
	 * @notice For data owners; map hash of encrypted data set to the intended cloud provider.
	 * @param _dataHash The keccak256 hash of the encrypted data set held by the data owner
	 * @param _cloudProvider The address of the cloud provider that the encrypted data set was sent to
	 */
	function mapProviderToData(bytes32 _dataHash, address _cloudProvider) external {
		// TO-DO: Enforce authorized data owners only (agreements are made off-chain)

		Confirmation[] memory mappedHashes = cloudProviderToData[_cloudProvider];
		// Revert the contract call upon a request with the same data hash as another
		for (uint32 i = 0; i < mappedHashes.length; i++) {
			require(mappedHashes[i].dataHash != _dataHash, "Duplicate requests forbidden.");
		}

		Confirmation memory confirmation = Confirmation(_dataHash, false);
		cloudProviderToData[_cloudProvider].push(confirmation);
	}

	/**
	 * @notice For cloud providers; determine whether data was transferred successfully
	 * from data owner to cloud provider by comparing hashes.
	 *
	 * @param _dataHash The keccak256 hash generated by the cloud provider using the received data set
	 */
	function verifyDataHash(bytes32 _dataHash) external {
		Confirmation[] memory mappedHashes = cloudProviderToData[msg.sender];

		for (uint32 i = 0; i < mappedHashes.length; i++) {
			// Compare hashes
			if (mappedHashes[i].dataHash == _dataHash) {
				cloudProviderToData[msg.sender][i].verifiedHash = true;
				break;
			}
		}
	}

	/**
	 * @dev Function mostly for diagnostic purposes
	 * @param _cloudProvider Address of cloud provider
	 * @return Array of confirmations mapped to the given cloud provider address
	 */
	function getDataConfirmations(address _cloudProvider) public view returns (Confirmation[] memory) {
		return cloudProviderToData[_cloudProvider];
	}
}
