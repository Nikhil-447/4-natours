const express = require('express');
const reviewController = require('./../controllers/reviewController');

const userControllers = require('./../controllers/userController');
const authController = require('./../controllers/authController');


const router = express.Router();
router
    .post('/signup', authController.signup)
    .post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Protect all routes after this middleware
router.use(authController.protect);

router.get('/me',userControllers.getMe, userControllers.getUser);
router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', userControllers.uploadUserPhoto, userControllers.resizeUserPhoto, userControllers.updateMe);

//All routes after this can be accessed by admins only
router.use(authController.restrictTo('admin'));

router
.route('/')
.get(userControllers.getAllUsers)
.post(userControllers.createUser)

router
.route('/:id')
.get(userControllers.getUser)
.patch(userControllers.updateUser)
.delete(userControllers.deleteUser)



module.exports = router;