import {TextItem} from "pdfjs-dist/types/src/display/api";
import {assert} from "@hilats/utils";

export type Article = {
    articleId: string;
    label: string;
}

export type Purchase = {
    date: string
    coupon?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    amount: number;
}

export type Receipt = {
    receiptId: string;
    date: string;
    storeId: string;
    storeName: string;
    items: ReceiptItem[];
    returnedBottles: number;
    totalAmount: number;
}

export type ReceiptItem = Article & Purchase

function findNextReceiptIdx(items: Array<TextItem>, offset: number = 0) {
    return items.findIndex((i, idx) => idx >= offset && i.str.startsWith('Ticket de caisse '));
}

function cellMiddleY(item: TextItem) {
    return item.transform[5] + (item.height / 2);
}

function cellMiddleX(item: TextItem) {
    return item.transform[4] + (item.width / 2);
}

function parseLocaleNumber(str: string) {
    return parseFloat(str.replace(/\./g, "").replace(/\,/g, "."));
}

function parseLocaleDate(str: string) {
    // TODO use moment.js for generic locale date parsing

    // parse as DD/MM/YYYY
    const [DD, MM, YYYY] = str.split('/').map((n) => parseInt(n));
    return new Date(YYYY, MM, DD);
}

export function parseDoc(items: Array<TextItem>): Receipt[] {
    let nextReceiptIdx = -1;

    const receipts: Receipt[] = [];
    let currentOffset = 0;
    while ( (nextReceiptIdx = findNextReceiptIdx(items, currentOffset)) >= 0) {
        const [receipt, nextOffset] = parseReceipt(items, nextReceiptIdx);
        receipts.push(receipt);
        currentOffset = nextOffset;
    }

    return receipts;
}

function parseReceipt(textItems: Array<TextItem>, startOffset: number): [Receipt, number] {

    let currentOffset = startOffset;

    const receiptId = textItems[currentOffset].str.split(' ').pop();
    assert(receiptId, 'Receipt ID is undefined');

    const receipt: Receipt = {
        receiptId,
        date: '',
        items: [],
        returnedBottles: 0,
        storeId: '',
        storeName: '',
        totalAmount: 0
    }

    try {

        const headerMiddleY = cellMiddleY(textItems[++currentOffset]);
        let headerIdx = 0;
        const headers: Array<{ label: string, middleX: number, width: number }> = [];
        while (Math.abs(cellMiddleY(textItems[currentOffset + headerIdx]) - headerMiddleY) < 0.1) {
            // TODO assert column names
            headers.push({
                label: textItems[currentOffset + headerIdx].str,
                middleX: cellMiddleX(textItems[currentOffset + headerIdx]),
                width: textItems[currentOffset + headerIdx].width
            });
            headerIdx++;
        }

        currentOffset += headerIdx;

        function isSameColumn(item1: TextItem, item2: TextItem) {
            return Math.abs(cellMiddleX(item1) - cellMiddleX(item2)) < 0.1;
        }

        function isColumn(item: TextItem, headerIdx: number) {
            return Math.abs(headers[headerIdx].middleX - cellMiddleX(item)) < 0.1;
        }

        //let rowIdx = 0;
        let currentMiddleY = cellMiddleY(textItems[currentOffset]);
        let currentItem: ReceiptItem = {
            articleId: '',
            label: '',
            quantity: 0,
            unitPrice: 0,
            discount: 0,
            amount: 0,
            date: ''
        };

        for (; headerIdx < textItems.length; currentOffset++) {

            const currentTextItem = textItems[currentOffset]
            const nextTextItem = textItems[currentOffset + 1];

            if (currentTextItem.str.toLowerCase().startsWith('reduction publi'))
                break;

            const middleY = cellMiddleY(currentTextItem);
            if (Math.abs(middleY - currentMiddleY) > 10) {
                receipt.items.push(currentItem);
                currentItem = {
                    articleId: '',
                    label: '',
                    quantity: 0,
                    unitPrice: 0,
                    discount: 0,
                    amount: 0,
                    date: receipt.date
                };
                currentMiddleY = middleY;
            } else if (isSameColumn(currentTextItem, nextTextItem)) {
                currentTextItem.str += ' ' + nextTextItem.str;
                //currentTextItem.width += nextTextItem.width /* + space width ? */;
                currentTextItem.transform[5] = (currentTextItem.transform[5] + nextTextItem.transform[5])/2;
                currentOffset++;
            }

            if (isColumn(currentTextItem, 0)) {
                // Date
                receipt.date = currentItem.date = parseLocaleDate(currentTextItem.str).toISOString();
            }

            else if (isColumn(currentTextItem, 1))
                // Store ID
                receipt.storeId = currentTextItem.str;

            else if (isColumn(currentTextItem, 2))
                // Store Name
                receipt.storeName = currentTextItem.str;

            else if (isColumn(currentTextItem, 3))
                // Article ID
                currentItem.articleId = currentTextItem.str;

            else if (isColumn(currentTextItem, 4))
                // Article Label
                currentItem.label = currentTextItem.str;

            else if (isColumn(currentTextItem, 5))
                // Coupon
                currentItem.coupon = currentTextItem.str;

            else if (isColumn(currentTextItem, 6))
                // Quantity
                currentItem.quantity = parseLocaleNumber(currentTextItem.str);

            else if (isColumn(currentTextItem, 7))
                // Unit price
                currentItem.unitPrice = parseLocaleNumber(currentTextItem.str);

            else if (isColumn(currentTextItem, 8))
                // Discount
                currentItem.discount = parseLocaleNumber(currentTextItem.str);

            else if (isColumn(currentTextItem, 9))
                // Amount
                currentItem.amount = parseLocaleNumber(currentTextItem.str);
        }

        assert(textItems[currentOffset].str.toLowerCase().startsWith('reduction publi'), "Unexpected cell: "+textItems[currentOffset].str);

        assert(textItems[++currentOffset].str.toLowerCase().startsWith('vidanges'), "Unexpected cell: "+textItems[currentOffset].str);
        receipt.returnedBottles = parseLocaleNumber(textItems[currentOffset].str.split(':').pop()!);

        assert(textItems[++currentOffset].str.toLowerCase().startsWith('facture'), "Unexpected cell: "+textItems[currentOffset].str);

        assert(textItems[++currentOffset].str.toLowerCase().startsWith('total'), "Unexpected cell: "+textItems[currentOffset].str);
        receipt.totalAmount = parseLocaleNumber(textItems[currentOffset].str.split(':').pop()!);
    } catch (err) {
        console.warn(err);
    }


    return [receipt, currentOffset];
}