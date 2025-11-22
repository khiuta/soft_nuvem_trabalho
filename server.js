import app from './app.js'
import db from './models/index.js'

const { sequelize } = db;

const port = 80;

app.listen(port, '0.0.0.0', async () => {
    await sequelize.authenticate();
    console.log(`Listening on port: ${port}`)
})