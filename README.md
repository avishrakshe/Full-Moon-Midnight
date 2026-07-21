# mn-demo

A Midnight Network smart contract scaffolded with create-mn-app.

## Quick start

Requirements: Node 22, Docker (with Compose v2), and the Compact compiler at the version pinned in `.compact-version` at the create-mn-app repo root (the version this project was scaffolded against).

```bash
npm install
npm run setup
npm run test:e2e
```

`npm run setup` runs end-to-end with no prompts:

1. `docker compose up -d --wait` — starts a local Midnight devnet (node, indexer, proof-server) and blocks until all three pass their healthchecks.
2. `npm run compile` — compiles `contracts/hello-world.compact` to `contracts/managed/hello-world/`.
3. `npm run deploy` — derives the genesis-seed wallet (NIGHT pre-minted), registers UTXOs for DUST generation, deploys the contract, writes `.midnight-state.json`.

`npm run test:e2e` reconnects to the deployed contract and reads its ledger state. Exits 0 if the contract is live and indexable.

## Local devnet

The project ships its own devnet via `docker-compose.yml`:

| Service        | Port | Purpose                                         |
| -------------- | ---- | ----------------------------------------------- |
| `node`         | 9944 | Midnight node, `dev` chain preset               |
| `indexer`      | 8088 | GraphQL indexer for chain state                 |
| `proof-server` | 6300 | Generates ZK proofs for contract transactions   |

State lives in container-managed volumes. Tear everything down with:

```bash
docker compose down -v
```

That removes all containers, networks, and volumes. The next `npm run setup` starts from a clean slate.

## ⚠️ LOCAL DEVNET ONLY

The deploy script uses a well-known genesis seed (`0000…0001`) so the
pre-minted NIGHT in the `dev` chain preset is immediately available. **Do
not use this seed against Preprod, mainnet, or any environment that
handles real value** — anyone running this devnet has full access to
funds at this seed.

## Networks

This DApp supports three networks:

| Network | When to use | Default? |
|---|---|---|
| `undeployed` | Local devnet bundled in `docker-compose.yml`. Genesis seed is hardcoded; no funding needed. | yes |
| `preview` | Public preview testnet. Faucet at `https://midnight-tmnight-preview.nethermind.dev`. |  |
| `preprod` | Public preprod testnet. Faucet at `https://midnight-tmnight-preprod.nethermind.dev`. |  |

The active network is **sticky**: whichever network you last interacted
with stays active until you switch. Any command run with `--network <name>`
also sets that network active for subsequent commands. The default on a
fresh project is `undeployed` (local devnet).

```sh
npm run setup -- --network preview   # runs on preview AND makes it active
npm run cli                          # still uses preview
npm run check-balance                # still uses preview
```

You can also switch without running anything else:

```sh
npm run network preview         # active network is now preview
npm run network                 # prints current active network
npm run network undeployed      # switch back to local devnet
```

### How wallets work across networks

- `undeployed` uses a hardcoded genesis seed. Local devnet pre-funds it.
- `preview` and `preprod` generate a fresh seed on first use and store it
  in `.midnight-state.json` (gitignored). The seed survives switching
  networks — switch back later and your funded wallet returns.
- **Back up your seed** if you fund a public-network wallet you care
  about. Open `.midnight-state.json` and copy the relevant
  `wallets.<network>.seed` value to a safe place.

### Funding a public-network wallet

On the first run with `--network preview` (or `preprod`):

1. `setup` will print your wallet address and the faucet URL.
2. Open the faucet URL, paste the address, request tNIGHT.
3. `setup` polls the wallet balance every 10 s and continues automatically
   once funds arrive.
4. The default poll budget is 10 minutes. Override with
   `MIDNIGHT_FAUCET_TIMEOUT_MS=1800000` (30 min) for unattended runs.

If the faucet is slow or the script times out, your seed is preserved.
Re-run `npm run setup -- --network preview` once the funds land.

### Environment overrides

These env vars override the active network's config (no per-network
suffix — they apply to whichever network is active for the run):

