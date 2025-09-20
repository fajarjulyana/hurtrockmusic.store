declare module 'midtrans-client' {
  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface ItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  export interface CustomerDetails {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }

  export interface SnapTransactionRequest {
    transaction_details: TransactionDetails;
    item_details: ItemDetails[];
    customer_details: CustomerDetails;
  }

  export interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(config: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });

    createTransaction(parameter: SnapTransactionRequest): Promise<SnapTransactionResponse>;
    transaction: {
      notification(notification: any): Promise<any>;
    };
  }

  export default {
    Snap
  };
}