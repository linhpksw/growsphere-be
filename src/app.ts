import express, { Application } from 'express';
import cors from 'cors';
import UserRouter from './app/modules/user/user.route';
import SettingsRouter from './app/modules/setting/setting.route';
import productRoute from './app/modules/product/product.route';
import userInputRoute from './app/modules/user-input/user-input.route';
import PaymentRoute from './app/modules/payment/payment.route';
import paymentSuccess from './app/modules/OrderProduct/orderSuccess.route';
import blogRoute from './app/modules/blog/blog.route';
import teamRoute from './app/modules/team/team.route';
const app: Application = express();

app.use(
    cors({
        origin: (incomingOrigin, callback) => {
            // 1) Allow Postman / curl (no-origin) requests:
            if (!incomingOrigin) return callback(null, true);

            // 2) Whitelist your two domains:
            const allowed = ['https://growsphere.space', 'https://www.growsphere.space'];
            // const allowed = ['http://localhost:3000'];
            if (allowed.includes(incomingOrigin)) {
                return callback(null, true);
            }

            // 3) Otherwise, reject:
            return callback(new Error('Not allowed by CORS'), false);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// This ensures any OPTIONS (preflight) request always goes through CORS:
app.options('*', cors());

// parse data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/user', UserRouter);
app.use('/setting', SettingsRouter);
app.use('/product', productRoute);
app.use('/user-input', userInputRoute);
app.use('/payment', PaymentRoute);
app.use('/success', paymentSuccess);
app.use('/blog', blogRoute);
app.use('/team', teamRoute);

export default app;
