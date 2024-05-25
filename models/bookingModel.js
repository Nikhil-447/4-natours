const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    //We keep Parent Referencing here..
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour', //parent referencing from Tour
        required:[true, 'Booking must belong to a Tour!']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',//parent referencing from Tour
        required:[true, 'Booking must belong to a User!']
    },
    price:{
        type:Number,
        required:[true, 'Booking must have a price!']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    paid:{
        type:Boolean,
        default:true
    }
});
bookingSchema.pre(/^find/, function(next){
    this.populate('user').populate({
        path:'tour',
        select:'name'
    })
})



const Booking = mongoose.model('Booking',bookingSchema);
module.exports = Booking;