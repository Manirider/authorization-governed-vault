// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract AuthorizationManager {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address public immutable signer;
    mapping(bytes32 => bool) public usedAuthorizations;

    event AuthorizationConsumed(bytes32 indexed authId);

    constructor(address _signer) {
        require(_signer != address(0), "Invalid signer");
        signer = _signer;
    }

    function verifyAuthorization(
        address vault,
        address recipient,
        uint256 amount,
        uint256 chainId,
        bytes32 nonce,
        bytes calldata signature
    ) external returns (bool) {

        bytes32 authId = keccak256(
            abi.encodePacked(
                vault,
                recipient,
                amount,
                chainId,
                nonce
            )
        );

        require(!usedAuthorizations[authId], "Authorization already used");

        bytes32 messageHash = authId.toEthSignedMessageHash();
        address recovered = messageHash.recover(signature);

        require(recovered == signer, "Invalid authorization signature");

        usedAuthorizations[authId] = true;
        emit AuthorizationConsumed(authId);

        return true;
    }
}
