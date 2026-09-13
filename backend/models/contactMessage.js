const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    issue: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const ContactMessage = mongoose.model("ContactMessage", ContactMessageSchema);
module.exports = ContactMessage;

