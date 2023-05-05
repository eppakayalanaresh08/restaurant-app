const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost/restaurants', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Create a Mongoose schema for restaurant
const restaurantSchema = new mongoose.Schema({
  name: String,
  city: String,
  menuItems: [
    {
      name: String,
      price: Number,
      couponCode: String,
    },
  ],
});

// Create a Mongoose model for restaurant
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Create a new Express.js app
const app = express();

// Parse incoming JSON requests
app.use(bodyParser.json());

// GET /restaurant/:restaurantId - Fetch a restaurant by restaurantId
app.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /restaurant - Create a new restaurant
app.post('/restaurant', async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /restaurant - Update an existing restaurant
app.put('/restaurant/:restaurantId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /restaurant/:restaurantId - Delete an existing restaurant
app.delete('/restaurant/:restaurantId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    await restaurant.remove();
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /restaurant/search - Fetch restaurants of a particular city, and have Menu Items also in the response, If `couponCode` is provided, it should filter only those menu items which are for that code.
app.post('/restaurant/search', async (req, res) => {
  try {
    const query = {
      city: req.body.city,
    };
    if (req.body.couponCode) {
      query['menuItems.couponCode'] = req.body.couponCode;
    }
    const restaurants = await Restaurant.find(query).populate('menuItems');
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Populate the database with
