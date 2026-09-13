const express = require("express");
const router = express.Router();

const ContactMessage = require("../models/contactMessage");

router.get("/contact", (req, res) => {
  res.status(200).json({ message: "Contact API is running." });
});

router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, issue } = req.body || {};

    if (!name || !email || !subject || !issue) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const doc = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      issue,
    });

    return res.status(201).json({
      message: "Contact message saved successfully.",
      id: doc._id,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unable to save contact message.",
    });
  }
});

module.exports = router;

