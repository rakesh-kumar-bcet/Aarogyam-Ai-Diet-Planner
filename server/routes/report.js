const express = require("express");
const PDFDocument = require("pdfkit");
const router = express.Router();

router.post("/download", (req, res) => {
  const {
    bmi,
    calories,
    category,
    dietPlan,
    weeklyDiet,
    workoutPlan,
    avoid,
    prefer,
    warnings
  } = req.body;

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=DietReport.pdf");

  doc.pipe(res);

  // Title
  doc.fontSize(20).text("Personalized Diet & Workout Report", { align: "center" });
  doc.moveDown();

  // Basic Info
  doc.fontSize(14).text(`BMI: ${bmi} (${category})`);
  doc.text(`Daily Calories: ${calories} kcal`);
  doc.moveDown();

  // Warnings
  if (warnings && warnings.length > 0) {
    doc.fontSize(12).text("Important Notes:");
    warnings.forEach(w => doc.text(`- ${w}`));
    doc.moveDown();
  }

  // Daily Diet
  if (dietPlan) {
    doc.fontSize(14).text("Daily Diet Plan:");
    doc.fontSize(12);
    doc.text(`Breakfast: ${dietPlan.breakfast}`);
    doc.text(`Lunch: ${dietPlan.lunch}`);
    doc.text(`Snacks: ${dietPlan.snacks}`);
    doc.text(`Dinner: ${dietPlan.dinner}`);
    doc.moveDown();
  }

  // Weekly Diet
  if (weeklyDiet && Object.keys(weeklyDiet).length > 0) {
    doc.fontSize(14).text("Weekly Diet Variations:");
    doc.fontSize(12);
    Object.entries(weeklyDiet).forEach(([day, meal]) => {
      doc.text(`${day.charAt(0).toUpperCase() + day.slice(1)}: ${meal}`);
    });
    doc.moveDown();
  }

  // Workout Plan
  if (workoutPlan && workoutPlan.length > 0) {
    doc.fontSize(14).text("Workout Plan:");
    doc.fontSize(12);
    workoutPlan.forEach(w => doc.text(`- ${w}`));
    doc.moveDown();
  }

  // Foods to Avoid
  if (avoid && avoid.length > 0) {
    doc.fontSize(14).text("Foods to Avoid:");
    doc.fontSize(12);
    avoid.forEach(a => doc.text(`- ${a}`));
    doc.moveDown();
  }

  // Preferred Foods
  if (prefer && prefer.length > 0) {
    doc.fontSize(14).text("Preferred Foods:");
    doc.fontSize(12);
    prefer.forEach(p => doc.text(`- ${p}`));
    doc.moveDown();
  }

  // Disclaimer
  doc.fontSize(10).text("Disclaimer: This report provides general guidance. Consult a healthcare professional for personalized advice.", { align: "center" });

  doc.end();
});

module.exports = router;
