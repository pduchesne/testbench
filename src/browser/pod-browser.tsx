import * as React from 'react';
import {useContext, useMemo, useState} from 'react';

/*
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/turtle/turtle';
import 'codemirror/mode/javascript/javascript';

 */
import {useSession} from "@inrupt/solid-ui-react";
import {DirtyCodemirror} from "./codemirror";

import {PromiseContainer, PromiseStateContainer} from "@hilats/react-utils/dist/esm";
import {useSolidFile} from "../solid";
import {PromiseState, usePromiseFn} from "@hilats/react-utils";
import {getContainedResourceUrlAll, getSolidDataset, isContainer, WithResourceInfo} from "@inrupt/solid-client";
import {SolidDataset} from "@inrupt/solid-client/dist/interfaces";
import {AppContext} from "../appContext";
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import {Breadcrumbs, Link} from "@mui/material";
import {CommonProps} from "@mui/material/OverridableComponent";


export const PodBrowserPanel = () => {

    const {fetch} = useSession();
    const appContext = useContext(AppContext)

    return appContext.podUrl ? <PodBrowser fileUrl={appContext.podUrl} fetch={fetch}/> : null;
}

function FileBreadcrumbs(props: { rootUrl?: string, path: string, onSelect: (url: string) => void } & CommonProps) {

    const {rootUrl, path, onSelect, ...commonProps} = props;

    const [computedRoot, relPath] = useMemo( () => {
        const computedRoot = rootUrl || new URL(path).origin + '/';

        return [computedRoot, path.startsWith(computedRoot) ? path.substring(computedRoot.length) : path]
    }, [rootUrl, path])

    const pathElements = relPath.split('/');

    const subpaths = pathElements.reduce((acc: string[], path: string, idx, arr) => {if (path) acc.push(acc[acc.length-1] + path + ((idx < arr.length-1) ? '/' : '')); return acc;}, [computedRoot]);

    return (
        <Breadcrumbs aria-label="breadcrumb" {...commonProps}>
            {subpaths.map((path) => (
                    <Link
                        underline="hover"
                        color="inherit"
                        onClick={() => props.onSelect(path)}>{path.split('/').filter(e => e).pop()}</Link>
                )
            )
            }

        </Breadcrumbs>
    );
}

export const PodBrowser = (props: { fileUrl: string, fetch?: typeof fetch }) => {

    const [currentUrl, setCurrentUrl] = useState(props.fileUrl);
    const currentFolder = new URL('./', currentUrl).toString();

    const currentFile = useSolidFile(
        currentUrl,
        props.fetch);

    const fileBlob$ = useMemo(async () => {
        if (currentFile?.file) {
            const file = await currentFile.file;
            const content = await file.text();
            return content;
        } else {
            return undefined;
        }
    }, [currentFile?.file])

    return (
        <div className="vFlow fill">
            <FileBreadcrumbs path={currentUrl} onSelect={setCurrentUrl} style={{flex: 'none'}}/>
            <div className="viewer-basic hFlow">
                <PodDirectoryTree folderUrl={currentFolder} fetch={props.fetch} onSelectFile={setCurrentUrl}/>
                <div className="vFlow">

                    {fileBlob$ ?
                        <PromiseContainer promise={fileBlob$}>
                            {(fileContent) => <DirtyCodemirror
                                value={fileContent}
                                options={{
                                    //theme: 'material',
                                    lineNumbers: true
                                }}
                                onChange={((editor, data, value) => {
                                    currentFile?.saveRawContent(value)
                                })}
                            />}
                        </PromiseContainer> : null
                    }

                </div>


            </div>
            {/*    }
        </SizeMeasurer> */}
        </div>
    );
};

export const PodDirectoryTree = (props: { folderUrl: string, fetch?: typeof fetch, onSelectFile: (url: string) => void }) => {

    const container$: PromiseState<{ dataset: SolidDataset & WithResourceInfo, children: string[] }> = usePromiseFn(
        async () => {
            const dataset = await getSolidDataset(
                props.folderUrl,               // File in Pod to Read
                {fetch: props.fetch}       // fetch from authenticated session
            );
            if (!isContainer(dataset))
                throw new Error('Not a folder : ' + props.folderUrl);

            const children = await getContainedResourceUrlAll(dataset);

            return {dataset, children};
        },
        [props.folderUrl, props.fetch]
    )

    return (
        <div className="vFlow">
            <PromiseStateContainer promiseState={container$}>
                {(container) => <div>
                    {container.children.map(res =>
                        <div onClick={() => props.onSelectFile(res)}>
                            {res.endsWith('/') ? <FolderIcon/> : <DescriptionIcon/>}
                            {res.substring(props.folderUrl.length)}
                        </div>)}
                </div>}
            </PromiseStateContainer>
        </div>
    );
};

