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
  ScrollView,
  Text,
  Animated,
  StyleSheet,
  Image,
  Easing,
  TouchableHighlight,
  Modal,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { DrawerNavigator, NavigationActions, StackNavigator } from 'react-navigation';

import Auth from '../../lib/Categories/Auth';
import Storage from '../../lib/Categories/Storage';
import API from '../../lib/Categories/API';
import UploadPhoto from '../Components/UploadPhoto';
import SideMenuIcon from '../Components/SideMenuIcon';
import awsmobile from '../../aws-exports';
import { colors } from 'theme';

import AddHolding from './AddHolding'
import ViewHolding from './ViewHolding'

let styles = {};

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.handleRetrieveHolding = this.handleRetrieveHolding.bind(this)
    this.animate = this.animate.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    this.animatedIcon = new Animated.Value(0);

    this.state = {
      apiResponse: null,
      loading: true,
      modalVisible: false,
    }
  }

  componentDidMount() {
    this.handleRetrieveHolding();
    this.animate();
  }

  animate() {
    Animated.loop(
      Animated.timing(
        this.animatedIcon,
        {
          toValue: 1,
          duration: 1300,
          easing: Easing.linear,
        }
      )
    ).start();
  }

  handleRetrieveHolding() {
    const cloudLogicArray = JSON.parse(awsmobile.aws_cloud_logic_custom);
    const endPoint = cloudLogicArray[0].endpoint;
    const requestParams = {
      method: 'GET',
      url: endPoint + '/items/holdings',
    };

    API.restRequest(requestParams).then(apiResponse => {
      this.setState({ apiResponse, loading: false });
    }).catch(e => {
      this.setState({ apiResponse: e.message, loading: false });
    });
  }

  openDrawer = () => {
    this.props.navigation.navigate('DrawerOpen');
  }

  toggleModal() {
    if (!this.state.modalVisible) {
      this.handleRetrieveHolding();
      this.animate();
    }

    this.setState((state) => ({ modalVisible: !state.modalVisible }));
  }

  renderHolding(holding, index) {
    return (
      <TouchableHighlight
        onPress={() => {
          this.props.navigation.navigate('ViewHolding', {holding})
        }}
        underlayColor='transparent'
        key={holding.holdingId}
      >
        <View style={styles.holdingInfoContainer}>
          <Text style={styles.holdingInfoName}>{holding.ticker}</Text>
        </View>
      </TouchableHighlight>
    )
  }

  render() {
    const { loading, apiResponse } = this.state;
    const spin = this.animatedIcon.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const AddHoldingRoutes = StackNavigator({
      AddHolding: { screen: AddHolding },
      UploadPhoto: { screen: UploadPhoto },
    });

    return (
      <View style={[{ flex: 1 }]}>
        {!loading && <View style={{ position: 'absolute', bottom: 25, right: 25, zIndex: 1 }}>
          <Icon
            onPress={this.toggleModal}
            raised
            reverse
            name='add'
            size={44}
            containerStyle={{ width: 50, height: 50 }}
            color={colors.primary}
          />
        </View>}
        <ScrollView style={[{ flex: 1, zIndex: 0 }]} contentContainerStyle={[loading && { justifyContent: 'center', alignItems: 'center' }]}>
          {loading && <Animated.View style={{ transform: [{ rotate: spin }] }}><Icon name='autorenew' color={colors.grayIcon} /></Animated.View>}
          {
            !loading &&
            <View style={styles.container}>
              <Text style={styles.title}>My Portfolio</Text>
              {
                apiResponse.map((holding, index) => this.renderHolding(holding, index))
              }
            </View>
          }
        </ScrollView>
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={this.toggleModal}
        >
          <AddHoldingRoutes screenProps={{ handleRetrieveHolding: this.handleRetrieveHolding, toggleModal: this.toggleModal }} />
        </Modal>
      </View >
    );
  }
};

styles = StyleSheet.create({
  container: {
    padding: 25,
  },
  title: {
    color: colors.darkGray,
    fontSize: 18,
    marginBottom: 15,
  },
  holdingInfoContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  holdingInfoName: {
    color: colors.darkGray,
    fontSize: 20,
    marginLeft: 17
  },
})



const HomeRouteStack = {
  Home: {
    screen: (props) => {
      const { screenProps, ...otherProps } = props;
      return <Home {...props.screenProps} {...otherProps} />
    },
    navigationOptions: (props) => {
      return {
        title: 'Home',
        headerLeft: <SideMenuIcon onPress={() => props.screenProps.rootNavigator.navigate('DrawerOpen')} />,
      }
    }
  },
  ViewHolding: { screen: ViewHolding }
};

const HomeNav = StackNavigator(HomeRouteStack);

export default (props) => {
  const { screenProps, rootNavigator, ...otherProps } = props;

  return <HomeNav screenProps={{ rootNavigator, ...screenProps, ...otherProps }} />
};
