const AppError = require("./../utils/appError");

const handleCastErrorDB = err => {
  const message =`Invalid ${err.path}: ${err.value}!`;
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err =>{
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value: ${value}. Please use another value!`

  return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token!.. please try again', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Try with new token', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status:err.status,
    error: err,
    message: err.message,
    stack : err.stack
  })
}

const sendErrorProd = (err, res) => {
// Operational, trused error : send message to client
  if(err.isOperational){
    res.status(err.statusCode).json({
      status:err.status,
      message: err.message
    })
  } 
  // Programming or Unknown error: we do not want to leak to client
  else{

    //1. Log the error 
    console.error(' 😭 ERROR 🔥', err)
    //2. Send Generic Message to client
    res.status(500).json({
      status:'error',
      message:'Something went very wrong!'
    })
  }
 
}


module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500 ;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
      sendErrorDev(err, res);
    } 
    else if(process.env.NODE_ENV === 'production'){
      let error = { ...err};
      if(error.name === 'CastError')  error = handleCastErrorDB(error);
      if(error.code === 11000) error = handleDuplicateFieldsDB(error);
      if(error.name === 'JsonWebTokenError') error = handleJWTError();
      if(error.name ==='TokenExpiredError') error = handleJWTExpiredError();
      
      sendErrorProd(error, res);
    }
    // Send JSON response for all errors
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
    
  }