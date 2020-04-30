import { NativeModulesProxy } from '@unimodules/core';
import { DeviceEventEmitter, NativeModules } from 'react-native';
const DevMenu = NativeModules.ExpoDevMenuInternal;
// Mock ExpoFontLoader unimodule - we don't have access to unimodules from dev menu app.
if (!NativeModulesProxy.ExpoFontLoader) {
    NativeModulesProxy.ExpoFontLoader = {
        addListener() { },
        removeListeners() { },
        async loadAsync() { },
    };
}
export var DevMenuItemEnum;
(function (DevMenuItemEnum) {
    DevMenuItemEnum[DevMenuItemEnum["ACTION"] = 1] = "ACTION";
    DevMenuItemEnum[DevMenuItemEnum["GROUP"] = 2] = "GROUP";
})(DevMenuItemEnum || (DevMenuItemEnum = {}));
export async function getSettingsAsync() {
    return {
        preferredAppearance: 'no-preference',
        motionGestureEnabled: true,
        touchGestureEnabled: true,
    };
}
export async function updateSettingsAsync() { }
export async function dispatchActionAsync(actionId) {
    return await DevMenu.dispatchActionAsync(actionId);
}
export function hideMenu() {
    DevMenu.hideMenu();
}
export function setOnboardingFinished(finished) {
    DevMenu.setOnboardingFinished(finished);
}
export function subscribeToCloseEvents(listener) {
    return DeviceEventEmitter.addListener('closeDevMenu', listener);
}
//# sourceMappingURL=DevMenuInternal.js.map