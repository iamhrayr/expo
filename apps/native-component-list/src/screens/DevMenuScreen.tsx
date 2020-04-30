import * as DevMenu from 'expo-dev-menu';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import Button from '../components/Button';

export default class AppearanceScreen extends React.Component<object, undefined> {
  static navigationOptions = {
    title: 'DevMenu',
  };

  openDevMenu = () => {
    DevMenu.openMenu();
  };

  render() {
    return (
      <View style={styles.screen}>
        <Button title="Open development menu" onPress={this.openDevMenu} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
