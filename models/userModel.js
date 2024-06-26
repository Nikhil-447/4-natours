const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please tell us your name']
    },
    email:{
        type: String,
        required:[true, 'Please enter your email ID'],
        unique:true,
        lowercase: true,
        validate:[validator.isEmail, 'Please enter a valid email']
    },
    photo: {
        type:String,
        default: 'default.jpeg'
    },
    role:{
           type:String,
           enum:['user', 'lead-guide', 'guide', 'admin'],
           default:'user'
    },
    password:{
        type:String,
        required:[true, 'Please provide a password'],
        minlength:8,
        select:false

    },
    passwordConfirm:{
        type:String,
        required:[true, 'Please confirm password'],
        validate:{
            //This works only for CREATE and SAVE!!!
            validator: function(el){
                return el === this.password;
            },
            message:'Passwords are not the same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires:Date

});
//Middleware

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password ,12);

    this.passwordConfirm = undefined;
    next();
});
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
return await bcrypt.compare(candidatePassword, userPassword);
}
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
if(this.passwordChangedAt){
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() /1000, 10);
    console.log(changedTimeStamp , JWTTimestamp);
    return JWTTimestamp < changedTimeStamp; // True
}
// FALSE means not changed
    return false;
}
userSchema.methods.createPasswordResetToken = function(){
const resetToken = crypto.randomBytes(32).toString('hex');
this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
this.passwordResetExpires = Date.now()+ 10 * 60* 1000;
return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;