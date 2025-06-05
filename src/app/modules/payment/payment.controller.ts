import { Request, Response } from 'express';
import moment from 'moment';
import { PendingPayment } from './pendingPayment.model';
import { Order } from '../OrderProduct/orderSuccess.model';

// 1) POST /payments/preorder
export const createPreOrder = async (req: Request, res: Response) => {
    try {
        const { paymentCode, buyerEmail, amount, expiresAt } = req.body as {
            paymentCode: string;
            buyerEmail: string;
            amount: number;
            expiresAt: string;
        };

        // Basic validation
        if (!paymentCode || !buyerEmail || !amount || !expiresAt) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1a) Check if code already exists
        const existing = await PendingPayment.findOne({ paymentCode });
        if (existing) {
            return res
                .status(400)
                .json({ message: 'paymentCode already exists. Generate a new one.' });
        }

        // 1b) Create new PendingPayment
        const newPending = new PendingPayment({
            paymentCode,
            buyerEmail,
            amount,
            status: 'pending',
            createdAt: new Date(),
            expiresAt: new Date(expiresAt), // e.g. now + 5 minutes
        });
        await newPending.save();

        return res.status(200).json({ message: 'preorder created' });
    } catch (err) {
        console.error('createPreOrder error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// 2) GET /payments/status?code=XXXXXX
export const getPreOrderStatus = async (req: Request, res: Response) => {
    try {
        const code = req.query.code as string;
        if (!code) {
            return res.status(400).json({ message: 'Missing code in query' });
        }

        // Find by paymentCode
        const record = await PendingPayment.findOne({ paymentCode: code });
        if (!record) {
            return res.status(404).json({ status: 'not_found' });
        }

        // If expired & still pending, mark expired
        if (record.status === 'pending' && new Date() > record.expiresAt) {
            record.status = 'expired';
            await record.save();
        }

        if (record.status === 'pending') {
            return res.status(200).json({ status: 'pending' });
        }

        if (record.status === 'paid') {
            return res.status(200).json({
                status: 'paid',
                paidAt: record.paidAt,
                cassoTxnId: record.cassoTxnId,
            });
        }

        // If expired
        return res.status(200).json({ status: 'expired' });
    } catch (err) {
        console.error('getPreOrderStatus error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// 3) POST /payments/webhook
//    Simulated Casso webhook: { id, description, amount, transactionDateTime, accountNumber, bankName }
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const payload = req.body.data as {
            id: number;
            description: string;
            amount: number;
            transactionDateTime: string;
            accountNumber: string;
            bankName: string;
        };

        if (!payload) {
            return res.status(400).json({ message: 'Missing data in body' });
        }

        const { id: cassoTxnId, description, amount, transactionDateTime } = payload;

        // Find pending record with this paymentCode === description
        const record = await PendingPayment.findOne({ paymentCode: description });

        if (!record) {
            // No matching preorder → ignore
            return res.status(404).json({ success: false, message: 'No matching paymentCode' });
        }

        // If already paid or expired, ignore
        if (record.status === 'paid') {
            return res.status(200).json({ success: true, message: 'Already processed' });
        }
        if (record.status === 'expired') {
            return res.status(400).json({ success: false, message: 'Payment code expired' });
        }

        // Verify amount matches
        if (record.amount !== amount) {
            return res
                .status(400)
                .json({ success: false, message: 'Amount does not match preorder' });
        }

        // Mark this PendingPayment as “paid”
        record.status = 'paid';
        record.cassoTxnId = cassoTxnId;
        record.paidAt = transactionDateTime;
        await record.save();

        // Return success for Casso (no signature check because we skip it)
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('handleWebhook error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
