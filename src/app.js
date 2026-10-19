const express = require("express");
const path = require("path");
const resumeRoutes = require("./routes/resume.routes");
const interviewRoutes = require("./routes/interview.routes");
const testRoutes = require("./routes/test.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/resume", resumeRoutes);
app.use("/interview", interviewRoutes);
app.use("/test", testRoutes);

// Render the Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Render the Upload page
app.get("/upload", (req, res) => {
  res.render("upload");
});

// Render the Error page
app.get("/error", (req, res) => {
  res.render("error", { message: req.query.message || "An unexpected error occurred." });
});

module.exports = app;
