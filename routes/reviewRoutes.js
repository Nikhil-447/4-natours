const express = require('express');
const reviewController = require('./../controllers/reviewController');

const router = express.Router({mergeParams:true});

const authController = require('./../controllers/authController');

//POST/tour/23idgh/reviews
//POST/reviews/23idgh

router.use(authController.protect);

router
.route('/')
.get(reviewController.getAllreviews)
.post(
    authController.restrictTo('user'),
    reviewController.createReview,
    reviewController.setTourUserIds
);

router
.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('user','admin'),reviewController.updateReview)
.delete(authController.restrictTo('user','admin'),reviewController.deleteReview);

module.exports = router;

