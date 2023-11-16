import * as React from "react";
export type AppContextType = {
    webId?: string;
    podUrl?: string;
    updateCtx: (update: Partial<AppContextType>) => void;
};
export declare const AppContext: React.Context<AppContextType>;
export declare function AppContextProvider(props: {
    children: (ctx: AppContextType) => React.ReactNode;
}): React.JSX.Element;
