import * as React from 'react';
import { LoginButton } from '@inrupt/solid-ui-react';
import { WithResourceInfo } from "@inrupt/solid-client";
export declare const LoginMultiButton: (props: Omit<Parameters<typeof LoginButton>[0], 'oidcIssuer'>) => React.JSX.Element;
export type SolidFile = {
    file: Promise<Blob & WithResourceInfo>;
    saveRawContent: (rawContent: string | Blob) => Promise<void>;
};
/**
 * Create a memoized annotation container to perform storage operations on an annotation file
 * @param annotations
 * @param preselection
 * @param onNewAnnotation
 * @param onSelection
 */
export declare function useSolidFile(path: string, fetchFn?: typeof fetch): SolidFile | undefined;
