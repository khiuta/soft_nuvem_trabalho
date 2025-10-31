import app from './app'
import db from './models'

const { sequelize } = db;

const port = 5000;

app.listen(port, async () => {
    await sequelize.authenticate();
    console.log(`Listening on port: ${port}`)
})