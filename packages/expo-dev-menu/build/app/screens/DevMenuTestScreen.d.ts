import React from 'react';
export default class DevMenuTestScreen extends React.PureComponent {
    static navigationOptions: {
        headerShown: boolean;
    };
    static contextType: React.Context<import("../DevMenuContext").Context | null>;
    pushScreen: () => void;
    render(): JSX.Element;
}
