import { Schema, model, Document } from 'mongoose';

export interface IPendingPayment extends Document {
    paymentCode: string;
    buyerEmail: string;
    amount: number;
    status: 'pending' | 'paid' | 'expired';
    createdAt: Date;
    expiresAt: Date;
    cassoTxnId?: number;
    paidAt?: string;
}

const pendingPaymentSchema = new Schema<IPendingPayment>({
    paymentCode: { type: String, required: true, unique: true },
    buyerEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'expired'],
        default: 'pending',
    },
    createdAt: { type: Date, default: () => new Date() },
    expiresAt: { type: Date, required: true },
    cassoTxnId: { type: Number },
    paidAt: { type: String },
});

// Optionally, you can create a TTL index on expiresAt to automatically delete expired docs:
// pendingPaymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingPayment = model<IPendingPayment>('PendingPayment', pendingPaymentSchema);
