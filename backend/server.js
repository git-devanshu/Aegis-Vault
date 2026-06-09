const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectToDB } = require('./configs/dbConfig');

// import routers
const {ssRouter} = require('./security-service/router');
const {configRouter} = require('./configuration-service/router');
const {pmRouter} = require('./password-manager/router');
const {alRouter} = require('./accounts-layer/router');
const {emRouter} = require('./expense-manager/router');
const {imRouter} = require('./investment-manager/router');
const {checkAuthorization} = require('./middlewares/checkAuthorization');

const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded());


// database connection
connectToDB();


// use routers
app.use('/api/ss', ssRouter);
app.use('/api/config', configRouter);
app.use('/api/pm', pmRouter);
app.use('/api/al', alRouter);
app.use('/api/em', emRouter);
app.use('/api/im', imRouter);


// health check APIs
app.get('/api/health', (req, res) =>{
    res.status(200).send('OK');
});

app.get('/api/health/secure', checkAuthorization, (req, res) =>{
    res.status(200).send('OK');
})


app.listen(process.env.PORT, ()=>{
    console.log('Server is listening on PORT', process.env.PORT);
});