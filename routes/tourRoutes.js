const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');
// using Destruturing
// const {getAllTours,createTour,getTour,updateTour,deleteTour} =require('./../controllers/tourController');

const router = express.Router();


//POST/tour/23idgh/reviews
//GET/tour/23idgh/reviews
//GET/tour/23idgh/reviews/7643yrehrekk

// router
// .route('/:tourId/reviews')
// .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
// )

router.use('/:tourId/reviews',reviewRouter)

//Aliasing 
router
.route('/top-5-cheap')
.get(tourController.aliasTopTours, tourController.getAllTours);

router
.route('/tour-stats')
.get(tourController.getTourStats);

router
.route('/monthly-plan/:year')
.get(authController.protect, authController.restrictTo('admin', 'lead-guide','guide'),tourController.getMonthlyPlan);

//for handling Geospacial quries
router
.route('/tours-within/:distance/centre/latlng/unit/:unit')
.get(tourController.getToursWithin)

router
.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances);

router
.route('/')
.get(tourController.getAllTours)
.post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.patch(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.updateTour)
.delete(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour);

//POST/tour/23idgh/reviews
//GET/tour/23idgh/reviews
//GET/tour/23idgh/reviews/7643yrehrekk

// router
// .route('/:tourId/revies')
// .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
// )

module.exports = router;