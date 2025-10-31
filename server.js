import app from './app'
import db from './models'

const { sequelize } = db;

const port = 5000;

app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
    if(sequelize.authenticate()) {
        console.log('authenticated')
    }
})