//review / rating / createdAt / ref to tour / ref to user

const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review:{
        type: String,
        required:[true, 'Review cannot be empty!']
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true, 'Review must belong to a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true, 'Review must belong to a user']
    }

},
{
    toJSON:{ virtuals:true },
    toObject:{ virtuals: true } 
})

reviewSchema.index({tour:1 , user:1}, {unique:true})

//Query Middeware
reviewSchema.pre(/^find/, function(next) {
// this.populate({
//     path:'tour',
//     select:'name'
// }).populate({
//     path:'user',
//     select:'name photo'
// })
this.populate({
    path:'user',
    select:'name photo'
});

    next();
})


reviewSchema.statics.calcAverageRatings = async function(tourId) {
     const stats = await this.aggregate([
        {
            $match:{tour:tourId}

        },
        {
            $group:{
                _id:'$tour',
                nRatings:{$sum:1},
                avgRating:{$avg : '$rating'}
            }
        }
    ])

    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:stats[0].nRatings,
            ratingsAverage:stats[0].avgRating
        });
    }else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity:0,
            ratingsAverage:4.5
        })
    }
  
        
};

reviewSchema.post('save', function(){
    //post middleware does not get access to next
//this points to current review
this.constructor.Review.calcAverageRatings(this.tour);

    //next();
})

//Tour.findByIdAndUpdate
//Tour.findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next){
this.rv = await this.findOne()

    next();
});

reviewSchema.post(/^findOneAnd/, async function(){
    await this.rv.constructor.calcAverageRatings(this.rv.tour);
    });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


//POST/tour/23idgh/reviews
//GET/tour/23idgh/reviews
//GET/tour/23idgh/reviews/7643yrehrekk