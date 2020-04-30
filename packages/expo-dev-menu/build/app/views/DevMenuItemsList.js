import { NavigationContext } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, PixelRatio, View } from 'react-native';
import DevMenuContext from '../DevMenuContext';
import { DevMenuItemEnum, dispatchActionAsync, } from '../DevMenuInternal';
import { StyledView } from '../components/Views';
import Colors from '../constants/Colors';
import DevMenuButton from './DevMenuButton';
class DevMenuItem extends React.PureComponent {
    render() {
        const { item } = this.props;
        switch (item.type) {
            case DevMenuItemEnum.ACTION:
                return React.createElement(DevMenuItemAction, { item: item });
            case DevMenuItemEnum.GROUP:
                return React.createElement(DevMenuItemsList, { items: item.items });
            default:
                return null;
        }
    }
}
let DevMenuItemAction = /** @class */ (() => {
    class DevMenuItemAction extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.action = (...args) => {
                dispatchActionAsync(...args);
                this.context?.collapse?.();
            };
        }
        render() {
            const { actionId, isAvailable, label, detail, glyphName } = this.props.item;
            return (React.createElement(StyledView, { style: styles.itemWrapper, lightBackgroundColor: Colors.light.secondaryBackground, lightBorderColor: Colors.light.border, darkBackgroundColor: Colors.dark.secondaryBackground, darkBorderColor: Colors.dark.border },
                React.createElement(DevMenuButton, { buttonKey: actionId, label: label || '', onPress: this.action, icon: glyphName, isEnabled: isAvailable, detail: detail || '' })));
        }
    }
    DevMenuItemAction.contextType = DevMenuContext;
    return DevMenuItemAction;
})();
let DevMenuItemNavigation = /** @class */ (() => {
    class DevMenuItemNavigation extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.action = () => {
                this.context.push(this.props.route);
            };
        }
        render() {
            const { route, label, glyphName } = this.props;
            return (React.createElement(StyledView, { style: styles.itemWrapper, lightBackgroundColor: Colors.light.secondaryBackground, lightBorderColor: Colors.light.border, darkBackgroundColor: Colors.dark.secondaryBackground, darkBorderColor: Colors.dark.border },
                React.createElement(DevMenuButton, { buttonKey: route, label: label || '', onPress: this.action, icon: glyphName })));
        }
    }
    DevMenuItemNavigation.contextType = NavigationContext;
    return DevMenuItemNavigation;
})();
export default class DevMenuItemsList extends React.PureComponent {
    render() {
        const { items } = this.props;
        return (React.createElement(View, null,
            React.createElement(View, { style: styles.group }, items.map((item, index) => (React.createElement(DevMenuItem, { key: index, item: item })))),
            React.createElement(View, { style: styles.group },
                React.createElement(DevMenuItemNavigation, { route: "Settings", label: "Settings", glyphName: "settings-outline" }),
                React.createElement(DevMenuItemNavigation, { route: "Test", label: "Navigation and scroll test", glyphName: "test-tube" }))));
    }
}
const pixel = 2 / PixelRatio.get();
const styles = StyleSheet.create({
    group: {
        marginBottom: 10,
        marginHorizontal: -pixel,
    },
    itemWrapper: {
        borderTopWidth: pixel,
        borderBottomWidth: pixel,
        marginTop: -pixel,
    },
});
//# sourceMappingURL=DevMenuItemsList.js.map