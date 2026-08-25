import mongoose from "mongoose";

const timeSessionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    entryType: {
      type: String,
      enum: ["timer", "manual"],
      required: true,
    },

    start: {
      type: Date,
      required: function () {
        return this.entryType === "timer";
      },
    },

    end: {
      type: Date,
      required: function () {
        return this.entryType === "timer";
      },
    },

    hours: {
      type: Number,
      required: function () {
        return this.entryType === "manual";
      },
      min: 0,
    },

    notes: {
      type: String,
    },

    billed: {
      type: Boolean,
      default: false,
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate hours automatically for timer sessions
timeSessionSchema.pre("save", function (next) {
  if (this.entryType === "timer") {
    if (this.end <= this.start) {
      return next(
        new Error("End time must be after start time")
      );
    }

    const ms = this.end - this.start;

    this.hours = ms / (1000 * 60 * 60);
  }

  next();
});

const TimeSession = mongoose.model(
  "TimeSession",
  timeSessionSchema
);

export default TimeSession;