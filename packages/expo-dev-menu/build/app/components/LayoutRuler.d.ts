import React from 'react';
declare type Props = {
    property?: 'width' | 'height';
    onMeasure?: (dimension: number, name: string) => void;
    name?: string;
    children?: React.ReactNode;
};
declare function LayoutRuler(props: Props): JSX.Element;
declare const _default: React.MemoExoticComponent<typeof LayoutRuler>;
export default _default;
