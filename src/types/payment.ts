export interface Product {
    title: string,
    description: string,
    payload?: string,
    currency: 'XTR',
    variants: {
        amount: number,
        label: string
    }[]   
}

export interface Others {
    start_parameter: string,
    photo_url: string,
}

export interface RequestPaymentParams{
    chatId: string,
    product: Product,
    others: Others
}