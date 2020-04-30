import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import DevMenuContext from '../DevMenuContext';
let DevMenuSettingsScreen = /** @class */ (() => {
    class DevMenuSettingsScreen extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.pushScreen = () => {
                this.props.navigation.push('Settings');
            };
        }
        render() {
            return (React.createElement(View, { style: styles.container },
                React.createElement(View, { style: { paddingTop: 60, alignItems: 'center' } },
                    React.createElement(Text, null, "Hello from expo-dev-menu!"))));
        }
    }
    DevMenuSettingsScreen.navigationOptions = {
        headerShown: true,
    };
    DevMenuSettingsScreen.contextType = DevMenuContext;
    return DevMenuSettingsScreen;
})();
export default DevMenuSettingsScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
//# sourceMappingURL=DevMenuSettingsScreen.js.map