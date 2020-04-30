import React from 'react';
declare type Props = {
    show: boolean;
};
declare type State = {
    finished: boolean;
};
declare class DevMenuOnboarding extends React.PureComponent<Props, State> {
    state: {
        finished: boolean;
    };
    onPress: () => void;
    render(): JSX.Element | null;
}
export default DevMenuOnboarding;
