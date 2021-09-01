// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Stores intermediate information used to determine the most successful
 * model as well as the final results from the Trusted Execution Environment (TEE).
 *
 * @author Jackson Bullard
*/
contract Consensus is Ownable {
	// Address of the cloud owner with the (potentially/verified) most accurate model
	address winningCloudProvider;
	// Hash of the model in question
	bytes32 modelHash;
	// True if the TEE confirmed the model's reported accuracy
	bool modelAccuracyVerified;
	
	/**
	 * @notice Stores the candidate most-successful cloud provider and model hash pair.
	 * Only called by the model owner (assuming they deployed the contract).
	 *
	 * @notice If the model is unsuccessful, this function is simply called again with
	 * the next most successful candidate.
	 *
	 * @dev This also sets 'modelAccuracyVerified' to false, signifying this is only a candidate.
	 *
	 * @param _cloudProvider Address of the potentially winner of the training round
	 * @param _modelHash Hash of the supposedly most successful model (trained by _cloudProvider)
	 */
	function claimPotentialWinner(address _cloudProvider, bytes32 _modelHash) external onlyOwner {
		winningCloudProvider = _cloudProvider;
		modelHash = _modelHash;
		modelAccuracyVerified = false;
	}

	/// @notice Flags the model's accuracy as confirmed by the TEE
	function verifyModelAccuracy() external onlyOwner {
		modelAccuracyVerified = true;
	}
}
