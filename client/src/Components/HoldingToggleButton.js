import React, { Component } from 'react';
import { Text } from 'react-native';
import { Button } from 'react-native-elements'


const display_options = ['shares', 'averageCost', 'currentPrice', 'totalEquity']
const holdingDisplay = {
  shares: (holding) => (holding.shares.toString()),
  averageCost: (holding) => ('$' + holding.averageCost.toFixed(2).toString()),
  currentPrice: (holding) => getCurrentPrice(holding.ticker).then((price) => price.toString()),
  totalEquity: (holding) => ('$' + (getCurrentPrice(holding.ticker) * holding.shares).toFixed(2).toString())
}

export default class HoldingToggleButton extends Component {
  constructor(props) {
    super(props)

    this.state = {
      display_type: this.props.display,
      display_text: 'loading'
    }

    this.get_display_text = this.get_display_text.bind(this)

  }

  componentWillMount() {
    console.log('component will mount', holdingDisplay[this.state.display_type](this.props.holding))
    this.get_display_text()
  }

  get_display_text() {
    let type = this.state.display_type;
    console.log('changing display')
    this.setState({
      display_type: this.props.display,
      display_text: holdingDisplay[type](this.props.holding)
    })
    console.log('changed display')
  }

  render() {
    return (
      <Button
        title={this.state.display_text}
        onPress={this.props.toggle}
      />
    )
  }
}
