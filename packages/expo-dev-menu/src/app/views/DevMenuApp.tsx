import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import { ThemeContext } from 'react-navigation';

import Colors from '../constants/Colors';
import DevMenuContainer from './DevMenuContainer';

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

function DevMenuApp(props) {
  const colorScheme = useColorScheme();

  return (
    <AppearanceProvider style={styles.rootView}>
      <ThemeContext.Provider value={colorScheme === 'no-preference' ? 'light' : colorScheme}>
        <NavigationContainer theme={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
          <DevMenuContainer {...props} />
        </NavigationContainer>
      </ThemeContext.Provider>
    </AppearanceProvider>
  );
}

export default class DevMenuAppRoot extends React.PureComponent<any, any> {
  render() {
    return <DevMenuApp {...this.props} />;
  }
}

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
});
