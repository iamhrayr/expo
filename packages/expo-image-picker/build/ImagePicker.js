import { UnavailabilityError, EventEmitter } from '@unimodules/core';
import { PermissionStatus, } from 'unimodules-permissions-interface';
import ExponentImagePicker from './ExponentImagePicker';
import { MediaTypeOptions, VideoExportPreset, } from './ImagePicker.types';
const ImagePickerEventEmitter = new EventEmitter(ExponentImagePicker);
export function subscribe(eventListener) {
    ImagePickerEventEmitter.addListener('Expo.imagepicker.onresult', eventListener);
}
export async function getCameraPermissionsAsync() {
    return ExponentImagePicker.getCameraPermissionsAsync();
}
export async function getCameraRollPermissionsAsync() {
    return ExponentImagePicker.getCameraRollPermissionsAsync();
}
export async function requestCameraPermissionsAsync() {
    return ExponentImagePicker.requestCameraPermissionsAsync();
}
export async function requestCameraRollPermissionsAsync() {
    return ExponentImagePicker.requestCameraRollPermissionsAsync();
}
export async function launchImageLibraryAsync(options = {}) {
    if (!ExponentImagePicker.launchImageLibraryAsync) {
        throw new UnavailabilityError('ImagePicker', 'launchImageLibraryAsync');
    }
    return await ExponentImagePicker.launchImageLibraryAsync(options);
}
export async function launchCameraAsync(options = {}) {
    if (!ExponentImagePicker.launchCameraAsync) {
        throw new UnavailabilityError('ImagePicker', 'launchCameraAsync');
    }
    return await ExponentImagePicker.launchCameraAsync(options);
}
export { MediaTypeOptions, VideoExportPreset, PermissionStatus, };
//# sourceMappingURL=ImagePicker.js.map