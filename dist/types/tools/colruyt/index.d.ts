import * as React from "react";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { Receipt } from "./parser";
export declare const ColruytPanel: () => React.JSX.Element;
export declare const PdfItemsTable: (props: {
    items: Array<TextItem>;
}) => React.JSX.Element;
export declare const ShoppingDashboard: (props: {
    receipts: Array<Receipt>;
    textItems: Array<TextItem>;
}) => React.JSX.Element;
export declare const ReceiptsTable: (props: {
    receipts: Array<Receipt>;
}) => React.JSX.Element | null;
export declare const Dashboard: (props: {
    receipts: Array<Receipt>;
}) => React.JSX.Element;
export declare const ItemsTable: (props: {
    receipts: Array<Receipt>;
}) => React.JSX.Element;
export declare const Expenses: (props: {
    receipts: Array<Receipt>;
}) => React.JSX.Element;
