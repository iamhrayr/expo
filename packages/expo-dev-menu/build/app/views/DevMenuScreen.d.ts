import React from 'react';
import Animated from 'react-native-reanimated';
declare type Props = {
    ScreenComponent: React.ComponentType;
};
export default class DevMenuScreen extends React.PureComponent<Props> {
    containerHeightValue: Animated.Value<number>;
    heightSet: boolean;
    onHeightMeasure: (height: number) => void;
    render(): JSX.Element;
}
export {};
