import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;

        console.log('Authorization Header:', authorization);
        console.log('Request Query:', req.query);
        console.log('JWT', process.env.JWT_SECRET);

        if (!authorization) {
            return res.status(403).send({ message: 'JWT Authorization Header Missing' });
        }

        const token = authorization.split(' ')[1];
        console.log('Token:', token);
        const decoded = (await jwt.verify(token, `${process.env.JWT_SECRET}`)) as { email: string };
        console.log('Decoded Token:', decoded);
        const { email } = decoded;

        console.log('Email from Token:', email);
        console.log('Email from Query:', req.query.email);

        if (email === req.query.email) {
            next();
        } else {
            return res.status(403).send({ message: 'Unauthorized' });
        }
    } catch (err) {
        return next('Private Api');
    }
};

export default verifyToken;
