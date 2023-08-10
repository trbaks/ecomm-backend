const express = require('express');
const router = express.Router();
const Review = require('../models/Review')
const authUser = require('../middleware/authUser')

const { uuid } = require('uuidv4');
const logger = require('../logger');
router.post('/fetchreview/:id', async (req, res) => {
    const { filterType } = req.body
    try {
        if (filterType === 'all') {
            const reviewData = await Review.find({ productId: req.params.id }).populate("user", "firstName lastName")
            res.send(reviewData)
        }
        else if (filterType === 'mostrecent') {
            const reviewData = await Review.find({ productId: req.params.id }).populate("user", "firstName lastName").sort({ createdAt: -1 })
            res.send(reviewData)
        }
        else if (filterType === 'old') {
            const reviewData = await Review.find({ productId: req.params.id }).populate("user", "firstName lastName").sort({ createdAt: 1 })
            res.send(reviewData)
        }
        else if (filterType === 'positivefirst') {
            const reviewData = await Review.find({ productId: req.params.id, }).populate("user", "firstName lastName").sort({ rating: -1 })
            res.send(reviewData)
        }
        else if (filterType === 'negativefirst') {
            const reviewData = await Review.find({ productId: req.params.id }).populate("user", "firstName lastName").sort({ rating: 1 })
            res.send(reviewData)
        }
        else {
            const reviewData = await Review.find({ productId: req.params.id }).populate("user", "firstName lastName")
            res.send(reviewData)
        }

    }
    catch (error) {
        res.status(500).send("Internal server error")
    }
})

router.post('/addreview', authUser, async (req, res) => {
    try {
        const { id, comment, rating } = req.body
        const user = req.header
        const findReview = await Review.findOne({ $and: [{ user: req.user.id }, { productId: id }] })
        if (findReview) {
            logger.error("Error: Already Reviewed the product", {
                meta: {
                  httpMethod: "POST",
                  statusCode: 409,
                  httpPath: "/addreview",
                  productId: id,
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              }); 
            return res.status(400).json({ msg: "Already reviewed that product " })
        }
        else {
            const reviewData = new Review({ user: req.user.id, productId: id, comment: comment, rating: rating })
            const savedReview = await reviewData.save()
            logger.info("Success: Review Added", {
                meta: {
                  httpMethod: "POST",
                  statusCode: 200,
                  httpPath: "/addreview",
                  productId: id,
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              }); 
            res.send({ msg: "Review added successfully" })
        }
    }
    catch (error) {
        logger.error("Error: Error adding Review", {
            meta: {
              httpMethod: "POST",
              statusCode: 500,
              httpPath: "/addreview",
              productId: id,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          }); 
        res.status(500).send("Something went wrong")
    }
})



router.delete('/deletereview/:id', authUser, async (req, res) => {
    const { id } = req.params
    try {
        let deleteReview = await Review.deleteOne({ $and: [{ user: req.user.id }, { _id: id }] })
        logger.info("Success: Review Deleted", {
            meta: {
              httpMethod: "DELETE",
              statusCode: 200,
              httpPath: "/deletereview/:id",
              productId: id,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          }); 
        res.send({ msg: "Review deleted successfully" })
    } catch (error) {
        logger.error("Error: Review Delete Failed", {
            meta: {
              httpMethod: "DELETE",
              statusCode: 500,
              httpPath: "/deletereview/:id",
              productId: id,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          }); 
        res.send({ msg: "Something went wrong,Please try again letter" })
    }

})



router.put('/editreview', authUser, async (req, res) => {
    const { id, comment, rating } = req.body

    const review = await Review.findById(id)
    try {
        if (review) {
            let updateDetails = await Review.findByIdAndUpdate(id, { $set: { rating: rating, comment: comment } })
            success = true
            logger.info("Success: Review Edited", {
                meta: {
                  httpMethod: "PATCH",
                  statusCode: 200,
                  httpPath: "/editreview/:id",
                  productId: id,
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              }); 
              
            res.status(200).send({ success, msg: "Review edited successfully" })
        }
        else {

            return res.status(400).send({ success, error: "User Not Found" })
        }
    } catch (error) {
        logger.error("Error: Review Edit", {
            meta: {
              httpMethod: "PATCH",
              statusCode: 500,
              httpPath: "/editreview/:id",
              productId: id,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          }); 
        res.send("Something went wrong")
    }
})
module.exports = router