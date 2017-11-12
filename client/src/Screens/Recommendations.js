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
import Webpage from './Webpage'

const uri_prefix = 'https://www.barchart.com/stocks/quotes/'
const uri_suffix = '/interactive-chart'