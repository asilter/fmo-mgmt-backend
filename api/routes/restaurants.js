const express = require('express');
const cors = require('cors');
const router = express.Router();
const jwt = require('jsonwebtoken');
const RestaurantsService = require('../services/restaurants-service');
const config = require('../../config/config.json');

router.use(cors());


router.get("/find", (req, res, next) => {
    const restaurantsService = new RestaurantsService();
    console.log("req.body.base_uri:" + req.body.base_uri);
    restaurantsService.listRestaurants(req.body.base_uri).then(result => {
        console.log("get /find result:" + result);
        if (result.code === "001") {
            res.status(200).json({
                message: result.message,
                result: result.resultObject
            });
        } else {
            res.status(500).json({
                message: result.message
            });
        }
    }).catch(err => {
        res.status(500).json({
            message: err.message
        });
    });
});
