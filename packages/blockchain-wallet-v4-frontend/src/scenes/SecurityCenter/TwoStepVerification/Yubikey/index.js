import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import ui from 'redux-ui'

import { actions } from 'data'
import { getData } from './selectors'
import Success from './template.success'
import Error from './template.error'
import Loading from './template.loading'

class YubikeyContainer extends React.PureComponent {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.handleInput = this.handleInput.bind(this)

    this.state = { yubikeyCode: '' }
  }

  componentDidUpdate (prevProps) {
    const next = this.props.data.getOrElse({})
    const prev = prevProps.data.getOrElse({})
    if (next.authType !== prev.authType) {
      this.props.updateUI({ successToggled: true })
      this.props.triggerSuccess()
      this.props.handleGoBack()
      this.props.goBackOnSuccess()
    }
  }

  handleClick () {
    this.props.modalActions.showModal('TwoStepSetup')
  }

  onSubmit () {
    this.props.securityCenterActions.setYubikey(this.state.yubikeyCode)
  }

  handleInput (e) {
    e.preventDefault()
    this.setState({ yubikeyCode: e.target.value })
  }

  render () {
    const { data, ui, ...rest } = this.props

    return data.cata({
      Success: (value) => <Success
        data={value}
        handleClick={this.handleClick}
        onSubmit={this.onSubmit}
        goBack={this.props.goBack}
        handleInput={this.handleInput}
        value={this.state.yubikeyCode}
        ui={ui}
      />,
      Failure: (message) => <Error {...rest}
        message={message} />,
      Loading: () => <Loading {...rest} />,
      NotAsked: () => <Loading {...rest} />
    })
  }
}

const mapStateToProps = (state) => ({
  data: getData(state)
})

const mapDispatchToProps = (dispatch) => ({
  modalActions: bindActionCreators(actions.modals, dispatch),
  settingsActions: bindActionCreators(actions.core.settings, dispatch),
  securityCenterActions: bindActionCreators(actions.modules.securityCenter, dispatch)
})

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  ui({ key: 'Security_TwoFactor', state: { updateToggled: false, successToggled: false } })
)

export default enhance(YubikeyContainer)
