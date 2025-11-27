# 💰 ONECHAIN Economy System

## Overview

Dungeon Flip uses **Onechain native token** for its reward economy. Players pay a 0.01 OCT entry fee per run which is automatically distributed across three destinations:

- **70%** → Weekly Rewards Pool (distributed to top 10 players)
- **20%** → Dev Treasury (accumulated, withdrawable by admin)
- **10%** → Marketing Reserve (accumulated, withdrawable by admin)

---

## Entry Fee

### Cost
- **0.01 OCT** per dungeon run


### Payment Flow
```
Player pays 0.01 OCT
       ↓
[fee_distributor.move]
       ↓
├─ 0.007 OCT → Rewards Pool (for weekly distribution)
├─ 0.002 OCT → Dev Balance (accumulates)
└─ 0.001 OCT → Marketing Balance (accumulates)
```

### Automatic Distribution
The fee is split **instantly** when a player enters a dungeon. No manual intervention needed.

**Smart Contracts:**
- [active_run.move:82-130](move/sources/active_run.move#L82-L130) - Entry point
- [fee_distributor.move:65-119](move/sources/fee_distributor.move#L65-L119) - Distribution logic

---

## Weekly Rewards Pool

### Distribution Schedule
- **Frequency:** Every week (7 days after first pool deposit)
- **Recipients:** Top 10 players by gems collected
- **Pool Size:** Accumulated 70% of all entry fees from the week

### Prize Distribution

| Rank | Percentage | Example (100 OCT pool) |
|------|------------|-----------------------|
| 🥇 1st | 30% | 30.0 OCT |
| 🥈 2nd | 20% | 20.0 OCT |
| 🥉 3rd | 15% | 15.0 OCT |
| 4th | 10% | 10.0 OCT |
| 5th | 8% | 8.0 OCT |
| 6th | 6% | 0.6.0 OCT |
| 7th | 4% | 0.4.0 OCT |
| 8th | 3% | 0.3.0 OCT |
| 9th | 2% | 0.2.0 OCT |
| 10th | 2% | 0.2.0 OCT |
| **Total** | **100%** | **100 OCT** |

### How Distribution Works

**⚠️ IMPORTANT:** Distribution requires an **off-chain script** to be run by the admin.

The blockchain contract **cannot** automatically know who won because:
- Game data is tracked off-chain (frontend/database)
- Sui contracts cannot query external data sources

#### Weekly Distribution Process:

1. **1 week passes since last distribution**
2. **Admin runs off-chain script** that:
   - Queries game database for top 10 players by gems collected
   - Retrieves their wallet addresses
   - Calls blockchain function with winner list
3. **Smart contract verifies:**
   - ✅ 1 week has passed since last distribution
   - ✅ Exactly 10 unique addresses provided
   - ✅ No duplicate addresses (anti-fraud check)
4. **Funds distributed** automatically to winners

**Code Reference:**
- [rewards_pool.move:116-192](move/sources/rewards_pool.move#L116-L192) - Distribution function

#### Example Off-Chain Script (TypeScript):

```typescript
import { Transaction } from "@mysten/sui/transactions";

async function distributeWeeklyRewards() {
  // 1. Get top 10 players from your database
  const topPlayers = await db.getTop10PlayersByGems();
  const winnerAddresses = topPlayers.map(p => p.walletAddress);

  // 2. Call smart contract
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::rewards_pool::try_distribute_weekly_rewards`,
    arguments: [
      tx.object(ADMIN_CAP_ID),
      tx.object(REWARDS_POOL_ID),
      tx.object(CLOCK_ID),
      tx.pure(winnerAddresses, 'vector<address>'),
    ],
  });

  await signAndExecuteTransaction({ transaction: tx });
  console.log('✅ Weekly rewards distributed!');
}

// Run manually or schedule with cron
distributeWeeklyRewards();
```

### Security Considerations

**🔒 Current Security:**
- Function requires `AdminCap` to restrict access
- Duplicate address check prevents basic fraud
- Only deployer can trigger distribution

**✅ Security Features:**
1. Admin-only access via AdminCap
2. Time-lock: Cannot distribute before 1 week passes
3. Duplicate winner check prevents fraud
4. All distributions emit public events for transparency

**Code Reference:**
- [rewards_pool.move:108-115](move/sources/rewards_pool.move#L108-L115) - Security documentation in code

---

## Dev & Marketing Treasuries

### Accumulation
Funds accumulate automatically with each entry fee:
- **Dev Balance**: 20% of each 0.01 OCT fee = 0.002 OCT per entry
- **Marketing Balance**: 10% of each 0.01 OCT fee = 0.001 OCT per entry

### Withdrawal (Admin Only)

Only the wallet that deployed the contracts (holds AdminCap) can withdraw accumulated funds.

#### Check Balances

```typescript
// View current balances
const devBalance = await contract.get_dev_balance(FEE_DISTRIBUTOR_ID);
const marketingBalance = await contract.get_marketing_balance(FEE_DISTRIBUTOR_ID);

