const express = require('express');
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const authUser = require('../middleware/authUser');
const dotenv = require('dotenv');
const { deleteAllUserData } = require('../controller/deleteUser');
dotenv.config()

const { uuid } = require('uuidv4');
const logger = require('../logger');

// create a user :post "/auth",!auth
let success = false
router.post('/register', [

    body('firstName', 'Enter a valid name').isLength({ min: 1 }),
    body('lastName', 'Enter a valid name').isLength({ min: 1 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
    body('phoneNumber', 'Enter a valid phone number').isLength({ min: 10, max: 10 })


], async (req, res) => {

    res.c
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        
        return res.status(400).json({ error: errors.array() })
    }
    const { firstName, lastName, email, phoneNumber, password,isAdmin } = req.body

    try {
        let user = await User.findOne({ $or: [{ email: email }, { phoneNumber: phoneNumber }] });
        if (user) {
            logger.error("Error: User already exists", {
                meta: {
                  httpMethod: "POST",
                  statusCode: 500,
                  httpPath: "/register",
                  userDetails: email,
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              });
            return res.status(400).send({ error: "Sorry a user already exists" })
        }

        // password hashing
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt)

        // create a new user
        user = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: secPass,
            isAdmin
        })
        const data = {
            user: {
                id: user.id
            }
        }
        success = true
        const authToken = jwt.sign(data, process.env.JWT_SECRET)
        logger.info("Registration Successful", {
            meta: {
              httpMethod: "POST",
              statusCode: 200,
              httpPath: "/register",
              userDetails: email,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          });
        res.send({ success, authToken })
    }
    catch (error) {
        logger.error("Error: Internal Server Error", {
            meta: {
              httpMethod: "POST",
              statusCode: 500,
              httpPath: "/register",
              userDetails: email,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          });
        res.status(500).send("Internal server error")
    }
})


// login Route
router.post('/login', [

    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() })
    }

    const { email, password, } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            logger.error("Error: User not found", {
                meta: {
                  httpMethod: "POST",
                  statusCode: 404,
                  httpPath: "/login",
                  userDetails: email,
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              });
            return res.status(400).send({ success, error: "User not found" })
        }
        const passComp = await bcrypt.compare(password, user.password)
        if (!passComp) {
            logger.error("Error: Incorrect Credentials", {
                meta: {
                  httpMethod: "POST",
                  statusCode: 401,
                  httpPath: "/login",
                  userDetails: email,
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              });
            return res.status(400).send({ success, error: "Please try to login with correct credentials" })
        }

        const data = {
            user: {
                id: user._id
            }
        }

        const authToken = jwt.sign(data, process.env.JWT_SECRET)
        success = true
        logger.infor("Login Successful", {
            meta: {
              httpMethod: "POST",
              statusCode: 200,
              httpPath: "/login",
              userDetails: email,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          });
        res.send({ success, authToken })
    }
    catch (error) {
        logger.error("Error: User login failed", {
            meta: {
              httpMethod: "POST",
              statusCode: 500,
              httpPath: "/login",
              userDetails: email,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          });
        res.status(500).send("Internal server error002")
    }
}
);
// logged in user details

router.get('/getuser', authUser, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select("-password")
        success = true
        res.send(user)
        console.log(user.city);


    } catch (error) {
        res.status(400).send("Something went wrong")
    }
}
)


// update user details
router.put('/updateuser', authUser, async (req, res) => {
    const { userDetails } = req.body
    let convertData = JSON.parse(userDetails)
    try {
        const user = await User.findById(req.user.id)
        if (user) {
            let updateDetails = await User.findByIdAndUpdate(req.user.id, { $set: convertData })
            success = true
            logger.info("User Details Updated Successfully", {
                meta: {
                  httpMethod: "PATCH",
                  statusCode: 200,
                  httpPath: "/update",
                  userDetails: user.email,
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              });
            res.status(200).send({ success })
        }
        else {
            logger.error("Error: User Update Failed", {
                meta: {
                  httpMethod: "PATCH",
                  statusCode: 500,
                  httpPath: "/update",
                  userDetails: user.email,
                  traceId: uuid(),
                  spanId: uuid().substring(0, 6),
                  traceFlags: "01",
                },
              });
            return res.status(400).send("User Not Found")
        }
    } catch (error) {
        logger.error("Error: User Update Failed", {
            meta: {
              httpMethod: "PATCH",
              statusCode: 500,
              httpPath: "/update",
              userDetails: user.email,
              traceId: uuid(),
              spanId: uuid().substring(0, 6),
              traceFlags: "01",
            },
          });
        res.send("Something went wrong")
    }
})

// delete user and user data
router.delete('/delete/user/:userId', authUser, deleteAllUserData)
module.exports = router