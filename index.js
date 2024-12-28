require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/User')
const cookieParser = require('cookie-parser');


const app = express();
app.use(cookieParser());


const databaseUrl = process.env.URL || 'mongodb://127.0.0.1:27017/assigment'


mongoose.connect(databaseUrl)
    .then(() => {
        console.log('database is connected');
    })
    .catch((err) => {
        console.log(err);
    })

const origin1 = 'https://userclient.netlify.app';
const origin2 = 'http://localhost:5173'
const corsOptions = {
    origin: origin1,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/api/users', userRoutes);



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
