const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();
app.set('view engine','pug');

//1) Middlewares
//console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV ==='development'){
  app.use(morgan('dev'));

}

app.use(express.json());
app.use(express.static(`${__dirname}/starter/public`))

// app.use((req, res, next) =>{
//   console.log('Hello From the Middleware');
//   next();
//   });

  app.use((req, res, next) =>{
    req.requestTime = new Date().toISOString();
    //console.log(req.headers);
    next();
  })

//ROUTES

app.use('/api/v1/tours/' , tourRouter );
app.use('/api/v1/users/' , userRouter );
app.use('/api/v1/reviews/' , reviewRouter);
app.use('/api/v1/booking/' , bookingRouter);


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find the ${req.originalUrl} on this server!`, 404));
});

//ERROR Handling Middleware
app.use(globalErrorHandler);

module.exports = app;