console.log(`Dev Treasury: ${devBalance / 1_000_000_000} SUI`);
console.log(`Marketing: ${marketingBalance / 1_000_000_000} SUI`);
```

#### Withdraw Dev Funds

```bash
sui client call \
  --package $PACKAGE_ID \
  --module fee_distributor \
  --function withdraw_dev_funds \
  --args $ADMIN_CAP_ID $FEE_DISTRIBUTOR_ID 1000000000 0xRECIPIENT_ADDRESS
  # 1000000000 = 1 SUI (with 9 decimals)
```

#### Withdraw Marketing Funds

```bash
sui client call \
  --package $PACKAGE_ID \
  --module fee_distributor \
  --function withdraw_marketing_funds \
  --args $ADMIN_CAP_ID $FEE_DISTRIBUTOR_ID 500000000 0xRECIPIENT_ADDRESS
  # 500000000 = 0.5 SUI
```

### Transparency

All withdrawals emit public events:

```move
public struct FundsWithdrawn has copy, drop {
    fund_type: vector<u8>, // "dev" or "marketing"
    amount: u64,
    recipient: address,
}
```

Anyone can view withdrawal history on-chain using Sui Explorer.

---

## Example Calculations

### Scenario: 1000 runs in Week 1

**Entry Fees Collected:**
- 1000 runs × 0.01 OCT = 10 OCT total

**Automatic Distribution:**
- Rewards Pool: 7 OCT (goes to top 10 players after 1 week)
- Dev Treasury: 2 OCT (accumulated, withdrawable)
- Marketing: 1 OCT (accumulated, withdrawable)

**Winner Payouts (After 1 Week):**
- 1st place: 2.1 OCT (30% of 7 OCT)
- 2nd place: 1.4 OCT
- 3rd place: 1.05 OCT
- 4th-10th: Decreasing amounts
- Total distributed: 7 OCT

**Admin Can Withdraw:**
- Dev: 2 OCT anytime
- Marketing: 1 OCT anytime

### Scenario: 10,000 runs in Week 2

**Entry Fees:** 100 OCT

**Distribution:**
- Rewards Pool: 70 OCT
  - 1st place wins 21 OCT (30%)
  - Top 10 split 70 OCT
- Dev: 20 OCT accumulated
- Marketing: 10 OCT accumulated

---

## Smart Contract Architecture

```
┌─────────────────┐
│  Player Entry   │
│   (0.01 OCT)    │
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
  │ (Every 7 days, admin-triggered)
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
A: Pool stays at 0 OCT, distribution still happens but winners get 0

**Q: Can the same person win multiple ranks?**
A: No, duplicate address check prevents this

**Q: Who pays gas for weekly distribution?**
A: The admin running the off-chain script

**Q: Can players withdraw from the pool manually?**
A: No, only automatic weekly distribution via admin

**Q: What if admin doesn't distribute?**
A: Pool accumulates until next distribution. Admin is trusted for hackathon phase.

---

## Security Audit Summary

See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for full report.

**Key Findings:**
- ✅ Fee distribution math is correct (70/20/10 split)
- ✅ AdminCap pattern properly restricts withdrawals
- ✅ No reentrancy vulnerabilities (Sui Move protections)
- ✅ OCT native token integration is secure
- ✅ Weekly distribution requires admin trust (acceptable for hackathon)
- ✅ Duplicate address check prevents basic fraud
- ✅ Time-lock prevents premature distributions

---

## Related Files

- [fee_distributor.move](move/sources/fee_distributor.move) - Fee split logic
- [rewards_pool.move](move/sources/rewards_pool.move) - Weekly distribution
- [active_run.move](move/sources/active_run.move) - Entry fee collection
- [SECURITY_AUDIT.md](SECURITY_AUDIT.md) - Security analysis
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
