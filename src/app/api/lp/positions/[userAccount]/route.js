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
    try {
      const positions = await this.getUserLPPositions(userAccount);
      
      if (positions.length === 0) {
        return {
          totalPositions: 0,
          totalValueUSD: 0,
          totalLPTokens: 0,
          averageSharePercentage: 0
        };
      }
      
      const totalLPTokens = positions.reduce((sum, pos) => sum + pos.lpTokenBalance, 0);
      const averageSharePercentage = positions.reduce((sum, pos) => sum + pos.sharePercentage, 0) / positions.length;
      
      return {
        totalPositions: positions.length,
        totalValueUSD: 0, // Would need price data to calculate
        totalLPTokens,
        averageSharePercentage
      };
    } catch (error) {
      console.error('Error getting position summary:', error);
      return {
        totalPositions: 0,
        totalValueUSD: 0,
        totalLPTokens: 0,
        averageSharePercentage: 0
      };
    }
  }

  async getRecommendedPools(userAccount) {
    try {
      // This is placeholder logic as noted in your code
      return {
        recommended: [],
        message: "Recommendation engine coming soon"
      };
    } catch (error) {
      console.error('Error getting recommended pools:', error);
      return {
        recommended: [],
        message: "Error fetching recommendations"
      };
    }
  }

  async getPositionHistory(userAccount, ammAccount) {
    try {
        const client = await ensureConnected();
        
        const response = await client.request({
            command: 'account_tx',
            account: userAccount,
            ledger_index_min: -1,
            ledger_index_max: -1,
            limit: 200
        });
        
        const transactions = response.result.transactions || [];
        
        const history = transactions
            .map(tx => {
                if (!tx.meta || !tx.tx) return null;

                const txType = tx.tx.TransactionType;
                if (txType !== 'AMMDeposit' && txType !== 'AMMWithdraw' && txType !== 'AMMBid') {
                    return null;
                }

                const affectedNodes = tx.meta.AffectedNodes || [];
                const isRelevant = affectedNodes.some(node => {
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
        
        return history;

    } catch (error) {
        console.error('Error getting position history:', error);
        return [];
    }
  }

  async calculateFeesEarned(userAccount, ammAccount) {
    // This is placeholder logic as noted in your code
    return {
      totalFeesUSD: 0,
      estimatedAPY: 0,
      message: "Fee calculation coming soon"
    };
  }

  async calculatePnL(userAccount, ammAccount, depositTx) {
    // This is placeholder logic as noted in your code
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