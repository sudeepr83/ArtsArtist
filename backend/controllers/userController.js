const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const User = require("../models/userModel")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail.js")
const crypto = require('crypto')
const cloudinary = require('cloudinary')

//Registering a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale"
  })
  const { name, email, password, phoneNumber } = req.body;

  const user = await User.create({
    name, email, password, phoneNumber,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url
    }
  })

  sendToken(user, 200, res)

})

//Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});



//Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new ErrorHandler("User Not Found", 404))
  }

  //Get ResetPassword Token
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`

  const message = `Your Password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`

  try {
    await sendEmail({
      email: user.email,
      subject: `Arts-Artist Password Recovery`,
      message
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`
    })
  }
  catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpired = undefined;

    await user.save({ validateBeforeSave: false })

    return next(new ErrorHandler(error.message, 500))
  }

})

//Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpired: { $gt: Date.now() }
  })

  if (!user) {
    return next(new ErrorHandler("Reset Password Token Is invalid or has been expired", 400))
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match with confirm Password", 400))
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpired = undefined;

  await user.save()

  sendToken(user, 200, res)
})

//Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  res.status(200).json({
    success: true,
    user,
    message: "Get User Details Fetched Successfully"
  })
})

//Update User Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password")

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old Password is Incorrect"))
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400))
  }

  user.password = req.body.newPassword;
  await user.save()

  sendToken(user, 200, res)
})

//Update Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber
  }

  //We will add cloudinary later
  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId)

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale"
    })

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,

  })
})

//Get All Users -- Admin
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const user = await User.find({});
  if (!user) {
    return next(new ErrorHandler("Users Not Found"))
  }

  res.status(200).json({
    success: true,
    user,
    message: "All Users fetched successfully"
  })
})

//Get Single User -- Admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`))
  }

  res.status(200).json({
    success: true,
    user,
    message: "User Details Fetched Successfully"
  })
})

//Update User Role -- Admin
exports.updateRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  }


  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true
  })
})

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`))
  }

  const imageId = user.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId)

  await user.remove()

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully"
  })
})