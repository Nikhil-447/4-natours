const AppError = require('./../utils/appError');
const Tour = require('./../models/tourModel');

// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//    const features = new APIFeatures(Tour.find(), req.query)
//    .filter()
//    .sort()
//    .limitfileds()
//    .paginate()

//   const tours = await features.query;

//   res.status(200).json({
//     status: 'Success',
//     results: tours.length,
//     data: {
//        tours
//   }
//   });
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//     tour: newTour,
//     }
//   });
// });
exports.createTour = factory.createOne(Tour);

// exports.updateTour =  catchAsync(async (req, res, next) => {

//    const tour = await Tour.findByIdAndUpdate(req.params.id , req.body, {
//     new:true,
//     runValidators:true
//    })
//    if(!tour){
//     return next(new AppError('No Tour found with that ID!', 404))
//    }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     },
//   })
// });

//Replace older delete with new factory function
//Do not update passwords with this since only admin can do that

exports.updateTour = factory.updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id)
//   if(!tour){
//   return next(new AppError('No Tour found with that ID!', 404))
//  }
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

//Replace older delete with new factory function
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), //Date Format year-month-day
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStats: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStats: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  //use destructuring to get all params
  //tours-within/:distance/centre/latlng/unit/:unit'
  //tours-within/333/centre/-12.831985, 75.271165/unit/mi'
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide lattitue and longitude in the format lat, lng',
        400
      )
    );
  }

  //include filter objects
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centreSphere: [lng, lat] } },
  });

  res.stats(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

const multiplier = unit == 'mi' ? 0.000621371 : 0.001;  
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide lattitue and longitude in the format lat, lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lat * 1, lng * 1],
        },
        distanceField: 'distance',
        distanceMultiplier:'multiplier'
      },
    },
    {
      $project:{
        distance:1,
        name:1
      }
    }
  ]);

  res.stats(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
