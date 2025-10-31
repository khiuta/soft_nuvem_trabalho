import express from 'express';

import bookRoutes from './routes/management/bookRoutes'
import studentRoutes from './routes/student/studentRoutes'
import managerRoutes from './routes/management/managerRoutes'
import loanRoutes from './routes/management/loanRoutes'

class App {
    constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
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