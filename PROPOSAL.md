# Product Proposal

## What is the product, and who uses it?

**Midnight Confidential Sealed-Bid Auction & Private DeFi Agent Protocol** is a zero-knowledge auction and confidential execution layer for high-value, adversarial trading environments — the class of on-chain activity where "everyone can see your bid" is itself the vulnerability.

The protocol has two tightly related surfaces:

1. **Sealed-bid auctions.** Bidders submit a shielded bid (amount, collateral proof, optional strategy metadata) that is computed entirely client-side as a private witness. The chain only ever sees a ZK proof that the bid is valid — properly collateralized, above reserve, correctly formatted — never the bid value itself. At settlement, the contract determines the winner and clearing price using the private witnesses, and reveals only what the auction's rules require (typically: winner identity + clearing price), never the full bid distribution.

2. **Confidential DeFi agent execution.** Autonomous or semi-autonomous trading agents (liquidation bots, market-making agents, RWA settlement agents) submit execution payloads — order size, target price, inventory constraints — as private witnesses as well, so the agent's strategy isn't visible in a public mempool before it executes.

**Who uses it:**
- **Institutional traders and funds** participating in auctions (token launches, RWA allocations, treasury bill-style auctions, liquidation auctions) who don't want their bid size or bidding pattern visible to competitors before or after the auction.
- **Protocol teams** running primary-issuance or liquidation auctions who want provably fair price discovery without leaking participant strategy, which today pushes serious volume off-chain entirely.
- **DeFi agent operators** running automated strategies who need their orders executed without a public mempool giving away the strategy's next move.
- **Auction organizers / DAOs** who need to prove an auction was settled correctly (no rigged outcome) without publishing every bid, which is currently only possible via a trusted centralized auctioneer.

## Why Midnight specifically?

On a transparent chain like Ethereum or Solana, a "sealed-bid" auction is a fiction enforced only by a commit-reveal pattern layered on top of a fully public mempool and ledger — and that fiction breaks down in several concrete ways:

- **Front-running and MEV extraction.** Even a hashed commit reveals bidder addresses, transaction timing, and gas behavior. Searchers and validators can infer bidder intent from commit timing, collateral movements, and historical patterns, then front-run the reveal transaction or sandwich the settlement.
- **Bid sniping and last-look advantage.** Because the mempool is public, sophisticated actors watching for late commits can react within the same block, effectively getting a look at market conditions ineligible bidders don't have.
- **Strategy leakage across rounds.** Even with a reveal phase, once a bid is exposed, an institutional trader's sizing and pricing logic is now public forever — visible to every future counterparty in every future auction, which is a real deterrent to using on-chain auctions for serious volume at all.
- **No middle ground between "fully public" and "fully off-chain."** Transparent chains force protocols to choose between leaking everything or moving auctions off-chain to a trusted centralized operator, which reintroduces the custody and fairness problems blockchains exist to remove.

Midnight's architecture is built specifically to close this gap:

- **Private witnesses.** Bid amount, collateral sizing, and execution payloads are computed and stored client-side, never transmitted to the network in cleartext. The chain only ever receives a zero-knowledge proof that a rule was satisfied (sufficient collateral, valid signature, bid ≥ reserve) — not the underlying values.
- **Dual public/private state in one contract (Compact).** A single Compact contract can hold a public ledger state (auction ID, reserve price, final clearing price, winner) right alongside private witness state (individual bid amounts), without needing a separate off-chain system to bridge the two. That's the specific capability a commit-reveal scheme on a transparent chain has no native equivalent for.
- **Selective disclosure.** The protocol can be designed so the winning bid amount is disclosed only to the auction contract for settlement math, and to the winner themselves — never to competing bidders, and never permanently onto the public ledger unless the auction's own rules call for it.
- **No mempool leakage before settlement.** Because proof generation happens locally and only the proof (not the payload) is broadcast, there's nothing for a searcher to front-run — the "information" that MEV extraction depends on simply isn't on the wire.

## Data Model

| Data Point                              | Type                  | Disclosed To |
|------------------------------------------|-----------------------|--------------|
| Auction ID / metadata (asset, timing)    | Public ledger         | Everyone |
| Reserve price / auction rules            | Public ledger         | Everyone |
| Individual bid amount                    | Private witness       | No one (bidder's device only) |
| Bidder collateral balance                | Private witness       | No one |
| Collateral-sufficiency proof (boolean)    | Public ledger         | Everyone |
| Losing bid amounts (post-settlement)      | Private witness       | No one — never disclosed, even after the auction closes |
| Winning bid amount / clearing price       | Selective disclosure  | Revealed on-chain only if the auction rules require it; otherwise disclosed only to the winner and the settlement contract |
| Winner identity (wallet)                  | Public ledger         | Everyone (post-settlement only) |
| Agent execution payload (order size, target price) | Private witness | No one (agent's local state) |
| Settlement correctness proof              | Public ledger         | Everyone (proves the winner/price was derived correctly from valid bids, without revealing the bids) |

## Mainnet Feasibility

**Technical feasibility is solid.** The core primitive here — a Compact contract with public auction state and private per-bidder witnesses, verified via ZK proof at settlement — is squarely within what Midnight is designed for, and doesn't require anything exotic beyond correct constraint design (proving "this bid is the highest valid bid" without revealing the others is the main cryptographic design problem, and it's tractable with Compact's existing witness/proof model). At the current stage — deployed on Preprod with a live demo and wallet connectivity via Lace — the hard engineering unknowns (wallet integration, proof generation performance in-browser, contract deployment pipeline) are already resolved rather than theoretical.

**What's left to reach Mainnet by Level 6** breaks into three buckets:

1. **Settlement correctness under adversarial conditions** — the auction logic needs to be hardened so a malicious bidder can't submit a malformed private witness that passes the collateral proof but breaks settlement math (e.g., integer edge cases, replay of a prior valid proof). This needs real audit attention, not just happy-path testing, before it should touch real capital.
2. **Real collateral, real assets.** Moving from Preprod test tokens to real value on mainnet means the collateral-sufficiency proof needs to reference a real, liquid asset a user can actually lock — this is more of an integration task (which token/asset standard, how collateral gets locked and released) than a cryptography problem.
3. **User-facing polish for a non-technical bidder.** Sealed-bid auctions are a naturally trust-sensitive UX — bidders need clear confirmation that their bid was accepted and collateralized without seeing a raw proof-generation flow. Given Midnight mainnet is still in its federated "Kūkolu" phase (live and deployable, but younger tooling than a mature EVM chain), budget real time for rough edges in the deployment and indexing pipeline rather than treating this as purely a frontend task.

Given the current Preprod deployment already works end-to-end, a realistic path to Level 6 is: harden settlement logic and get a focused security review → migrate collateral handling to a real mainnet asset → ship a narrow, well-tested MVP (one auction type, e.g. a single-item sealed-bid auction) rather than trying to ship both the auction protocol and the general DeFi agent execution surface at once — the auction alone is enough to demonstrate the core privacy properties and is the safer bet for a real mainnet launch on this timeline.
