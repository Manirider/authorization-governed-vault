
pragma solidity ^0.8.20;

/**
 * @notice Minimal interface for AuthorizationManager
 * Vault trusts ONLY this interface
 */
interface IAuthorizationManager {
    function verifyAuthorization(
        address vault,
        address recipient,
        uint256 amount,
        uint256 chainId,
        bytes32 nonce,
        bytes calldata signature
    ) external returns (bool);
}

/**
 * @title SecureVault
 * @notice Holds ETH and executes authorized withdrawals
 */
contract SecureVault {
    /// @dev Authorization manager contract
    IAuthorizationManager public immutable authManager;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);

    constructor(address _authManager) {
        require(_authManager != address(0), "Invalid auth manager");
        authManager = IAuthorizationManager(_authManager);
    }

    /**
     * @notice Accept ETH deposits from anyone
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw ETH using a valid authorization
     */
    function withdraw(
        address recipient,
        uint256 amount,
        bytes32 nonce,
        bytes calldata signature
    ) external {


        require(address(this).balance >= amount, "Insufficient vault balance");

        
        bool authorized = authManager.verifyAuthorization(
            address(this),
            recipient,
            amount,
            block.chainid,
            nonce,
            signature
        );

        require(authorized, "Authorization failed");

       
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "ETH transfer failed");

        emit Withdrawal(recipient, amount);
    }
}
