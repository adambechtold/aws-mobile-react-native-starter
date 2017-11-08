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
  Image,
} from 'react-native';
import { colors } from 'theme';
import Storage from '../../lib/Categories/Storage';

class ViewHolding extends React.PureComponent {
  static navigationOptions = ({ navigation, screenProps }) => console.log(screenProps) || ({
    title: `Viewing ${navigation.state.params.holding.ticker}`,
  })
  render() {
    const { holding } = this.props.navigation.state.params;

    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{holding.ticker || 'No name'}</Text>
            <Text style={styles.info}>{holding.shares || 'No shares'}</Text>
            <Text style={styles.info}>{holding.averageCost || 'No averageCost'}</Text>
          </View>
        </View>
        <View style={styles.breaker} />
      </View>
    );
  }
}

const imageSize = 130;
const styles = StyleSheet.create({
  infoContainer: {
    paddingLeft: 20,
  },
  breaker: {
    height: 1,
    backgroundColor: colors.darkGray,
    marginVertical: 15,
    width: '100%',
  },
  topContainer: {
    flexDirection: 'row',
  },
  container: {
    padding: 20,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
  },
  title: {
    color: colors.darkGray,
    fontSize: 28,
    marginBottom: 20,
  },
  info: {
    color: colors.darkGray,
    marginBottom: 7,
  },
});

export default ViewHolding;
