import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { Dimensions, Platform, View, StyleSheet } from 'react-native';
import { PanGestureHandler, TapGestureHandler, State as GestureState, } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import DevMenuScreen from './DevMenuScreen';
const Stack = createStackNavigator();
const { height: screenHeight } = Dimensions.get('window');
const P = (android, ios) => (Platform.OS === 'ios' ? ios : android);
const magic = {
    damping: 50,
    mass: 0.3,
    stiffness: 121.6,
    overshootClamping: true,
    restSpeedThreshold: 0.3,
    restDisplacementThreshold: 0.3,
    deceleration: 0.999,
    bouncyFactor: 1,
    velocityFactor: P(1, 0.8),
    toss: 0.4,
    coefForTranslatingVelocities: 5,
};
const { damping, mass, stiffness, overshootClamping, restSpeedThreshold, restDisplacementThreshold, deceleration, velocityFactor, toss, } = magic;
const { set, cond, onChange, block, eq, greaterOrEq, sqrt, not, defined, max, add, and, Value, spring, or, divide, greaterThan, sub, 
// event,
diff, multiply, clockRunning, startClock, stopClock, decay, Clock, lessThan, call, lessOrEq, neq, } = Animated;
function runDecay(clock, value, velocity, wasStartedFromBegin) {
    const state = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0),
    };
    const config = { deceleration };
    return [
        cond(clockRunning(clock), 0, [
            cond(wasStartedFromBegin, 0, [
                set(wasStartedFromBegin, 1),
                set(state.finished, 0),
                set(state.velocity, multiply(velocity, velocityFactor)),
                set(state.position, value),
                set(state.time, 0),
                startClock(clock),
            ]),
        ]),
        cond(clockRunning(clock), decay(clock, state, config)),
        cond(state.finished, stopClock(clock)),
        state.position,
    ];
}
function withPreservingAdditiveOffset(drag, state) {
    const prev = new Value(0);
    const valWithPreservedOffset = new Value(0);
    return block([
        cond(eq(state, GestureState.BEGAN), [set(prev, 0)], [set(valWithPreservedOffset, add(valWithPreservedOffset, sub(drag, prev))), set(prev, drag)]),
        valWithPreservedOffset,
    ]);
}
function withDecaying(drag, state, decayClock, velocity, prevent) {
    const valDecayed = new Value(0);
    const offset = new Value(0);
    // since there might be moar than one clock
    const wasStartedFromBegin = new Value(0);
    return block([
        cond(eq(state, GestureState.END), [
            cond(prevent, stopClock(decayClock), set(valDecayed, runDecay(decayClock, add(drag, offset), velocity, wasStartedFromBegin))),
        ], [
            stopClock(decayClock),
            cond(eq(state, GestureState.BEGAN), set(prevent, 0)),
            cond(or(eq(state, GestureState.BEGAN), eq(state, GestureState.ACTIVE)), set(wasStartedFromBegin, 0)),
            cond(eq(state, GestureState.BEGAN), [set(offset, sub(valDecayed, drag))]),
            set(valDecayed, add(drag, offset)),
        ]),
        valDecayed,
    ]);
}
let BottomSheetBehavior = /** @class */ (() => {
    class BottomSheetBehavior extends React.Component {
        constructor(props) {
            super(props);
            this.decayClock = new Clock();
            this.panState = new Value(0);
            this.tapState = new Value(0);
            this.velocity = new Value(0);
            this.masterVelocity = new Value(0);
            this.dragY = new Value(0);
            this.isManuallySetValue = new Value(0);
            this.manuallySetValue = new Value(0);
            this.masterClockForOverscroll = new Clock();
            this.preventDecaying = new Value(0);
            this.clampingValue = new Value(0);
            this.screenIndex = new Value(0);
            this.screens = {};
            this.handlePan = ({ nativeEvent: { translationY, state, velocityY } }) => {
                if (state === GestureState.BEGAN) {
                    const screenIndex = this.getCurrentScreenIndex();
                    this.screenIndex.setValue(screenIndex);
                }
                this.dragY.setValue(translationY);
                this.panState.setValue(state);
                this.velocity.setValue(velocityY);
            };
            this.handleTap = ({ nativeEvent: { state } }) => {
                this.tapState.setValue(state);
            };
            this.snapTo = (index) => {
                this.isManuallySetValue.setValue(1);
                this.manuallySetValue.setValue(
                // @ts-ignore
                this.state.snapPoints[this.state.propsToNewIndices[index]]);
            };
            this.height = new Value(0);
            this.handleFullHeader = ({ nativeEvent: { layout: { height }, }, }) => requestAnimationFrame(() => this.height.setValue(height));
            this.handleLayoutContent = ({ nativeEvent: { layout: { height }, }, }) => this.state.heightOfContent.setValue(height - this.state.initSnap);
            this.renderScreen = screen => {
                const ScreenComponent = screen.component;
                return (React.createElement(Stack.Screen, { key: screen.name, name: screen.name, options: screen.options }, props => {
                    this.navigation = props.navigation;
                    return (React.createElement(Animated.View, { style: {
                            transform: [{ translateY: this.screens[screen.name].y }],
                        }, onLayout: this.handleLayoutContent },
                        React.createElement(DevMenuScreen, Object.assign({ ScreenComponent: ScreenComponent }, props))));
                }));
            };
            this.panRef = props.innerGestureHandlerRefs[0];
            this.tapRef = props.innerGestureHandlerRefs[1];
            this.state = BottomSheetBehavior.getDerivedStateFromProps(props, undefined);
            const { snapPoints, init } = this.state;
            const middlesOfSnapPoints = [];
            for (let i = 1; i < snapPoints.length; i++) {
                const tuple = [
                    add(snapPoints[i - 1], 10),
                    sub(snapPoints[i], 25),
                ];
                middlesOfSnapPoints.push(tuple);
            }
            const masterOffseted = (this.masterOffseted = new Value(init));
            // destination point is a approximation of movement if finger released
            const tossForMaster = props.springConfig.hasOwnProperty('toss') && props.springConfig.toss != undefined
                ? props.springConfig.toss
                : toss;
            const destinationPoint = add(masterOffseted, multiply(tossForMaster, this.masterVelocity));
            const positive = greaterOrEq(multiply(tossForMaster, this.masterVelocity), 0);
            // method for generating condition for finding the nearest snap point
            const currentSnapPoint = (i = 0) => i + 1 === snapPoints.length
                ? snapPoints[i]
                : cond(positive, cond(greaterThan(destinationPoint, middlesOfSnapPoints[i][0]), cond(lessThan(destinationPoint, middlesOfSnapPoints[i][1]), snapPoints[i + 1], currentSnapPoint(i + 1)), snapPoints[i]), cond(greaterThan(destinationPoint, middlesOfSnapPoints[i][1]), cond(lessThan(destinationPoint, middlesOfSnapPoints[i][0]), snapPoints[i + 1], currentSnapPoint(i + 1)), snapPoints[i]));
            // current snap point desired
            this.snapPoint = currentSnapPoint();
            if (props.enabledBottomClamp) {
                this.clampingValue.setValue(snapPoints[snapPoints.length - 1]);
            }
            const masterClock = new Clock();
            const wasRun = new Value(0);
            this.translateMaster = block([
                cond(or(clockRunning(masterClock), not(wasRun), this.isManuallySetValue), [
                    cond(this.isManuallySetValue, stopClock(masterClock)),
                    set(masterOffseted, this.runSpring(masterClock, masterOffseted, this.masterVelocity, cond(this.isManuallySetValue, this.manuallySetValue, this.snapPoint), wasRun, this.isManuallySetValue, this.masterVelocity)),
                    set(this.isManuallySetValue, 0),
                ]),
                cond(greaterThan(masterOffseted, snapPoints[0]), cond(and(props.enabledBottomClamp ? 1 : 0, greaterThan(masterOffseted, this.clampingValue)), this.clampingValue, masterOffseted), max(multiply(sub(snapPoints[0], sqrt(add(1, sub(snapPoints[0], masterOffseted)))), 1), masterOffseted)),
            ]);
            this.updateScreenValues();
        }
        componentDidUpdate(prevProps, prevState) {
            const { snapPoints } = this.state;
            if (this.props.enabledBottomClamp && snapPoints !== prevState.snapPoints) {
                this.clampingValue.setValue(snapPoints[snapPoints.length - 1]);
            }
            if (this.props.screens !== prevProps.screens) {
                this.updateScreenValues();
            }
        }
        runSpring(clock, value, velocity, dest, wasRun, isManuallySet, valueToBeZeroed) {
            const state = {
                finished: new Value(0),
                velocity: new Value(0),
                position: new Value(0),
                time: new Value(0),
            };
            const config = {
                damping,
                mass,
                stiffness,
                overshootClamping,
                restSpeedThreshold,
                restDisplacementThreshold,
                toValue: new Value(0),
                ...this.props.springConfig,
            };
            return [
                cond(clockRunning(clock), 0, [
                    set(state.finished, 0),
                    set(state.velocity, velocity),
                    set(state.position, value),
                    set(config.toValue, dest),
                    cond(and(wasRun, not(isManuallySet)), 0, startClock(clock)),
                    cond(defined(wasRun), set(wasRun, 1)),
                ]),
                spring(clock, state, config),
                cond(state.finished, [stopClock(clock), set(valueToBeZeroed, 0)]),
                state.position,
            ];
        }
        getCurrentScreenValues() {
            const { index, routes } = this.navigation.dangerouslyGetState();
            const routeName = routes[index].name;
            return this.screens[routeName];
        }
        getCurrentScreenIndex() {
            const { index, routes } = this.navigation.dangerouslyGetState();
            const routeName = routes[index].name;
            return this.props.screens.findIndex(screen => screen.name === routeName);
        }
        updateScreenValues() {
            this.props.screens.forEach((screen, index) => {
                if (this.screens[screen.name]) {
                    return;
                }
                this.screens[screen.name] = {
                    index,
                    y: this.withEnhancedLimits(withDecaying(withPreservingAdditiveOffset(this.dragY, this.panState), this.panState, this.decayClock, this.velocity, this.preventDecaying), this.masterOffseted, index),
                };
            });
        }
        withEnhancedLimits(val, masterOffseted, screenIndex) {
            const wasRunMaster = new Value(0);
            const min = multiply(-1, this.state.heightOfContent);
            const prev = new Value(0);
            const limitedVal = new Value(0);
            const diffPres = new Value(0);
            const flagWasRunSpring = new Value(0);
            const justEndedIfEnded = new Value(1);
            // const wasEndedMasterAfterInner: Animated.Value<number> = new Value(1);
            const prevState = new Value(0);
            const rev = new Value(0);
            const clockForOverscroll = new Clock();
            return block([
                cond(eq(this.screenIndex, screenIndex), 
                // Node evaluated on matching screen
                [
                    set(rev, limitedVal),
                    cond(or(eq(this.panState, GestureState.BEGAN), and(eq(this.panState, GestureState.ACTIVE), eq(prevState, GestureState.END))), 
                    // Pan just began
                    [
                        set(prev, val),
                        set(flagWasRunSpring, 0),
                        stopClock(clockForOverscroll),
                        set(wasRunMaster, 0),
                    ], 
                    // Pan is active
                    [
                        set(limitedVal, add(limitedVal, sub(val, prev))),
                        cond(lessThan(limitedVal, min), set(limitedVal, min)),
                    ]),
                    set(prevState, this.panState),
                    set(diffPres, sub(prev, val)),
                    set(prev, val),
                    cond(or(greaterOrEq(limitedVal, 0), greaterThan(masterOffseted, 0)), [
                        cond(eq(this.panState, GestureState.ACTIVE), set(masterOffseted, sub(masterOffseted, diffPres))),
                        cond(greaterThan(masterOffseted, 0), [set(limitedVal, 0)]),
                        cond(not(eq(this.panState, GestureState.END)), set(justEndedIfEnded, 1)),
                        // cond(eq(this.panState, GestureState.ACTIVE), set(wasEndedMasterAfterInner, 0)),
                        cond(and(eq(this.panState, GestureState.END), 
                        // not(wasEndedMasterAfterInner),
                        or(clockRunning(clockForOverscroll), not(wasRunMaster))), [
                            // cond(justEndedIfEnded, set(this.masterVelocity, diff(val))),
                            set(this.masterVelocity, cond(justEndedIfEnded, diff(val), this.velocity)),
                            set(masterOffseted, this.runSpring(clockForOverscroll, masterOffseted, diff(val), this.snapPoint, wasRunMaster, 0, this.masterVelocity)),
                            set(this.masterVelocity, 0),
                        ]),
                        //   cond(eq(this.panState, State.END), set(wasEndedMasterAfterInner, 0)),
                        cond(eq(this.panState, GestureState.END), set(justEndedIfEnded, 0)),
                        set(this.preventDecaying, 1),
                        0,
                    ], [set(this.preventDecaying, 0), limitedVal]),
                ], 
                // Node evaluated on non-matching screens
                [limitedVal]),
            ]);
        }
        static getDerivedStateFromProps(props, state) {
            let snapPoints;
            const sortedPropsSnapPoints = props.snapPoints
                .map((s, i) => {
                if (typeof s === 'number') {
                    return { val: s, ind: i };
                }
                else if (typeof s === 'string') {
                    return { val: BottomSheetBehavior.renumber(s), ind: i };
                }
                throw new Error(`Invalid type for value ${s}: ${typeof s}`);
            })
                .sort(({ val: a }, { val: b }) => b - a);
            if (state && state.snapPoints) {
                state.snapPoints.forEach((s, i) => 
                // @ts-ignore
                s.__initialized && s.setValue(sortedPropsSnapPoints[0].val - sortedPropsSnapPoints[i].val));
                snapPoints = state.snapPoints;
            }
            else {
                snapPoints = sortedPropsSnapPoints.map(p => new Value(sortedPropsSnapPoints[0].val - p.val));
            }
            const propsToNewIndices = {};
            sortedPropsSnapPoints.forEach(({ ind }, i) => (propsToNewIndices[ind] = i));
            const { initialSnap } = props;
            let init = sortedPropsSnapPoints[0].val - sortedPropsSnapPoints[propsToNewIndices[initialSnap]].val;
            if (props.enabledBottomInitialAnimation) {
                init =
                    sortedPropsSnapPoints[sortedPropsSnapPoints.length - 1 - propsToNewIndices[initialSnap]]
                        .val;
            }
            return {
                init,
                propsToNewIndices,
                heightOfContent: (state && state.heightOfContent) || new Value(0),
                initSnap: sortedPropsSnapPoints[0].val,
                snapPoints,
            };
        }
        render() {
            return (React.createElement(React.Fragment, null,
                React.createElement(Animated.View, { style: styles.heightRuler, onLayout: this.handleFullHeader }),
                React.createElement(Animated.View, { style: [
                        styles.masterView,
                        {
                            opacity: cond(this.height, 1, 0),
                            transform: [
                                {
                                    translateY: this.translateMaster,
                                },
                                {
                                    translateY: sub(this.height, this.state.initSnap),
                                },
                            ],
                        },
                    ] },
                    React.createElement(Animated.View, { style: [styles.container, { height: this.height }] },
                        React.createElement(PanGestureHandler, { ref: this.panRef, onGestureEvent: this.handlePan, onHandlerStateChange: this.handlePan },
                            React.createElement(Animated.View, null,
                                React.createElement(TapGestureHandler, { ref: this.tapRef, onHandlerStateChange: this.handleTap },
                                    React.createElement(View, { style: styles.fullscreenView },
                                        React.createElement(Stack.Navigator, { initialRouteName: this.props.screens[0].name, headerMode: "float" }, this.props.screens.map(this.renderScreen)),
                                        this.props.children)))),
                        React.createElement(Animated.Code, { exec: onChange(this.tapState, cond(eq(this.tapState, GestureState.BEGAN), stopClock(this.decayClock))) }),
                        this.props.callbackNode && (React.createElement(Animated.Code, { exec: onChange(this.translateMaster, set(this.props.callbackNode, sub(1, divide(this.translateMaster, this.state.snapPoints[this.state.snapPoints.length - 1])))) }))))));
        }
    }
    BottomSheetBehavior.defaultProps = {
        overdragResistanceFactor: 0,
        initialSnap: 0,
        enabledBottomClamp: false,
        enabledBottomInitialAnimation: false,
        springConfig: {},
        innerGestureHandlerRefs: [React.createRef(), React.createRef()],
    };
    BottomSheetBehavior.renumber = (str) => (Number(str.split('%')[0]) * screenHeight) / 100;
    return BottomSheetBehavior;
})();
export default BottomSheetBehavior;
const styles = StyleSheet.create({
    heightRuler: {
        height: '100%',
        width: 0,
        position: 'absolute',
    },
    masterView: {
        width: '100%',
        position: 'absolute',
        zIndex: 100,
    },
    container: {
        overflow: 'hidden',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    fullscreenView: {
        width: '100%',
        height: '100%',
    },
});
//# sourceMappingURL=DevMenuBottomSheet.js.map