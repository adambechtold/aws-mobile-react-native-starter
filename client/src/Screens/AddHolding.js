/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  FormLabel,
  FormInput,
  FormValidationMessage,
  Button,
  Icon,
  ButtonGroup,
} from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';
import uuid from 'react-native-uuid';
import mime from 'mime-types';

import { colors } from 'theme';
import Auth from '../../lib/Categories/Auth';
import API from '../../lib/Categories/API';
import Storage from '../../lib/Categories/Storage';
import files from '../Utils/files';
import awsmobile from '../../aws-exports';
import DatePicker from '../Components/DatePicker';

const { width, height } = Dimensions.get('window');

let styles = {};

class AddHolding extends React.Component {
  static navigationOptions = {
    title: 'Add Holding',
  }

  state = {
    modalVisible: false,
    input: {
      ticker: '',
      shares: '',
      averageCost: '',
    },
    showActivityIndicator: false,
  }

  updateInput = (key, value) => {
    this.setState((state) => ({
      input: {
        ...state.input,
        [key]: value,
      }
    }))
  }

  toggleModal = () => {
    this.setState(() => ({ modalVisible: !this.state.modalVisible }))
  }


  AddHolding = () => {
    const holdingInfo = this.state.input;
    this.setState({ showActivityIndicator: true });

    this.apiSaveHolding(holdingInfo)
      .then(data => {
        this.setState({ showActivityIndicator: false });
        this.props.screenProps.handleRetrieveHolding();
        this.props.screenProps.toggleModal();
      })
      .catch(err => {
        console.log('error saving holding...', err);
        this.setState({ showActivityIndicator: false });
      })
    
  }

  apiSaveHolding(holding) {
    const cloudLogicArray = JSON.parse(awsmobile.aws_cloud_logic_custom);
    const endPoint = cloudLogicArray[0].endpoint;
    const requestParams = {
      method: 'POST',
      url: endPoint + '/items/holdings',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(holding),
    }

    return API.restRequest(requestParams);
  }

  render() {

    return (
      <View style={{ flex: 1, paddingBottom: 0 }}>
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.title}>Add New Holding</Text>
          <FormLabel>Ticker</FormLabel>
          <FormInput
            inputStyle={styles.input}
            selectionColor={colors.primary}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            editable={true}
            placeholder="Please enter ticker"
            returnKeyType="next"
            ref="ticker"
            textInputRef="tickerInput"
            onChangeText={(ticker) => this.updateInput('ticker', ticker)}
            value={this.state.input.ticker}
          />
          <FormLabel>Shares</FormLabel>
          <FormInput
            keyboardType='number-pad'
            inputStyle={styles.input}
            selectionColor={colors.primary}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            editable={true}
            placeholder="Please enter shares"
            returnKeyType="next"
            ref="shares"
            textInputRef="sharesInput"
            onChangeText={(shares) => this.updateInput('shares', shares)}
            value={this.state.input.shares}
          />
          <FormLabel>Average Cost</FormLabel>
          <FormInput
            keyboardType='number-pad'
            inputStyle={styles.input}
            selectionColor={colors.primary}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            editable={true}
            placeholder="Please enter average cost"
            returnKeyType="next"
            ref="averageCost"
            textInputRef="averageCost"
            onChangeText={(cost) => this.updateInput('averageCost', cost)}
            value={this.state.input.cost}
          />
          <Button
            fontFamily='lato'
            containerViewStyle={{ marginTop: 20 }}
            backgroundColor={colors.primary}
            large
            title="Add Holding"
            onPress={this.AddHolding}
          />
          <Text
            onPress={this.props.screenProps.toggleModal}
            style={styles.closeModal}>Dismiss</Text>
        </ScrollView>
        <Modal
          visible={this.state.showActivityIndicator}
          onRequestClose={() => null}
        >
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
          />
        </Modal>
      </View>
    );
  }
}

styles = StyleSheet.create({
  buttonGroupContainer: {
    marginHorizontal: 8,
  },
  closeModal: {
    color: colors.darkGray,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    marginLeft: 20,
    marginTop: 19,
    color: colors.darkGray,
    fontSize: 18,
    marginBottom: 15,
  },
  input: {
    fontFamily: 'lato',
  },
  activityIndicator: {
    backgroundColor: colors.mask,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default AddHolding;
