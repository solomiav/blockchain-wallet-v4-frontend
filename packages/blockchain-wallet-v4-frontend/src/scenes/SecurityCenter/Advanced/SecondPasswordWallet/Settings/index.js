
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import { formValueSelector } from 'redux-form'
import ui from 'redux-ui'

import { actions, selectors } from 'data'
import Settings from './template.js'

class SettingsContainer extends React.PureComponent {
  constructor (props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
  }

  onSubmit () {
    const { secondPasswordValue, secondPasswordEnabled } = this.props
    this.props.walletActions.toggleSecondPassword(secondPasswordValue, secondPasswordEnabled)
    this.props.formActions.reset('settingSecondPassword')
    this.handleToggle()
  }

  handleToggle () {
    this.props.updateUI({ updateToggled: !this.props.ui.updateToggled })
  }

  render () {
    const { ui, ...rest } = this.props

    return <Settings
      {...rest}
      onSubmit={this.onSubmit}
      updateToggled={ui.updateToggled}
      handleToggle={this.handleToggle}
      handleCancel={() => {
        this.props.formActions.reset('settingSecondPassword')
        this.handleToggle()
      }}
    />
  }
}

const mapStateToProps = (state) => ({
  mainPassword: selectors.core.wallet.getMainPassword(state),
  secondPasswordEnabled: selectors.core.wallet.isSecondPasswordOn(state),
  secondPasswordValue: formValueSelector('settingSecondPassword')(state, 'secondPassword'),
  wallet: selectors.core.wallet.getWallet(state)
})

const mapDispatchToProps = (dispatch) => ({
  walletActions: bindActionCreators(actions.wallet, dispatch),
  formActions: bindActionCreators(actions.form, dispatch)
})

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  ui({ key: 'Setting_SecondPassword', state: { updateToggled: false } })
)

export default enhance(SettingsContainer)
