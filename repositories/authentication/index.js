const express = require('express');
const cors = require('cors');

const mongoose = require('mongoose');

const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('./swagger.json');

const dotenv = require('dotenv');
dotenv.config()

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

//import routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');

  
//Swagger documentation setup  
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerJsDoc));

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECT, 
    {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Middleware
app.use(express.json()); // Allows us to use JSON in our requests

//route middlewares
// This is a middleware that will be used for all routes that start with /api/auth
app.use('/api/auth', authRoute); 
// This is a middleware that will be used for all routes that start with /api/user
app.use('/api/users', userRoute); 

app.listen(port, () => console.log(`Example app listening on port ${port}!`));