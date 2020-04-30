import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import DevMenuContext from '../DevMenuContext';
import { TouchableOpacity } from '../components/Touchables';
let DevMenuTestScreen = /** @class */ (() => {
    class DevMenuTestScreen extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.pushScreen = () => {
                this.props.navigation.push('Test');
            };
        }
        render() {
            return (React.createElement(View, { style: styles.container },
                React.createElement(View, { style: { height: 400, justifyContent: 'center', alignItems: 'center' } },
                    React.createElement(TouchableOpacity, { onPress: this.pushScreen },
                        React.createElement(View, { style: {
                                height: 100,
                                width: 100,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'green',
                            } },
                            React.createElement(Text, { style: { color: 'white' } }, "Press me!")))),
                React.createElement(View, { style: { height: 400, backgroundColor: 'blue' } }),
                React.createElement(View, { style: { height: 400, backgroundColor: 'green' } }),
                React.createElement(View, { style: { height: 400, backgroundColor: 'cyan' } }),
                React.createElement(View, { style: { height: 400, backgroundColor: 'yellow' } }),
                React.createElement(View, { style: { height: 400, backgroundColor: 'magenta' } }),
                React.createElement(View, { style: { height: 400, backgroundColor: 'orange' } }),
                React.createElement(View, { style: { height: 400, backgroundColor: 'red' } })));
        }
    }
    DevMenuTestScreen.navigationOptions = {
        headerShown: true,
    };
    DevMenuTestScreen.contextType = DevMenuContext;
    return DevMenuTestScreen;
})();
export default DevMenuTestScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
//# sourceMappingURL=DevMenuTestScreen.js.map