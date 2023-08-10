const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const authUser = require("../middleware/authUser");

const { uuid } = require('uuidv4');
const logger = require('../logger');

// get all cart products
router.get("/fetchcart", authUser, async (req, res) => {
    try {
        const cart = await Cart.find({ user: req.user.id })
            .populate("productId", "name price image rating type")
            .populate("user", "name email");
        res.send(cart);
    } catch (error) {
        logger.error("Error: Cart details failed", {
            meta: {
              httpMethod: "GET",
              statusCode: 500,
              httpPath: "/cart",
              userDetails: req.user.id,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          });   
        res.status(500).send("Internal server error");
    }
});

// add to cart

router.post("/addcart", authUser, async (req, res) => {
    try {
        const { _id, quantity } = req.body;
        const findProduct = await Cart.findOne({ $and: [{ productId: _id }, { user: req.user.id }] })
        if (findProduct) {
            logger.error("Error: Product Already in Cart", {
                meta: {
                  httpMethod: "POST",
                  statusCode: 409,
                  httpPath: "/addcart",
                  userDetails: req.user.id,
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              });  
            return res.status(409).json({ msg: "Product already in a cart" })
        }
        else {
            const user = req.header;
            const cart = new Cart({
                user: req.user.id,
                productId: _id,
                quantity,
            });
            const savedCart = await cart.save();
            logger.info("Successful: Product added to Cart", {
                meta: {
                  httpMethod: "POST",
                  statusCode: 200,
                  httpPath: "/addcart",
                  userDetails: req.user.id,
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              }); 
            res.send(savedCart);
        }
    } catch (error) {
        logger.error("Error: Adding Product to Cart", {
            meta: {
              httpMethod: "POST",
              statusCode: 500,
              httpPath: "/addcart",
              userDetails: req.user.id,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          }); 
        res.status(500).send("Internal server error");
    }
});

// remove from cart
router.delete("/deletecart/:id", authUser, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Cart.findByIdAndDelete(id)
        logger.info("Success: Product Deleted from Cart", {
            meta: {
              httpMethod: "DELETE",
              statusCode: 200,
              httpPath: "/deletecart",
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          }); 
        res.send(result);
    } catch (error) {
        logger.error("Error: Deleting Item from Cart", {
            meta: {
              httpMethod: "DELETE",
              statusCode: 500,
              httpPath: "/deletecart",
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          }); 
        res.status(500).send("Internal server error");
    }
});
module.exports = router;
