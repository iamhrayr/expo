import Constants from 'expo-constants';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import * as DevMenuInternal from '../DevMenuInternal';
import { StyledText } from '../components/Text';
import { TouchableOpacity } from '../components/Touchables';
import { StyledView } from '../components/Views';
const KEYBOARD_CODES = {
    ios: '\u2318D',
    android: '\u2318M on MacOS or Ctrl+M on other platforms',
};
const MENU_NARROW_SCREEN = Dimensions.get('window').width < 375;
const ONBOARDING_MESSAGE = (() => {
    let fragment;
    if (Constants.isDevice) {
        if (Platform.OS === 'ios') {
            fragment =
                'you can shake your device or long press anywhere on the screen with three fingers';
        }
        else {
            fragment = 'you can shake your device';
        }
    }
    else {
        fragment = `in a simulator you can press ${KEYBOARD_CODES[Platform.OS]}`;
    }
    return `Since this is your first time opening the Expo client, we wanted to show you this menu and let you know that ${fragment} to get back to it at any time.`;
})();
class DevMenuOnboarding extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            finished: false,
        };
        this.onPress = () => {
            DevMenuInternal.setOnboardingFinished(true);
            this.setState({ finished: true });
        };
    }
    render() {
        if (!this.props.show || this.state.finished) {
            return null;
        }
        const headingStyles = MENU_NARROW_SCREEN
            ? [styles.onboardingHeading, styles.onboardingHeadingNarrow]
            : styles.onboardingHeading;
        return (React.createElement(View, { style: styles.onboardingContainer },
            React.createElement(StyledView, { style: styles.onboardingBackground, lightBackgroundColor: "#fff", darkBackgroundColor: "#000" }),
            React.createElement(View, { style: styles.onboardingContent },
                React.createElement(View, { style: styles.onboardingHeadingRow },
                    React.createElement(StyledText, { style: headingStyles, lightColor: "#595c68" }, "Hello there, friend! \uD83D\uDC4B")),
                React.createElement(StyledText, { style: styles.onboardingTooltip, lightColor: "#595c68" }, ONBOARDING_MESSAGE),
                React.createElement(TouchableOpacity, { style: styles.onboardingButton, onPress: this.onPress },
                    React.createElement(Text, { style: styles.onboardingButtonLabel }, "Got it")))));
    }
}
const styles = StyleSheet.create({
    onboardingContainer: {
        flex: 1,
        paddingHorizontal: 36,
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 2,
    },
    onboardingBackground: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        opacity: 0.9,
    },
    onboardingContent: {
        marginTop: Dimensions.get('window').height * 0.2,
    },
    onboardingHeadingRow: {
        flexDirection: 'row',
        marginTop: 6,
        marginRight: 16,
        marginBottom: 8,
    },
    onboardingHeading: {
        flex: 1,
        fontWeight: '700',
        fontSize: 22,
        textAlign: 'center',
    },
    onboardingHeadingNarrow: {
        fontSize: 18,
        marginTop: 2,
    },
    onboardingTooltip: {
        marginVertical: 10,
        fontSize: 16,
        textAlign: 'center',
    },
    onboardingButton: {
        alignItems: 'center',
        marginVertical: 12,
        paddingVertical: 10,
        backgroundColor: '#056ecf',
        borderRadius: 3,
    },
    onboardingButtonLabel: {
        color: '#fff',
        fontSize: 16,
    },
});
export default DevMenuOnboarding;
//# sourceMappingURL=DevMenuOnboarding.js.map