const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(
	cors({
		origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials:true,
	})
)
;
app.use(express.json());

// MongoDB connection
mongoose.connect('Apna url daalo/restaurant-booking').then(
  console.log("Database connection successfully established")
).catch((err)=>{
  console.log("Error connecting to Mongo");
  console.error(err);});

// Schema & Model
const bookingSchema = new mongoose.Schema({
  name: String,
  contact: String,
  guests: Number,
  date: Date,
});

const Booking = mongoose.model('Booking', bookingSchema);

// Routes
app.post('/api/bookings', async (req, res) => {
  const { name, contact, guests, date } = req.body;

  // Validate input fields
  if (!name || !contact || !guests || !date) {
    return res.status(400).send('Missing required fields');
  }

  try {
    // Check if a booking with the same name and contact already exists
    const existingBooking = await Booking.findOne({ name, contact });

    if (existingBooking) {
      return res.status(400).send('Booking already exists with the same name and contact');
    }

    // If no existing booking, create a new one
    const booking = new Booking(req.body);
    await booking.save();
    return res.status(201).json({
      success:true ,
      message:"booking successfully",

     });
  } catch (err) {
     return res.status(500).send('Error Saving Booking');
  }
});

app.get('/api/bookings', async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

// DELETE Route to remove a booking based on contact and name
app.delete('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;

  // Validate input fields
  if (!id) {
    return res.status(400).send('Missing required field: id');
  }

  try {
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).send('Booking not found');
    }

    return res.status(200).send('Booking successfully deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting booking');
  }
});


app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
