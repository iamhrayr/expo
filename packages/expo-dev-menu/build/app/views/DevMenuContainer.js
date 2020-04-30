import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Animated from 'react-native-reanimated';
import DevMenuContext from '../DevMenuContext';
import * as DevMenuInternal from '../DevMenuInternal';
import DevMenuMainScreen from '../screens/DevMenuMainScreen';
import DevMenuSettingsScreen from '../screens/DevMenuSettingsScreen';
import DevMenuTestScreen from '../screens/DevMenuTestScreen';
import DevMenuBottomSheet from './DevMenuBottomSheet';
import DevMenuOnboarding from './DevMenuOnboarding';
const { call, cond, eq, onChange } = Animated;
// @refresh
export default class DevMenuContainer extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.ref = React.createRef();
        this.snapPoints = [0, '60%', '75%', '90%'];
        this.callbackNode = new Animated.Value(0);
        this.backgroundOpacity = this.callbackNode.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
        });
        this.closeSubscription = null;
        this.collapse = () => {
            this.ref.current?.snapTo(0); // eslint-disable-line no-unused-expressions
        };
        this.expand = () => {
            this.ref.current?.snapTo(1); // eslint-disable-line no-unused-expressions
        };
        this.onCloseEnd = () => {
            DevMenuInternal.hideMenu();
        };
        this.providedContext = {
            expand: this.expand,
            collapse: this.collapse,
        };
        this.trackCallbackNode = onChange(this.callbackNode, cond(eq(this.callbackNode, 0), call([], this.onCloseEnd)));
        this.screens = [
            {
                name: 'Main',
                component: DevMenuMainScreen,
                options: DevMenuMainScreen.navigationOptions,
            },
            {
                name: 'Settings',
                component: DevMenuSettingsScreen,
                options: DevMenuSettingsScreen.navigationOptions,
            },
            {
                name: 'Test',
                component: DevMenuTestScreen,
                options: DevMenuTestScreen.navigationOptions,
            },
        ];
    }
    componentDidMount() {
        this.expand();
        // Before the dev menu can be actually closed, we need to collapse its sheet view,
        // and this listens for close requests that come from native side to start collapsing the view.
        this.closeSubscription = DevMenuInternal.subscribeToCloseEvents(() => {
            // Collapse the bottom sheet. `onCloseEnd` will be called once it ends.
            this.collapse();
        });
    }
    componentDidUpdate(prevProps) {
        // Make sure it gets expanded once we receive new identifier.
        if (prevProps.uuid !== this.props.uuid) {
            this.expand();
        }
    }
    componentWillUnmount() {
        this.closeSubscription?.remove(); // eslint-disable-line no-unused-expressions
        this.closeSubscription = null;
    }
    render() {
        const providedContext = {
            ...this.props,
            ...this.providedContext,
        };
        return (React.createElement(DevMenuContext.Provider, { value: providedContext },
            React.createElement(View, { style: styles.bottomSheetContainer },
                React.createElement(TouchableWithoutFeedback, { onPress: this.collapse },
                    React.createElement(Animated.View, { style: [styles.bottomSheetBackground, { opacity: this.backgroundOpacity }] })),
                React.createElement(DevMenuBottomSheet, { ref: this.ref, initialSnap: 0, snapPoints: this.snapPoints, callbackNode: this.callbackNode, screens: this.screens },
                    React.createElement(DevMenuOnboarding, { show: this.props.showOnboardingView }))),
            React.createElement(Animated.Code, { exec: this.trackCallbackNode })));
    }
}
const styles = StyleSheet.create({
    bottomSheetContainer: {
        flex: 1,
    },
    bottomSheetBackground: {
        flex: 1,
        backgroundColor: '#000',
    },
});
//# sourceMappingURL=DevMenuContainer.js.map