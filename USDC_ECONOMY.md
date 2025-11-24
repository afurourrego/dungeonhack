# 💰 USDC Economy System

## Overview

Dungeon Flip uses **USDC stablecoin** for its reward economy. Players pay a 0.05 USDC entry fee (5 cents) which is automatically distributed across three destinations:

- **70%** → Weekly Rewards Pool (distributed to top 10 players)
- **20%** → Dev Treasury (accumulated, withdrawable by admin)
- **10%** → Marketing Reserve (accumulated, withdrawable by admin)

---

## Entry Fee

### Cost
- **0.05 USDC** (5 cents) per dungeon run
- Equals 50,000 units (USDC has 6 decimals on Sui)

### Payment Flow
```
Player pays 0.05 USDC
       ↓
[fee_distributor.move]
       ↓
├─ 0.035 USDC → Rewards Pool (for weekly distribution)
├─ 0.010 USDC → Dev Balance (accumulates)
└─ 0.005 USDC → Marketing Balance (accumulates)
```

### Automatic Distribution
The fee is split **instantly** when a player enters a dungeon. No manual intervention needed.

**Smart Contracts:**
- [active_run.move:108-114](move/sources/active_run.move#L108-L114) - Entry point
- [fee_distributor.move:68-122](move/sources/fee_distributor.move#L68-L122) - Distribution logic

---

## Weekly Rewards Pool

### Distribution Schedule
- **Frequency:** Every Friday at 4:20 UTC
- **Recipients:** Top 10 players by monsters defeated
- **Pool Size:** Accumulated 70% of all entry fees from the week

### Prize Distribution

| Rank | Percentage | Example (100 USDC pool) |
|------|------------|-------------------------|
| 🥇 1st | 30% | 30 USDC |
| 🥈 2nd | 20% | 20 USDC |
| 🥉 3rd | 15% | 15 USDC |
| 4th | 10% | 10 USDC |
| 5th | 8% | 8 USDC |
| 6th | 6% | 6 USDC |
| 7th | 4% | 4 USDC |
| 8th | 3% | 3 USDC |
| 9th | 2% | 2 USDC |
| 10th | 2% | 2 USDC |
| **Total** | **100%** | **100 USDC** |

### How Distribution Works

**⚠️ IMPORTANT:** Distribution requires an **off-chain script** to be run.

The blockchain contract **cannot** automatically know who won because:
- Game data is tracked off-chain (frontend/database)
- Sui contracts cannot query external data sources

#### Weekly Distribution Process:

1. **Friday 4:20 UTC arrives**
2. **Admin runs off-chain script** that:
   - Queries game database for top 10 players
   - Retrieves their wallet addresses
   - Calls blockchain function with winner list
3. **Smart contract verifies:**
   - ✅ 1 week has passed since last distribution
   - ✅ Exactly 10 unique addresses provided
   - ✅ No duplicate addresses (anti-fraud check)
4. **Funds distributed** automatically to winners

**Code Reference:**
- [rewards_pool.move:116-181](move/sources/rewards_pool.move#L116-L181) - Distribution function

#### Example Off-Chain Script (TypeScript):

```typescript
import { Transaction } from "@mysten/sui/transactions";

async function distributeWeeklyRewards() {
  // 1. Get top 10 players from your database
  const topPlayers = await db.getTop10PlayersByMonsters();
  const winnerAddresses = topPlayers.map(p => p.walletAddress);

  // 2. Call smart contract
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::rewards_pool::try_distribute_weekly_rewards`,
    arguments: [
      tx.object(REWARDS_POOL_ID),
      tx.object(CLOCK_ID),
      tx.pure(winnerAddresses, 'vector<address>'),
    ],
  });

  await signAndExecuteTransaction({ transaction: tx });
  console.log('✅ Weekly rewards distributed!');
}

