const mongoose = require("mongoose");
const ejs = require("ejs");
const express = require("express");
const app = express();
const Mailjet = require("node-mailjet");

const router = express.router;

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE,
);

const bodyParser = require("body-parser");

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method}: ${req.path}`);
  next();
});

const mongoDBConnectionString =
  "mongodb+srv://SE12:CSH2024@cluster0.3g0sz23.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoDBConnectionString)
  .then(() => {
    console.log("MongoDB connection successful.");
  })
  .catch((err) => console.log("MongoDB connection error:", err));

// Schema and model for Appointment
const AppointmentSchema = new mongoose.Schema({
  client: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  email: { type: String, required: true },
  hairstyle: { type: String, required: true },
  description: { type: String, required: false },
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);

// Create a appointment
app.post("/appointments", async (req, res) => {
  const order = new Appointment({
    client: req.body.client,
    date: req.body.date,
    time: req.body.time,
    email: req.body.email,
    description: req.body.description,
    hairstyle: req.body.hairstyle,
    service_id: req.body.service_id,
  })
    .save()
    .then(() => {
      const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "djenabou.diallo24@compscihigh.org",
              Name: "Mariama Hair Braiding",
            },
            To: [
              {
                Email: req.body.email,
                Name: req.body.client,
              },
            ],
            Subject:
              "Your apponitment has been booked, " + req.body.client + "!",
            Variables: {
              name: req.body.client,
            },
            TextPart:
              "Hey" +
              req.body.client +
              ", Your appointment has been booked for" +
              req.body.hairstyle,
            HTMLPart:
              "<h3> Dear Customer " +
              req.body.client +
              " Thank you for booking. You are coming in for  : " +
              req.body.hairstyle +
              " .on " +
              req.body.date +
              " at " +
              req.body.time,
          },
        ],
      });

      request
        .then((result) => {
          console.log(result.body);
        })
        .catch((err) => {
          console.log(err.statusCode);
        });
      res.redirect("/appointments");
    });
});

//find a appoitment
app.get("/appointments", (req, res) => {
  Appointment.find()
    .populate()
    .then((data) => {
      res.status(200).render("appointment.ejs", { data: data });
    })
    .catch((error) => {
      console.error("Error", error);
      res.status(500).send("500 internal server error");
    });
});

// service: hairstyle,price
const ServiceSchema = new mongoose.Schema({
  hairstyle: { type: String, required: true },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number },
  image: { type: String, required: true },
});

const Service = mongoose.model("Service ", ServiceSchema);

// Create a service
app.post("/service", (req, res) => {
  const newService = new Service({
    hairstyle: req.body.hairstyle,
    minPrice: req.body.minPrice,
    maxPrice: req.body.maxPrice,
    image: req.body.image,
  });
  newService
    .save()
    .then((appoitment) => {
      res.status(200).json(appoitment);
    })
    .catch((error) => {
      console.error("Error", error);
      res.status(500).send("500 internal server error");
    });
});

app.patch("/service/:id", (req, res) => {
  const filter = { _id: req.params.id };
  const up = { minPrice: req.body.minPrice, maxPrice: req.body.maxPrice };

  Service.findOneAndUpdate(filter, up, { new: true })
    .then((update) => {
      res.status(200).json(update);
    })
    .catch((error) => {
      console.error("Error", error);
      res.status(500).send("500 internal server error");
    });
});

app.delete("/service/:id", (req, res) => {
  const filter = { _id: req.params.id };

  Service.findOneAndDelete(filter)
    .then((del) => {
      res.status(200).json(del);
    })
    .catch((error) => {
      console.error("Error", error);
      res.status(500).send("500 internal server error");
    });
});

app.get("/service", (req, res) => {
  Service.find()
    .then((data2) => {
      res.status(200).render("service.ejs", { data: data2 });
    })
    .catch((error) => {
      console.error("Error", error);
      res.status(500).send("500 internal server error");
    });
});

app.get("/500", (req, res) => {
  res.status(500).send("500 internal server error");
});

app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
