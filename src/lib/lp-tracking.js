// lib/lp-tracking.js
import { ensureConnected } from '@/lib/xrpl-helpers';

class LPTracker {
  async getUserLPPositions(userAccount) {
    try {
      const client = await ensureConnected();
      const response = await client.request({
        command: 'account_lines',
        account: userAccount,
        ledger_index: 'validated'
      });
      
      const lines = response.result.lines || [];
      const lpTokens = lines.filter(line => line.currency.startsWith('03') || line.currency.length === 40);
      const positions = await Promise.all(lpTokens.map(token => this.enrichLPPosition(client, userAccount, token)));
      
      return positions.filter(p => p !== null);
    } catch (error) {
      console.error('Error getting LP positions:', error);
      return [];
    }
  }

  async enrichLPPosition(client, userAccount, lpToken) {
    try {
      const ammAccount = lpToken.account;
      const ammInfo = await client.request({ command: 'amm_info', amm_account: ammAccount });
      
      if (!ammInfo.result.amm) return null;
      
      const amm = ammInfo.result.amm;
      const userBalance = parseFloat(lpToken.balance);
      const totalLPTokens = parseFloat(amm.lp_token.value);
      const sharePercentage = (userBalance / totalLPTokens) * 100;
      
      const asset1Amount = this.parseAmount(amm.amount);
      const asset2Amount = this.parseAmount(amm.amount2);
      
      const userAsset1 = (asset1Amount.value * userBalance) / totalLPTokens;
      const userAsset2 = (asset2Amount.value * userBalance) / totalLPTokens;
      
      return {
        ammAccount,
        lpTokenBalance: userBalance,
        sharePercentage,
        asset1: { ...asset1Amount, userAmount: userAsset1 },
        asset2: { ...asset2Amount, userAmount: userAsset2 },
        tradingFee: amm.trading_fee / 1000,
        totalLPTokens
      };
    } catch (error) {
      console.error('Error enriching LP position:', error);
      return null;
    }
  }

  async getPositionSummary(userAccount) {
    // This is placeholder logic for now
    return {
      totalPositions: 0,
      totalValueUSD: 0,
      totalLPTokens: 0,
      averageSharePercentage: 0
    };
  }

  async getRecommendedPools(userAccount) {
    // This is placeholder logic for now
    return {
      recommended: [],
      message: "Recommendation engine coming soon"
    };
  }

  // Replace the getPositionHistory function in lib/lp-tracking.js

  async getPositionHistory(userAccount, ammAccount) {
    try {
      const client = await ensureConnected();
      let allTransactions = [];
      let marker = undefined;
      const searchPages = 5; // How many pages of history to search (5 pages * 200 txs/page = 1000 txs)
      let pagesSearched = 0;

      console.log(`Performing deep history search for ${userAccount}...`);

      // Loop through pages of transaction history
      while (pagesSearched < searchPages) {
        const response = await client.request({
          command: 'account_tx',
          account: userAccount,
          ledger_index_min: -1,
          ledger_index_max: -1,
          limit: 200,
          marker: marker,
        });

        if (response.result.transactions) {
          allTransactions.push(...response.result.transactions);
        }

        if (response.result.marker) {
          marker = response.result.marker;
          pagesSearched++;
        } else {
          break; // No more pages in the account's history
        }
      }

      console.log(`Searched through ${allTransactions.length} total transactions.`);

      // The filtering logic from before remains the same
      const history = allTransactions
        .map(tx => {
          if (!tx.meta || !tx.tx) return null;
          const txType = tx.tx.TransactionType;
          if (txType !== 'AMMDeposit' && txType !== 'AMMWithdraw' && txType !== 'AMMBid') {
            return null;
          }
          const isRelevant = tx.meta.AffectedNodes?.some(node => {
            const ammNode = node.ModifiedNode || node.CreatedNode || node.DeletedNode;
            return ammNode?.LedgerEntryType === 'AMM' && ammNode?.FinalFields?.Account === ammAccount;
          });
          if (!isRelevant) {
            return null;
          }
          return {
            hash: tx.tx.hash,
            type: tx.tx.TransactionType,
            date: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toISOString() : null,
            ledgerIndex: tx.tx.ledger_index,
            lpTokens: tx.meta.delivered_amount || tx.tx.LPTokenOut || tx.tx.LPTokenIn || null
          };
        })
        .filter(item => item !== null);
      
      console.log(`Found ${history.length} relevant AMM transactions.`);
      return history;

    } catch (error) {
      console.error('Error getting position history:', error);
      return [];
    }
  }

  async calculateFeesEarned(userAccount, ammAccount) {
    // This is placeholder logic for now
    return {
      totalFeesUSD: 0,
      estimatedAPY: 0,
      message: "Fee calculation coming soon"
    };
  }

  async calculatePnL(userAccount, ammAccount, depositTx) {
    // This is placeholder logic for now
    return {
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
      message: "Full PnL calculation coming soon"
    };
  }

  parseAmount(amount) {
    if (typeof amount === 'string') {
      return { currency: 'XRP', value: Number(amount) / 1_000_000, issuer: null };
    }
    return { currency: amount.currency, value: Number(amount.value), issuer: amount.issuer };
  }
}

export const lpTracker = new LPTracker(); 