// Run every Friday at 4:20 UTC
cron.schedule('20 4 * * 5', distributeWeeklyRewards);
```

### Security Considerations

**⚠️ Current Security (Hackathon Phase):**
- Function is publicly callable by anyone
- Duplicate address check prevents basic fraud
- Relies on trusted admin to submit correct winners

**🔒 Recommended for Production:**
1. Add `AdminCap` requirement to restrict access
2. Integrate oracle for automated leaderboard verification
3. Use commit-reveal scheme for trustless distribution
4. Implement slashing for false submissions

**Code Reference:**
- [rewards_pool.move:107-115](move/sources/rewards_pool.move#L107-L115) - Security warning in code

---

## Dev & Marketing Treasuries

### Accumulation
Funds accumulate automatically with each entry fee:
- **Dev Balance**: 20% of each 0.05 USDC fee = 0.01 USDC per entry
- **Marketing Balance**: 10% of each 0.05 USDC fee = 0.005 USDC per entry

### Withdrawal (Admin Only)

Only the wallet that deployed the contracts can withdraw accumulated funds.

#### Check Balances

```typescript
// View current balances
const devBalance = await contract.get_dev_balance(FEE_DISTRIBUTOR_ID);
const marketingBalance = await contract.get_marketing_balance(FEE_DISTRIBUTOR_ID);

console.log(`Dev Treasury: ${devBalance / 1_000_000} USDC`);
console.log(`Marketing: ${marketingBalance / 1_000_000} USDC`);
```

#### Withdraw Dev Funds

```bash
sui client call \
  --package $PACKAGE_ID \
  --module fee_distributor \
  --function withdraw_dev_funds \
  --args $ADMIN_CAP_ID $FEE_DISTRIBUTOR_ID 50000000 0xRECIPIENT_ADDRESS
  # 50000000 = 50 USDC (with 6 decimals)
```

#### Withdraw Marketing Funds

```bash
sui client call \
  --package $PACKAGE_ID \
  --module fee_distributor \
  --function withdraw_marketing_funds \
  --args $ADMIN_CAP_ID $FEE_DISTRIBUTOR_ID 10000000 0xRECIPIENT_ADDRESS
  # 10000000 = 10 USDC
```

### Transparency

All withdrawals emit public events:

```move
struct FundsWithdrawn has copy, drop {
    fund_type: vector<u8>, // "dev" or "marketing"
    amount: u64,
    recipient: address,
}
```

Anyone can view withdrawal history on-chain using Sui Explorer.

---

## USDC Integration

### ⚠️ CRITICAL: Placeholder Type

**Current contracts use a PLACEHOLDER USDC type:**

```move
// ⚠️ This is NOT real USDC!
struct USDC has drop {}
```

**Before deployment, you MUST:**

1. Find USDC package address on Sui testnet/mainnet
2. Replace placeholder with actual import:
   ```move
   use 0xUSCD_PACKAGE_ADDRESS::usdc::USDC;
   ```
3. Remove the `struct USDC has drop {}` line

**Files to update:**
- [active_run.move](move/sources/active_run.move#L10-L19)
- [fee_distributor.move](move/sources/fee_distributor.move#L10-L19)
- [rewards_pool.move](move/sources/rewards_pool.move#L10-L19)

**⚠️ WARNING:** Deploying with placeholder allows anyone to create fake USDC and bypass entry fees!

### Getting Real USDC on Sui

**Testnet:**
- Use USDC faucet (if available)
- Or use testnet bridge
- Address: TBD based on Sui deployment

**Mainnet:**
- Bridge USDC from Ethereum/Polygon using official Sui bridge
- Or use centralized exchange to withdraw directly to Sui

---

## Example Calculations

### Scenario: 100 Players in Week 1

**Entry Fees Collected:**
- 100 players × 0.05 USDC = 5 USDC total

**Automatic Distribution:**
- Rewards Pool: 3.5 USDC (goes to top 10 on Friday)
- Dev Treasury: 1 USDC (accumulated, withdrawable)
- Marketing: 0.5 USDC (accumulated, withdrawable)

**Winner Payouts (Friday 4:20 UTC):**
- 1st place: 1.05 USDC (30% of 3.5 USDC)
- 2nd place: 0.70 USDC
- 3rd place: 0.525 USDC
- 4th-10th: Decreasing amounts
- Total distributed: 3.5 USDC

**Admin Can Withdraw:**
- Dev: 1 USDC anytime
- Marketing: 0.5 USDC anytime

### Scenario: 1,000 Players in Week 2

**Entry Fees:** 50 USDC

**Distribution:**
- Rewards Pool: 35 USDC
  - 1st place wins 10.5 USDC (30%)
  - Top 10 split 35 USDC
- Dev: 10 USDC accumulated
- Marketing: 5 USDC accumulated

---

## Smart Contract Architecture

```
┌─────────────────┐
│  Player Entry   │
│  (0.05 USDC)    │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│   active_run.move       │
│   start_run()           │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│  fee_distributor.move   │
│  distribute_entry_fee() │
└─┬─────────┬────────────┬┘
  │         │            │
  │ 70%     │ 20%        │ 10%
  ↓         ↓            ↓
