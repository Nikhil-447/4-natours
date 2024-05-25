const fs = require('fs');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const { error } = require('console');
const catchAsync = require('../utils/catchAsync');
const sharp = require('sharp');

//configuring multer storage
// const multerStorage = multer.diskStorage({
//   destination:(req, file, cb) =>{
//     cb(null, 'public/img/users');
//   },
//   filename:(req, file, cb) =>{
//     // user-id-timestamp.file extenstion
//     //user-gd753763nfh-1233355553.jpeg
//     //Extract FIle Name using "mimetype" it looks normally like image/jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.body.id}-${Date.now()}.${ext}`);
//   }  
// })
const multerStorage = multer.memoryStorage();

//configuring multer filter-- filer out files which are not images
const multerFilter = (req, file, cb) =>{
if(file.mimetype.startsWith('image')){
  cb(null, true);
}else{
  cb(new AppError('Not an Image!, please upload only Images!', 404), false);
}
}

const upload = multer({
  storage:multerStorage,
fileFilter:multerFilter
});

exports.uploadUserPhoto =upload.single('photo');

//Middleware to Image processing
exports.resizeUserPhoto = (req,res,next) =>{
  if(!req.file){
    return next();
  }
  req.file.filename = `user-${req.body.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
  .resize(500 ,500)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`/public/image/users/${req.file.filename}`);

  next();

}

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers =(req, res)=>{
//     res.status(500).json({
//       status:'Error',
//       message:"This Route is not yet defined!.."
//     })
//   }
  
  exports.createUser =(req, res)=>{
    res.status(500).json({
      status:'Error',
      message:"This Route is not yet defined!Please use signup instead"
    })
  }

  exports.getMe =(req,res,next)=>{
    req.params.id = req.user.id;
    next();
  }


  exports.updateMe = catchAsync(async(req,res,next) =>{

    console.log(req.file);
    console.log(req.body);
    //1. if user tries to update password, Create Error 
 if(req.body.password || req.body.passwordConfirm){
  return next(new AppError('This route is not for password updates! .Please use updateMyPassword',404));
 }

  //2.filter out unwated fileds that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if(req.file){
    filteredBody.photo = req.file.filename;
  }

//3. Update User document
const updatedUser = await User.findByIdAndUpdate(req.user.id ,filteredBody, {
  new: true,
  runValidators: true
});

//If not simply update data
res.status(200).json({
  status:"success",
  data: updatedUser
})
  });
  // exports.getUser =(req, res)=>{
  //   res.status(500).json({
  //     status:'Error',
  //     message:"This Route is not yet defined!.."
  //   })
  // }
  exports.getUser = factory.getOne(User);

  // exports.updateUser =(req, res)=>{
  //   res.status(500).json({
  //     status:'Error',
  //     message:"This Route is not yet defined!.."
  //   })
  // }

  //Do not update passwords with this since only admin can do that
  exports.updateUser = factory.deleteOne(User);
  
  // exports.deleteUser =(req, res)=>{
  //   res.status(500).json({
  //     status:'Error',
  //     message:"This Route is not yet defined!.."
  //   })
  // }
exports.deleteUser = factory.deleteOne(User);


