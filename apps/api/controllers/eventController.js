const mongoose = require("mongoose");
const createEventModel = require("../../shared/models/eventModel");

const Event = createEventModel(mongoose);

exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).limit(50);

    res.status(200).json({
      status: "success",
      results: events.length,
      data: {
        events,
      },
    });
  } catch (err) {
    next(err);
  }
};
