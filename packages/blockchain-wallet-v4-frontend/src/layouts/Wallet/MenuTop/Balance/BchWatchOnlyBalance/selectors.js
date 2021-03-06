import { selectors } from 'data'
import { createDeepEqualSelector } from 'services/ReselectHelper'
import { add, reduce, lift, path } from 'ramda'
import { Remote } from 'blockchain-wallet-v4/src'

export const getData = createDeepEqualSelector(
  [
    selectors.core.kvStore.bch.getUnspendableContext,
    selectors.core.data.bch.getAddresses
  ],
  (context, addressesR) => {
    const contextToBalances = (context, balances) => context.map(a => path([a, 'final_balance'], balances) || 0)
    const balancesR = lift(contextToBalances)(Remote.of(context), addressesR)
    return balancesR.map(reduce(add, 0))
  }
)
