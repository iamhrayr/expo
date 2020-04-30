import * as React from 'react';
import { PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
declare type Props = {
    /**
     * Points for snapping of bottom sheet component. They define distance from bottom of the screen.
     * Might be number or percent (as string e.g. '20%') for points or percents of screen height from bottom.
     */
    snapPoints: (number | string)[];
    /**
     * Determines initial snap point of bottom sheet. Defaults to 0.
     */
    initialSnap: number;
    /**
     * When true, clamp bottom position to first snapPoint.
     */
    enabledBottomClamp?: boolean;
    /**
     * When true, sheet will grows up from bottom to initial snapPoint.
     */
    enabledBottomInitialAnimation?: boolean;
    /**
     * If false blocks snapping using snapTo method. Defaults to true.
     */
    enabledManualSnapping?: boolean;
    /**
     * Reanimated node which holds position of bottom sheet, where 1 it the highest snap point and 0 is the lowest.
     */
    callbackNode?: Animated.Value<number>;
    /**
     * Reanimated node which holds position of bottom sheet;s content (in dp).
     */
    contentPosition?: Animated.Value<number>;
    /**
     * Defines how violently sheet has to stopped while overdragging. 0 means no overdrag. Defaults to 0.
     */
    overdragResistanceFactor: number;
    /**
     * Overrides config for spring animation
     */
    springConfig: {
        damping?: number;
        mass?: number;
        stiffness?: number;
        restSpeedThreshold?: number;
        restDisplacementThreshold?: number;
        toss?: number;
    };
    /**
     * Refs for gesture handlers used for building bottomsheet
     */
    innerGestureHandlerRefs: [React.RefObject<PanGestureHandler>, React.RefObject<TapGestureHandler>];
};
declare type State = {
    snapPoints: Animated.Value<number>[];
    init: any;
    initSnap: number;
    propsToNewIndices: {
        [key: string]: number;
    };
    heightOfContent: Animated.Value<number>;
};
export default class BottomSheetBehavior extends React.Component<Props, State> {
    static defaultProps: {
        overdragResistanceFactor: number;
        initialSnap: number;
        enabledBottomClamp: boolean;
        enabledBottomInitialAnimation: boolean;
        springConfig: {};
        innerGestureHandlerRefs: React.RefObject<unknown>[];
    };
    private decayClock;
    private panState;
    private tapState;
    private velocity;
    private masterVelocity;
    private dragY;
    private isManuallySetValue;
    private manuallySetValue;
    private masterClockForOverscroll;
    private preventDecaying;
    private translateMaster;
    private panRef;
    private tapRef;
    private snapPoint;
    private clampingValue;
    private screenIndex;
    private screens;
    constructor(props: Props);
    componentDidUpdate(prevProps: Props, prevState: State): void;
    private runSpring;
    getCurrentScreenValues(): any;
    getCurrentScreenIndex(): any;
    updateScreenValues(): void;
    private handlePan;
    private handleTap;
    private withEnhancedLimits;
    snapTo: (index: number) => void;
    private height;
    private handleFullHeader;
    private handleLayoutContent;
    static renumber: (str: string) => number;
    static getDerivedStateFromProps(props: Props, state: State | undefined): State;
    renderScreen: (screen: any) => JSX.Element;
    render(): JSX.Element;
}
export {};
