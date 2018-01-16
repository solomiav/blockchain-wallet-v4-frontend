import { channelSagas } from './channel/sagas.js'
import { peerSagas } from './peers/sagas'
import {LNRootSagas} from './root/sagas'

export const lnSagasFactory = (api, tcp) => {
  let peerSaga = peerSagas(tcp)
  let channel = channelSagas(api, peerSaga)
  let rootSaga = LNRootSagas()

  return {
    peer: peerSaga.takeSagas,
    channel: channel.takeSagas,
    root: rootSaga.takeSagas
  }
}