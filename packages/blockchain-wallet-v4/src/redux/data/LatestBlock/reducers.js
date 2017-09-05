import * as T from '../../actionTypes.js'
import { path } from 'ramda'

const INITIAL_STATE = {}

const latestBlockReducer = (state = INITIAL_STATE, action) => {
  const { type } = action
  switch (type) {
    case T.common.FETCH_BLOCKCHAIN_DATA_SUCCESS: {
      const { payload } = action
      return path(['info', 'latest_block'], payload)
    }
    case T.latestBlock.SET_LATEST_BLOCK: {
      const latestBlock = action.payload
      return latestBlock
    }
    default:
      return state
  }
}

export default latestBlockReducer