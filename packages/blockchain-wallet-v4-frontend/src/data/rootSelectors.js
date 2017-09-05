import settings from 'config'
import { coreSelectorsFactory } from 'blockchain-wallet-v4/lib'
import * as alertsSelectors from 'data/Alerts/selectors'
import * as authSelectors from 'data/Auth/selectors'
import * as modalsSelectors from 'data/Modals/selectors'
import * as preferencesSelectors from 'data/Preferences/selectors'
import * as scrollSelectors from 'data/Scroll/selectors'

const alerts = alertsSelectors
const auth = authSelectors
const modals = modalsSelectors
const preferences = preferencesSelectors
const scroll = scrollSelectors

const core = coreSelectorsFactory({
  dataPath: settings.BLOCKCHAIN_DATA_PATH,
  settingsPath: settings.SETTINGS_PATH,
  walletPath: settings.WALLET_IMMUTABLE_PATH
})

export {
  alerts,
  auth,
  core,
  modals,
  preferences,
  scroll
}