const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const AppError = require('./../utils/appError');
const Tour = require('./../models/tourModel');

// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async(req,res,next) =>{

    //1. GEt the currently booked Tour
const tour = await Tour.findById(req.params.tourId);

    //2. Create Checkout session
stripe.checkout.session.create({

})
    //3. Send it to Client
    res.status(200).json({
        result:'success',
        session
    })
})

exports.createBookingCheckout = (req, res, next)=>{
const {tour, user, price} = req.query;

if(!tour && !user && !price) return next();
}