const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    originalFileName: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    structuredResume: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    testResult: {
      testScore: {
        type: Number,
        required: false,
        default: null,
      },
      testFeedback: {
        type: String,
        required: false,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Resume", resumeSchema);
