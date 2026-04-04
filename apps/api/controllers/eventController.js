const mongoose = require("mongoose");
const createEventModel = require("../../shared/models/eventModel");

const Event = createEventModel(mongoose);

// get latest events
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

// get one event by id
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: "fail",
        message: "No event found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        event,
      },
    });
  } catch (err) {
    next(err);
  }
};
