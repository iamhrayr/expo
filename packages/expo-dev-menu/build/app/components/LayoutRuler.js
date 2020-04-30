import React from 'react';
import { StyleSheet, View } from 'react-native';
function LayoutRuler(props) {
    const [onLayout] = React.useState(() => ({ nativeEvent }) => {
        props.onMeasure?.(nativeEvent.layout.height, props.name);
    });
    return (React.createElement(View, { style: props.property === 'width' ? styles.widthRuler : styles.heightRuler, onLayout: onLayout }, props.children));
}
const styles = StyleSheet.create({
    heightRuler: {
        flexDirection: 'row',
    },
    widthRuler: {
        flexDirection: 'column',
    },
});
export default React.memo(LayoutRuler);
//# sourceMappingURL=LayoutRuler.js.map