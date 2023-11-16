import * as React from 'react';
export declare const PodBrowserPanel: () => React.JSX.Element | null;
export declare const PodBrowser: (props: {
    fileUrl: string;
    fetch?: typeof fetch;
}) => React.JSX.Element;
export declare const PodDirectoryTree: (props: {
    folderUrl: string;
    fetch?: typeof fetch | undefined;
    onSelectFile: (url: string) => void;
}) => React.JSX.Element;
