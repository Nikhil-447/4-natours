const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { Model } = require('mongoose');
const APIFeatures = require('./../utils/apiFeatures');


//Generalization of all handler function
//works bcz of JavaScripts Closures :: Inner function gets access to variables of outer function even after outer function has already returned
exports.deleteOne = Model =>catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if(!doc){
    return next(new AppError('No Document found with that ID!', 404))
   }
    res.status(204).json({
      status: 'success',
      data: null
    });   
  });


exports.updateOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id , req.body, {
     new:true,
     runValidators:true
    })
    if(!tour){
     return next(new AppError('No Document found with that ID!', 404))
    }
   res.status(200).json({
     status: 'success',
     data: {
       date :doc
     },
   });
 });

 exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);


    res.status(201).json({
      status: 'success',
      data: {
      data: doc
      }
    });
  });

  exports.getOne =(Model, popOptions) =>catchAsync(async (req, res, next) => {
   let query = Model.findById(req.params.id);
   if(popOptions) query = query.populate(popOptions);
   const doc = await query;
    
//    const doc =  await Model.findById(req.params.id).populate('reviews');
    if(!doc){
     return next(new AppError('No Document found with that ID!', 404));
     console.log("tour is empty");
    }
     res.status(200).json({
      status:'success',
      data: {
        doc
      }
     })
  });

  exports.getAll =Model =>catchAsync(async (req, res, next) => {
    //To allow for Nested getReviews on Tour (hack)
    let filter ={};
    if(req.params.tourId) filter={tour:req.params.tourId};

    const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitfileds()
    .paginate()

  //  const doc = await features.query.explain();
  const doc = await features.query();

   res.status(200).json({
     status: 'Success',
     results: tours.length,
     data: {
        doc
   }
   }); 
 });