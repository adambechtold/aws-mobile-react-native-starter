import React, {Component } from 'react'

import {
  WebView,
  StyleSheet
} from 'react-native'

const WebPage = ({navigation}) => (
  <WebView sytle={styles.container}
           source={{uri: navigation.state.params.uri}}
           startInLoadingState 
           />
)

WebPage.navigationOptions = {
  'title': 'Ticker Info'
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default WebPage
