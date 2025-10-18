// lib/lp-tracking.js
import { ensureConnected } from './xrpl-helpers';
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
  parseAmount(amount) {
    if (typeof amount === 'string') {
      return { currency: 'XRP', value: Number(amount) / 1_000_000, issuer: null };
    }
    return { currency: amount.currency, value: Number(amount.value), issuer: amount.issuer };
  }
}
export const lpTracker = new LPTracker();