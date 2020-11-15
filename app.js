const express = require('express');
const cors = require('cors');
const restaurantsRoutes = require('./api/routes/restaurants');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/config.json');

const app = express();

app.use(express.json());
app.use('/restaurants', restaurantsRoutes);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// database connection
mongoose.connect('mongodb+srv://asilter:' + config.DEV.DB_PW + '@cluster0-1re2a.mongodb.net/prdydb?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', null);

app.get('/', (req, res) => {
    res.send('Hello World');
});

// PORT
const port = process.env.PORT || 5001
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

module.exports = app;