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
    return (React.createElement(AppearanceProvider, { style: styles.rootView },
        React.createElement(ThemeContext.Provider, { value: colorScheme === 'no-preference' ? 'light' : colorScheme },
            React.createElement(NavigationContainer, { theme: colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme },
                React.createElement(DevMenuContainer, Object.assign({}, props))))));
}
export default class DevMenuAppRoot extends React.PureComponent {
    render() {
        return React.createElement(DevMenuApp, Object.assign({}, this.props));
    }
}
const styles = StyleSheet.create({
    rootView: {
        flex: 1,
    },
});
//# sourceMappingURL=DevMenuApp.js.map