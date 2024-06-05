const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const db = require('./queries');
const flash = require('connect-flash');


const app = express();
const port = 3000;

//rewquire route modules
const userRouter = require('./routes/userRoutes');
const orderRouter = require('./routes/orderRoutes');
const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const cartRouter = require('./routes/cartRoutes');
const paymentRouter = require('./routes/paymentRoutes');


// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Session configuration
app.use(session({
  secret: 'secret', // Change this to a more secure secret in production
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
// Initialize passport
app.use(passport.initialize());
app.use(passport.session());


// Routes setup
app.use('/api/users', userRouter);
//app.use('/api/orders', orderRouter);
//app.use('/api/products', productRouter);
//app.use('/api/categoires', categoryRouter);
//app.use('/api/carts', cartRouter);
//app.use('/api/payments', paymentRouter);



app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
