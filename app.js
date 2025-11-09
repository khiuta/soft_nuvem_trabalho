import express from 'express';
import cors from 'cors';

import bookRoutes from './routes/management/bookRoutes'
import studentRoutes from './routes/student/studentRoutes'
import managerRoutes from './routes/management/managerRoutes'
import loanRoutes from './routes/management/loanRoutes'

const allowedOrigins = [
    'http://localhost:3000'
]

const corsOptions = {
    origin: function (origin, callback) {
    // Permite requisições sem 'origin' (como apps mobile ou Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'A política de CORS para este site não permite acesso da Origem especificada.';
        return callback(new Error(msg), false);
    }
    return callback(null, true);
    }
};

class App {
    constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.app.use(cors(corsOptions));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(express.static('public'));
    }

    routes() {
        this.app.use('/book', bookRoutes);
        this.app.use('/student', studentRoutes);
        this.app.use('/manager', managerRoutes);
        this.app.use('/loan', loanRoutes);
    }
}

export default new App().app;