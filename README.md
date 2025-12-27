**🔐 Authorization-Governed Vault System**

Controlled Asset Withdrawals with Explicit On-Chain Authorization

## Overview

This project implements a secure, authorization-governed vault system designed to control asset withdrawals through an explicit, verifiable permission flow.

The core idea is simple but powerful:
asset custody and permission validation are deliberately separated into two independent smart contracts.

This mirrors how real-world decentralized protocols reduce risk, clarify trust boundaries, and prevent unintended side effects during execution.

The system guarantees that:

Funds can only be withdrawn after a valid authorization is verified on-chain

Each authorization can be used exactly once

State transitions remain correct even under adversarial or unexpected call patterns

### High-Level Architecture

The system consists of two on-chain components, each with a single, well-defined responsibility.

**1. SecureVault (Asset Custody)**

Holds native blockchain currency (ETH)

Accepts deposits from any address

Executes withdrawals only after authorization approval

Does not perform signature verification or cryptographic checks

**2. AuthorizationManager (Permission Authority)**

Verifies off-chain generated authorizations

Validates cryptographic signatures

Enforces strict one-time usage (replay protection)

Acts as the sole source of truth for withdrawal permissions

Off-chain Signer
      ↓
AuthorizationManager  → validates & consumes authorization
      ↓
SecureVault            → transfers funds


This separation ensures that no single contract has unilateral control over both funds and permissions.

### Authorization Model

Withdrawal permissions are generated off-chain and signed by a trusted authority.

Each authorization is tightly scoped and bound to the following parameters:

Vault contract address

Recipient address

Withdrawal amount

Chain ID (network-specific binding)

Unique nonce (one-time identifier)

**Deterministic Authorization Construction**
keccak256(
  abi.encodePacked(
    vaultAddress,
    recipient,
    amount,
    chainId,
    nonce
  )
)


This construction ensures that an authorization:
Cannot be replayed across vaults
Cannot be reused on another network
Cannot be modified to change amount or recipient

## **Replay Protection & State Safety**

Replay protection is enforced directly on-chain inside the AuthorizationManager.

mapping(bytes32 => bool) public usedAuthorizations;

## Guarantees

Each authorization hash can be consumed only once

Any reuse attempt reverts deterministically

Authorization state is updated before value transfer occurs

Cross-contract calls cannot result in duplicated effects

This design preserves correctness even if calls occur out of order or are repeated.

## Vault Execution Flow

ETH is deposited into the vault

A withdrawal request is submitted with authorization data

The vault requests validation from the AuthorizationManager

Authorization is verified and marked as consumed

Funds are transferred to the recipient

Events are emitted for observability

At no point does the vault assume trust in the caller or validate signatures itself.

## Security Invariants

The system maintains the following invariants under all execution paths:

One authorization → one withdrawal → one state transition

Vault balance can never become negative

Unauthorized callers cannot influence privileged state changes

Authorization reuse is impossible

Initialization logic executes exactly once

External calls occur only after critical state updates

These invariants hold even under composed or adversarial execution scenarios.

### Observability

All critical actions emit events:

Deposit — ETH deposited into the vault
AuthorizationConsumed — authorization successfully used
Withdrawal — ETH transferred to recipient

Failed withdrawal attempts revert cleanly and deterministically without partial side effects.

### Local Deployment (Docker)
Requirements

Docker

Docker Compose

Run the system
docker-compose up --build


->This command will:

Start a local Hardhat blockchain
Compile all contracts
Deploy the AuthorizationManager
Deploy the SecureVault with correct wiring
Expose the JSON-RPC endpoint at http://localhost:8545

Deployed contract addresses are printed to the logs for easy inspection.

### Validation & Testing Approach

The system was validated by:

Attempting authorization reuse (correctly reverted)

Submitting unauthorized withdrawal requests (reverted)

Reordering calls to test invariant preservation

Testing JSON-RPC on Windows (PowerShell)

PowerShell aliases curl to Invoke-WebRequest, which does not support Unix-style flags (-X, -H, -d).

**Use PowerShell-native commands instead:**

Invoke-RestMethod `
  -Uri http://localhost:8545 `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "jsonrpc":"2.0",
    "method":"eth_chainId",
    "params":[],
    "id":1
  }'


Expected output (Hardhat local network):

0x7a69


This confirms that the JSON-RPC interface is operational.



### Assumptions & Limitations

A single trusted off-chain signer is assumed

The implementation focuses on native ETH transfers

ERC-20 extensions are possible but intentionally omitted

Gas costs vary depending on network and execution context

### Outcome

Deposits are accepted and tracked correctly

Withdrawals execute only when properly authorized

Authorizations cannot be replayed

State transitions occur exactly once

The system is reproducible, observable, and secure by design

### Closing Notes

This project demonstrates secure multi-contract design, explicit authorization enforcement, and invariant-driven reasoning consistent with production-grade Web3 systems.

The emphasis is on correctness, clarity, and defensive engineering rather than convenience or implicit trust.

## Author :-

Manikanta Suryasai

Aiml & Block Chain engineer and developer 