| Variable | Effect |
|---|---|
| `MIDNIGHT_WALLET_SEED` | Use this seed instead of generating/persisting one. Useful for CI with a pre-funded wallet. |
| `MIDNIGHT_INDEXER_URL` | Override the indexer GraphQL URL. |
| `MIDNIGHT_INDEXER_WS_URL` | Override the indexer WS URL. |
| `MIDNIGHT_NODE_URL` | Override the node RPC URL. |
| `MIDNIGHT_FAUCET_URL` | Override the faucet URL printed during setup. |
| `MIDNIGHT_PROOF_SERVER_URL` | Override the proof server URL — set to a public proof server (e.g. `https://lace-proof-pub.preview.midnight.network`) to skip running one locally. |
| `MIDNIGHT_FAUCET_TIMEOUT_MS` | Faucet poll budget in milliseconds (default 600000 = 10 min). |

By default all networks use the **local** proof server. Public proof
servers exist (see the env override above) but the local default keeps
your witness data on your machine and avoids depending on a remote
service for the deploy hot path.

### Switching back to local devnet

```sh
npm run network undeployed     # or: npm run setup -- --network undeployed
```

Your preview/preprod wallet seeds and deploy addresses stay in
`.midnight-state.json`. Switch back later, and they're still there.

### Wallet sync cache

After each `deploy`, `cli`, or `check-balance` run, the scripts serialize the
wallet's synced state to `.midnight-wallet-state/<network>/` (gitignored).
The next run on the same network restores from that snapshot and only catches
up to the latest block instead of replaying from genesis — meaningful on
`preview` / `preprod` where a from-seed sync takes minutes.

If the cache is stale or corrupt (e.g. after an SDK upgrade with an
incompatible state format) the wallet falls back to a fresh from-seed sync
with a one-line warning. `npm run clean` removes the cache along with other
generated state.

## Available scripts

| Script                  | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `npm run setup`         | One-shot: start devnet, compile, deploy.                       |
| `npm run compile`       | Compile the Compact contract.                                  |
| `npm run deploy`        | Deploy the compiled contract (requires devnet up + compiled).  |
| `npm run cli`           | Interactive CLI to call circuits on the deployed contract.     |
| `npm run check-balance` | Print the genesis-seed wallet's NIGHT and DUST balances.       |
| `npm run test:e2e`      | Smoke + read-back check against the deployed contract.         |
| `npm run clean`         | Remove `contracts/managed/`, `.midnight-state.json`, and `.midnight-wallet-state/`. |
| `npm run proof-server:start` / `:stop` | Compose lifecycle for just the proof-server service. |

## Project structure

```
mn-demo/
├── contracts/
│   └── hello-world.compact     # Compact source
├── scripts/
│   └── e2e-check.ts            # smoke + read-back
├── src/
│   ├── network.ts              # network selection + state file management
│   ├── wallet.ts               # wallet construction + sync-state cache
│   ├── setup.ts                # orchestrator for `npm run setup`
│   ├── deploy.ts               # deploy the contract
│   ├── cli.ts                  # interact with deployed contract
│   └── check-balance.ts        # NIGHT / DUST balance
├── docker-compose.yml          # node + indexer + proof-server
├── .midnight-state.json        # written by deploy (gitignored)
├── .midnight-wallet-state/     # serialized sync state per network (gitignored)
├── package.json
└── tsconfig.json
```

## Compact compiler version

`.compact-version` at the create-mn-app repo root pinned the compiler
version this project was scaffolded against. To upgrade your local
compiler to that version:

```bash
compact update <version>
compact use <version>
```

---

## 💡 Initial Product Idea: Confidential Sealed-Bid Auction

A Zero-Knowledge Sealed-Bid Auction platform on Midnight where bidders can submit cryptographically shielded bids for high-value items. The smart contract validates that each bid is backed by sufficient collateral and is within allowed bounds, without revealing the individual bid amounts to any third party or even the auctioneer. Once the bidding period ends, a zero-knowledge proof verifies the winning bid and reveals only the winner's identity and the final transaction clearing price, preserving absolute bidding strategy privacy for all participants.

