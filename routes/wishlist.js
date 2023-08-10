const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist')
const authUser = require('../middleware/authUser')
const { uuid } = require('uuidv4');
const logger = require('../logger');


router.get('/fetchwishlist', authUser, async (req, res) => {
    try {
        const wishlistData = await Wishlist.find({ user: req.user.id }).populate("productId")
        res.send(wishlistData)
    }
    catch (error) {
        res.status(500).send("Something went wrong")
    }
})
router.post('/addwishlist', authUser, async (req, res) => {

    try {
        const { _id } = req.body
        const user = req.header
        const findProduct = await Wishlist.findOne({ $and: [{ productId: _id }, { user: req.user.id }] })
        if (findProduct) {
            logger.error("Error: Product Already in Wishlist", {
                meta: {
                  httpMethod: "POST",
                  statusCode: 200,
                  httpPath: "/addwishlist",
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              }); 
            return res.status(400).json({ msg: "Product already in a wishlist" })
        }
        else {
            const wishlistData = new Wishlist({ user: req.user.id, productId: _id })
            const savedWishlist = await wishlistData.save()
            logger.info("Success: Product Added to Wishlist", {
                meta: {
                  httpMethod: "POST",
                  statusCode: 200,
                  httpPath: "/addwishlist",
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              }); 
            res.send(savedWishlist)
        }
    }
    catch (error) {
        logger.error("Error: Adding Product to Wishlist", {
            meta: {
              httpMethod: "POST",
              statusCode: 500,
              httpPath: "/addwishlist",
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          }); 
        res.status(500).send("Something went wrong")
    }
})
router.delete('/deletewishlist/:id', authUser, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Wishlist.findByIdAndDelete(id)
        logger.info("Success: Product Deleted from Wishlist", {
            meta: {
              httpMethod: "DELETE",
              statusCode: 200,
              httpPath: "/deletewishlist/:id",
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          }); 
        res.send(result)
    } catch (error) {
        logger.error("Error: Product Delete from Wishlist", {
            meta: {
              httpMethod: "DELETE",
              statusCode: 500,
              httpPath: "/deletewishlist/:id",
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          }); 
        res.status(500).send("Something went wrong")
    }



})
module.exports = router