import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import LayoutRuler from '../components/LayoutRuler';
const BOTTOM_PADDING = 40;
export default class DevMenuScreen extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.containerHeightValue = new Animated.Value(10000);
        this.heightSet = false;
        this.onHeightMeasure = (height) => {
            console.log(this.props.ScreenComponent.name, height);
            if (!this.heightSet && height > 0) {
                this.containerHeightValue.setValue(height + BOTTOM_PADDING);
                this.heightSet = true;
            }
        };
    }
    render() {
        const { ScreenComponent, ...props } = this.props;
        return (React.createElement(Animated.View, { style: [styles.container, { height: this.containerHeightValue }] },
            React.createElement(LayoutRuler, { property: "height", onMeasure: this.onHeightMeasure },
                React.createElement(ScreenComponent, Object.assign({}, props)))));
    }
}
const styles = StyleSheet.create({
    container: {
        paddingBottom: BOTTOM_PADDING,
    },
});
//# sourceMappingURL=DevMenuScreen.js.map