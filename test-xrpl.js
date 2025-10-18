// scripts/find-amm-pools.mjs
// Run: node scripts/find-amm-pools.mjs

import { Client } from 'xrpl';

const client = new Client('wss://xrplcluster.com');

async function findAMMPools() {
  try {
    console.log('🔍 Searching for AMM pools on XRPL...\n');
    
    await client.connect();
    console.log('✓ Connected to XRPL\n');
    
    // Method 1: Check known popular trading pair for AMM
    console.log('Method 1: Checking XRP/USD DEX orderbook...');
    
    const bookResponse = await client.request({
      command: 'book_offers',
      taker_gets: { currency: 'XRP' },
      taker_pays: { 
        currency: 'USD', 
        issuer: 'rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq' // GateHub USD
      },
      limit: 50
    });
    
    const accounts = new Set();
    bookResponse.result.offers?.forEach(offer => {
      accounts.add(offer.Account);
    });
    
    console.log(`Found ${accounts.size} unique accounts making offers\n`);
    
    // Test each account to see if it's an AMM
    console.log('Testing accounts for AMM...\n');
    const ammPools = [];
    
    for (const account of accounts) {
      try {
        const ammInfo = await client.request({
          command: 'amm_info',
          amm_account: account
        });
        
        if (ammInfo.result.amm) {
          console.log(`✓ Found AMM: ${account}`);
          
          const amm = ammInfo.result.amm;
          const asset1 = typeof amm.amount === 'string' 
            ? 'XRP' 
            : amm.amount.currency;
          const asset2 = typeof amm.amount2 === 'string' 
            ? 'XRP' 
            : amm.amount2.currency;
          
          console.log(`  Assets: ${asset1}/${asset2}`);
          console.log(`  Trading Fee: ${amm.trading_fee / 1000}%\n`);
          
          ammPools.push({
            account,
            asset1,
            asset2,
            tradingFee: amm.trading_fee / 1000
          });
        }
      } catch (err) {
        // Not an AMM, skip silently
      }
    }
    
    // Method 2: Check recent AMM transactions
    console.log('\nMethod 2: Checking recent ledgers for AMM activity...');
    
    const ledgerResponse = await client.request({
      command: 'ledger',
      ledger_index: 'validated',
      transactions: true,
      expand: true
    });
    
    const ammTxTypes = ['AMMCreate', 'AMMDeposit', 'AMMWithdraw'];
    const transactions = ledgerResponse.result.ledger.transactions || [];
    
    for (const tx of transactions) {
      if (ammTxTypes.includes(tx.TransactionType)) {
        console.log(`Found ${tx.TransactionType} transaction`);
        
        // Extract AMM account from metadata
        if (tx.meta?.AffectedNodes) {
          for (const node of tx.meta.AffectedNodes) {
            const entry = node.CreatedNode || node.ModifiedNode;
            if (entry?.LedgerEntryType === 'AMM') {
              const account = entry.NewFields?.Account || entry.FinalFields?.Account;
              if (account && !ammPools.some(p => p.account === account)) {
                console.log(`  AMM Account: ${account}`);
                ammPools.push({ account, source: 'transaction' });
              }
            }
          }
        }
      }
    }
    
    // Output results
    console.log('\n' + '='.repeat(60));
    console.log('🎉 FOUND AMM POOLS:\n');
    
    if (ammPools.length === 0) {
      console.log('❌ No AMM pools found.');
      console.log('\nTrying well-known test accounts...\n');
      
      // Try some test accounts
      const testAccounts = [
        'rH438mFaxXAQnSKP6B8Z7kYdHz8ewL5p4g',
        'rJvs4UXCyZXrNNc8Wqbk8XgB7kJ1mZ5WJ3',
        'rN7n7otQDd6FczFgLdlqtyMVrn3HMfXpNn'
      ];
      
      for (const testAccount of testAccounts) {
        try {
          const ammInfo = await client.request({
            command: 'amm_info',
            amm_account: testAccount
          });
          
          if (ammInfo.result.amm) {
            console.log(`✓ Test account ${testAccount} is an AMM`);
            ammPools.push({ account: testAccount, source: 'test' });
          }
        } catch (err) {
          console.log(`✗ ${testAccount} - ${err.data?.error || 'not an AMM'}`);
        }
      }
    }
    
    if (ammPools.length > 0) {
      console.log('\nCopy these working AMM accounts:\n');
      ammPools.forEach((pool, i) => {
        console.log(`${i + 1}. ${pool.account}`);
        if (pool.asset1 && pool.asset2) {
          console.log(`   ${pool.asset1}/${pool.asset2} - Fee: ${pool.tradingFee}%`);
        }
      });
      
      console.log('\n📝 Add these to your lib/amm-pools.js:');
      console.log('\nexport const KNOWN_AMM_POOLS = [');
      ammPools.forEach(pool => {
        console.log(`  {`);
        console.log(`    account: '${pool.account}',`);
        console.log(`    name: '${pool.asset1 || 'Unknown'}/${pool.asset2 || 'Unknown'} Pool',`);
        console.log(`  },`);
      });
      console.log('];');
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.disconnect();
    console.log('\n✓ Disconnected');
  }
}

findAMMPools();