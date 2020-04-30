import React from 'react';
import { Context } from '../DevMenuContext';
import * as DevMenuInternal from '../DevMenuInternal';
declare type Props = {
    appInfo: {
        [key: string]: any;
    };
    uuid: string;
    devMenuItems: DevMenuInternal.DevMenuItemAnyType[];
    enableDevelopmentTools: boolean;
    showOnboardingView: boolean;
};
declare class DevMenuView extends React.PureComponent<Props, undefined> {
    static contextType: React.Context<Context | null>;
    context: Context;
    collapse: () => void;
    onCopyTaskUrl: () => void;
    renderItems(): JSX.Element;
    renderContent(): JSX.Element;
    render(): JSX.Element;
}
export default DevMenuView;
