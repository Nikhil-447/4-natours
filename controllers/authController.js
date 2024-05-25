const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');



const signToken = id =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:process.env.JWT_EXPIRES_IN});
}



const createSendToken = (user, statuscode, res) =>{

    const token = signToken(user._id);

    res.status(201).json({
        status: "success",
        token,
        data:{
            user
        }
    });

}

exports.signup = catchAsync(async(req,res,next) =>{
    // const newUser = await User.create(req.body);
    const newUser = await User.create({
        name : req.body.name,
        email :req.body.email,
        password: req.body.password,
        passwordConfirm : req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt,
        role: req.body.role
    });

    createSendToken(newUser, 201, res);
    
    next();
});

exports.login = catchAsync(async (req, res, next) =>{
    const { email , password} = req.body;


    // 1) Check if email and password exists
    if(!email || !password){
        return next(new AppError('Please provide email and password', 400));
    }


    //2) Check if user exists and password is correct
    const user = await User.findOne({email}).select('+password');
    //console.log(user);

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401));
    }

    //3) If everything is ok, send token to client
    createSendToken(user, 200, res);

    next();
});

//Implementation protect Middleware
exports.protect = catchAsync(async(req, res, next) =>{
//1. Get token and check if its there
let token;
if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];

}

if(!token){
    return next(new AppError('You are not logged in...! Please login to get access.',401));
}

//2.Verification: Validate Token Verification
//using built in util module. convert call back based fun to promise based fun
const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//3. check if user trying to access exists
const freshUser = await User.findById(decode.id);
if(!freshUser){
    return next(new AppError('The user belonging to this token does not exists.. try with diffeent user', 401));
}

//4. If user changed password after Token was issued
if(freshUser.changedPasswordAfter(decode.iat)){
    return next(new AppError('user Password changed recently, please login again', 401));
}

//5. If all above 4 conditions passed then only the next middleware called that is access to getAllTours
req.user = freshUser;

// SO GRANT ACCESS to PROTECTED ROUTES

next();
});

exports.restrictTo =(...roles) =>{
return (req, res, next) => {
    //rolses: admin, lead-guide
    if(! roles.includes(req.user.role)){
        return next(new AppError('You do not have permission to perform this action',403));
    }
    next();
}
}

exports.forgotPassword =catchAsync(async (req, res, next)=>{

    //1. Get User Based on Posted Email
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new AppError('There is no user with this email address.',404));
    }

    //2. Generate the Random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave : false});

//3. send it to user's email
const resetURL =`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

const message= `Forgot your password? Submit a Patch request to ${resetURL}\nIf your didn't please ignore this email`;

try{
    await sendEmail({
        email:user.email,
        subject:'Your password Reset Token(valid for 10 mins)',
        message
    });
    res.status(200).json({
        status:"Success",
        message:"Token sent to your email address"
    });
} catch(err){
 user.createPasswordResetToken = undefined;
 user.passwordResetExpires = undefined;
 await user.save({validateBeforeSave : false});

 return next(new AppError('There was an error sending an email! please try again', 500));
}

next();
});

exports.resetPassword = catchAsync(async(req, res, next)=>{

//1. Get user based on Token
const hashedToken = crypto
.createHash('sha256')
.update(req.params.token)
.digest('hex');

const user = await User.findOne({
    PasswordResetToken:hashedToken, 
    passwordResetExpires:{ $gt: Date.now() }
});

    //2. If token has not expired and there is a user, set new password
if(!user){
    return next(new AppError('Token is invalid or has expired', 400));
}
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;

await user.save();


    //3. Update changedPasswordAt property for the user


    //4. Log the user in, send JWT to client
    createSendToken(user, 200, res);


});   



//When user logged in and decides to change/update his password even though not forgotten

exports.updatePassword = catchAsync(async(req, res, next) =>{
        
 //1.Get user from Collection
const user = await User.findById(req.body.id).select('+password');
 //2. Check if posted password is correct
if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){

        return next(new AppError('Your current password is wrong!', 401));
}
 //3.If So update the password
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
await user.save();

//user.findByIdAndUpdate will not work as Intended.. Mongoose doesn't store objects in memory

 //4.Log user In, send JWT
 createSendToken(user, 200, res);

    })