┌─────┐ ┌─────┐    ┌──────────┐
│Pool │ │ Dev │    │Marketing │
└─────┘ └─────┘    └──────────┘
  │
  │ (Every Friday 4:20 UTC)
  ↓
┌──────────────────────────┐
│  rewards_pool.move       │
│  try_distribute_weekly_  │
│  rewards()               │
└────────┬─────────────────┘
         │
         ↓
   Top 10 Players
   (30%, 20%, 15%...)
```

---

## View Functions

Query current state without gas fees:

```typescript
// Pool info
const poolBalance = await contract.get_pool_balance(POOL_ID);
const currentWeek = await contract.get_current_week(POOL_ID);
const nextDistribution = await contract.get_next_distribution_time(POOL_ID);
const totalDistributed = await contract.get_total_distributed(POOL_ID);

// Treasury balances
const devBalance = await contract.get_dev_balance(FEE_DISTRIBUTOR_ID);
const marketingBalance = await contract.get_marketing_balance(FEE_DISTRIBUTOR_ID);
const totalFeesCollected = await contract.get_total_fees_collected(FEE_DISTRIBUTOR_ID);

// Check if distribution is ready
const isReady = await contract.is_distribution_ready(POOL_ID, CLOCK_ID);
const timeRemaining = await contract.time_until_distribution(POOL_ID, CLOCK_ID);
```

---

## FAQ

**Q: Can I change the entry fee?**
A: Yes, admin can call `update_entry_fee()` in active_run.move

**Q: What happens if no one plays for a week?**
A: Pool stays at 0 USDC, distribution still happens but winners get 0

**Q: Can the same person win multiple ranks?**
A: No, duplicate address check prevents this

**Q: Who pays gas for weekly distribution?**
A: The admin running the off-chain script

**Q: Can players withdraw from the pool manually?**
A: No, only automatic Friday distribution

**Q: What if I deploy with placeholder USDC?**
A: ⚠️ CRITICAL VULNERABILITY - Anyone can mint fake USDC and play for free!

---

## Security Audit Summary

See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for full report.

**Key Findings:**
- ✅ Fee distribution math is correct
- ✅ AdminCap pattern properly restricts withdrawals
- ✅ No reentrancy vulnerabilities (Sui Move protections)
- ⚠️ Placeholder USDC must be replaced before deployment
- ⚠️ Weekly distribution needs admin trust or oracle integration
- ✅ Duplicate address check prevents basic fraud

---

## Related Files

- [fee_distributor.move](move/sources/fee_distributor.move) - Fee split logic
- [rewards_pool.move](move/sources/rewards_pool.move) - Weekly distribution
- [active_run.move](move/sources/active_run.move) - Entry fee collection
- [SECURITY_AUDIT.md](SECURITY_AUDIT.md) - Security analysis
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
