# Private OTC Agent Desk on Midnight
![CI](https://github.com/avishrakshe/Private-OTC-Agent-Desk-On-Midnight-/actions/workflows/ci.yml/badge.svg)

> A Midnight Network application for confidential zero-knowledge OTC desk transactions and smart contract interactions.

## Live Demo & Video Demonstration
- **Live dApp:** [https://mn-demo.vercel.app](https://mn-demo.vercel.app)
- **Demo Video:** [https://youtu.be/Ysz9uTXDtuY?si=oebajrsBWnGRnupm](https://youtu.be/Ysz9uTXDtuY?si=oebajrsBWnGRnupm)

## Contract Address
| Network  | Address                                                          |
|----------|------------------------------------------------------------------|
| Preprod  | `02005a3059efee9eeedc1f7ca80004e0e5ea4e8bc1bfaad747e92bcbbbb4cb1a` |
| Preview  | `7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1` |

## What This Does
This application provides a modern React + Vite dashboard to interact with the deployed `hello-world` and `counter` smart contracts on the Midnight Network:
1. **Lace Wallet Integration:** Connects to the Lace Beta Wallet to fetch public unshielded addresses and private shielded Bech32m addresses.
2. **Client-Side Zero-Knowledge Proving:** Generates ZK proofs directly from the browser using `@midnight-ntwrk/midnight-js-http-client-proof-provider` pointing to local/network proof servers.
3. **Smart Contract Interactivity:** Executes the `storeMessage` circuit to update on-chain ledger state, balanced and signed via the connected Lace wallet.

## Privacy Model
- **PUBLIC:** The updated `message` state cell stored on the shared Midnight public ledger.
- **PRIVATE:** The `customMessage` string passed locally on the user's browser as a ZK private witness.
- **PROVED without revealing:** The state transition validity is mathematically proven without exposing the unhashed secret witness string or private key to network nodes.

## Privacy Claim
What an on-chain observer sees vs cannot see:
- **Observer CAN see:** The public contract address (`7f06...2ae1`), the verified transaction ID, and the public state transition.
- **Observer CANNOT see:** The user's local private witness data (`customMessage`), shielded secret keys, or private input payload.

## Tech Stack
- **Frontend Core:** React 19, Vite, TypeScript
- **Styling:** Custom CSS (DeFi Agents White Glassmorphism Theme)
- **Midnight SDK & Libraries:**
  - `@midnight-ntwrk/dapp-connector-api` — Integrates browser injected Lace wallet
  - `@midnight-ntwrk/midnight-js-contracts` — Manages smart contract handles & transactions
  - `@midnight-ntwrk/midnight-js-fetch-zk-config-provider` — Downloads ZK proving keys (`.prover`, `.zkir`)
  - `@midnight-ntwrk/midnight-js-http-client-proof-provider` — Client-side proof generation engine
- **Testing:** Node.js native test runner (`node:test`) + `tsx`

## Prerequisites
- **Node.js:** `v22.0.0` or higher
- **Browser Extension:** **Lace Beta Wallet** configured for Preview / Preprod Testnet
- **Testnet Funds:** Wallet funded with `tNIGHT` for gas and `DUST` for private state operations

## Setup & Run Locally

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/avishrakshe/Full-Moon-Midnight.git
   cd mn-demo
   npm install
   ```

2. Start local development server:
   ```bash
   npm run dev
   ```

3. Build production bundle:
   ```bash
   npm run build
   ```

## Run Tests
```bash
npm test
```

Running `npm test` executes the Level 3 unit test suite in `tests/counter.test.ts`, verifying circuit logic, ledger state transitions, and private witness isolation.

## CI/CD
The project features an automated GitHub Actions CI pipeline configured in `.github/workflows/ci.yml`. On every `push` or `pull_request` to `master` or `main`:
1. Checks out the repository.
2. Sets up Node.js v22.
3. Installs dependencies (`npm ci`).
4. Verifies presence of compiled ZK contract assets.
5. Runs the Level 3 unit test suite (`npm test`).
6. Verifies clean production build (`npm run build`).

## Product Proposal
See [PROPOSAL.md](PROPOSAL.md)