## 🔒 Public State vs. Private Witness in Midnight

On the Midnight blockchain, smart contracts split execution between the public ledger and local client machines to achieve data privacy:

- **Public State:** This is the shared ledger state that is visible to everyone on the network (similar to public blockchains like Cardano or Ethereum). For example, in our `hello-world` contract, the `message` field is stored as a public state cell on-chain. Anyone can query the indexer to see the current value of the public message.
- **Private Witness (Private State & Secret Input):** This is data that is kept local to the user's client machine and is never revealed to the public ledger. When executing a circuit, the user passes secret inputs (like private keys, private coin states, or private contract inputs) as *witnesses*. The Compact compiler uses these witnesses locally on the user's machine to generate a zero-knowledge proof (ZK proof) of the state transition. Only the ZK proof is sent to the network. The validator verifies the proof without ever seeing the underlying private witness data.

---

# 🌔 Level 2: Web Frontend & Browser ZK Proving

This section details the web frontend integration and wallet connection for Level 2 of the Midnight Builder Challenge.

## 🔗 Live Demo
Live deployment URL: [https://full-moon-midnight.vercel.app](https://full-moon-midnight.vercel.app)

## 📋 Deployed Contract Addresses
| Network | Contract Address |
| --- | --- |
| **Preview** | `7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1` |
| **Preprod** | `7f0643b12f38f45c7fef2e125543466ee7b8ea8a615800cd7ec0b0bd71127ae1` |

## 🛠️ What This Does
This frontend application provides a React + Vite dashboard to interact with the deployed `hello-world` contract:
1. **Lace Wallet Connection:** Initiates connection to the Lace Beta Wallet, retrieves public unshielded addresses, and private shielded addresses.
2. **Local Zero-Knowledge Proving:** Generates zero-knowledge proofs directly in the web browser using `@midnight-ntwrk/midnight-js-http-client-proof-provider` pointing to the public preprod proof server.
3. **Smart Contract Interactivity:** Calls the `storeMessage` circuit to update the on-chain message state, balanced and signed using the connected Lace wallet.

## 🔒 Privacy Model
- **Public State:** The smart contract's `message` ledger cell is stored on-chain. Anyone can query the indexer and read the current value.
- **Private Witness:** The `customMessage` text string is supplied locally on the user's browser as a private witness. The zero-knowledge proof validates that a valid state transition was computed locally without ever sending the message text directly to validators. Only the verified state update is published.

## 🛡️ Privacy Claim: "Proved without revealing your input"
This label in our UI denotes that the user's secret message remains completely private. The browser proof provider compiles the ZK proof locally on the client side. The validators on the Midnight Network verify the validity of the state update using only the generated proof, ensuring that the raw secret input is never exposed to the public blockchain or any third-party node.

## 💻 Tech Stack
- **Frontend Core:** React, Vite, TypeScript
- **Styling:** Vanilla CSS (Glassmorphism Dark-Mode theme)
- **Libraries & SDKs:**
  - `@midnight-ntwrk/dapp-connector-api` — Integrates browser injected wallets (Lace)
  - `@midnight-ntwrk/midnight-js-contracts` — Handles smart contract bindings
  - `@midnight-ntwrk/midnight-js-fetch-zk-config-provider` — Fetches ZK compile artifacts
  - `@midnight-ntwrk/midnight-js-http-client-proof-provider` — Client-side proof generation

## 📋 Prerequisites
- **Lace Beta Wallet** browser extension installed and configured for the **Preprod** network.
- Wallet must be funded with **tNIGHT** (for transaction gas fees) and **DUST** (for registering UTXOs/private data).

## 🚀 Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start local Vite development server:
   ```bash
   npm run dev
   ```
3. Build optimized static assets for production:
   ```bash
   npm run build
   ```

## 🎥 Demo Video
Placeholder for the walk-through recording: [Watch Level 2 Demo Video](https://youtube.com/placeholder-demo)


