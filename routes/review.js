const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");  
const Listing = require("../models/listing.js");  
const {isLoggedIn} = require("../middleware.js");


const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
       let errMsg = error.details.map((el)=>el.message).join(",");
       throw new ExpressError(400,errMsg);
    } else{
        next();
    }
}; 

router.post("/",isLoggedIn, validateReview, wrapAsync(async (req, res) => {

    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created !")
    res.redirect(`/listings/${listing._id}`);
}));

// delete review route

router.delete("/:reviewId",isLoggedIn, wrapAsync(async (req, res) => {

    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review  Deleted!")
    res.redirect(`/listings/${id}`);
}));

module.exports = router;