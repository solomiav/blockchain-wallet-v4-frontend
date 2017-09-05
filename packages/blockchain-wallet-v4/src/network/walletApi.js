import Task from 'data.task'
import Either from 'data.either'
import { assoc, compose, map, identity, prop, over, lensProp, is } from 'ramda'
import { mapped } from 'ramda-lens'
import Promise from 'es6-promise'
import { Wrapper, Wallet, HDWalletList, HDWallet, HDAccount } from '../types'
import { futurizeP } from 'futurize'
import createApi from './Api'
import * as Coin from '../coinSelection/coin.js'
Promise.polyfill()

const createWalletApi = ({rootUrl, apiUrl, apiCode} = {}, returnType) => {
  // ////////////////////////////////////////////////////////////////
  const ApiPromise = createApi({rootUrl, apiUrl, apiCode})
  const eitherToTask = e => e.fold(Task.rejected, Task.of)
  const taskToPromise = t => new Promise((resolve, reject) => t.fork(reject, resolve))
  const promiseToTask = futurizeP(Task)
  const future = returnType ? futurizeP(returnType) : identity
  // ////////////////////////////////////////////////////////////////
  const fetchWalletWithSharedKeyTask = (guid, sharedKey, password) =>
    promiseToTask(ApiPromise.fetchPayloadWithSharedKey)(guid, sharedKey)
      .map(Wrapper.fromEncJSON(password))
      .chain(eitherToTask)

  const fetchWalletWithSharedKey = compose(taskToPromise, fetchWalletWithSharedKeyTask)
  // ////////////////////////////////////////////////////////////////
  const fetchWalletWithSessionTask = (guid, session, password) =>
    promiseToTask(ApiPromise.fetchWalletWithSession)(guid, session)
      .map(Wrapper.fromEncJSON(password))
      .chain(eitherToTask)

  const fetchWalletWithSession = compose(taskToPromise, fetchWalletWithSessionTask)
  // ////////////////////////////////////////////////////////////////
  const fetchWallet = (guid, sharedKey, session, password) => {
    if (sharedKey) {
      return fetchWalletWithSharedKey(guid, sharedKey, password)
    }
    if (session) {
      return fetchWalletWithSession(guid, session, password)
    }
    return Promise.reject(new Error('MISSING_CREDENTIALS'))
  }
  // ////////////////////////////////////////////////////////////////
  const saveWalletTask = wrapper =>
    eitherToTask(Wrapper.toEncJSON(wrapper))
      .chain(promiseToTask(ApiPromise.savePayload))

  const saveWallet = compose(taskToPromise, saveWalletTask)
  // ////////////////////////////////////////////////////////////////
  const createWalletTask = email => wrapper =>
    eitherToTask(Wrapper.toEncJSON(wrapper))
      .map(assoc('email', email))
      .chain(promiseToTask(ApiPromise.createPayload))

  const createWallet = email => wrapper => compose(taskToPromise, createWalletTask(email))(wrapper)

  // source is an account index or a legacy address
  const getWalletUnspentsTask = (wrapper, source, confirmations = -1) => {
    if (is(Number, source)) {
      const selectXpub = Either.try(
        compose(HDAccount.selectXpub, HDWallet.selectAccount(source),
                HDWalletList.selectHDWallet, Wallet.selectHdWallets, Wrapper.selectWallet))
      return eitherToTask(selectXpub(wrapper))
            .chain(xpub => promiseToTask(ApiPromise.getUnspents)([xpub], confirmations))
            .map(prop('unspent_outputs'))
            .map(over(compose(mapped, lensProp('xpub')), assoc('index', source)))
            .map(map(Coin.fromJS))
    } else { // legacy address
      return promiseToTask(ApiPromise.getUnspents)([source], confirmations)
            .map(prop('unspent_outputs'))
            .map(over(mapped, assoc('priv', source)))
            .map(map(Coin.fromJS))
    }
  }
  const getWalletUnspents = compose(taskToPromise, getWalletUnspentsTask)

  // ////////////////////////////////////////////////////////////////
  const Api = map(future, ApiPromise)

  return {
    ...Api,
    fetchWalletWithSharedKey: future(fetchWalletWithSharedKey),
    fetchWalletWithSession: future(fetchWalletWithSession),
    fetchWallet: future(fetchWallet),
    saveWallet: future(saveWallet),
    createWallet: future(createWallet),
    getWalletUnspents: future(getWalletUnspents)
  }
}
export default createWalletApi