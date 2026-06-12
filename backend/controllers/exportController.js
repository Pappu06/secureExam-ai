const ExcelJS = require("exceljs");
const Result = require("../models/Result");

const exportResultsExcel = async (
  req,
  res
) => {

  try {

    const results =
      await Result.find({
        exam: req.params.examId,
      })
      .populate(
        "student",
        "name email"
      )
      .populate(
        "exam",
        "title"
      );

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        "Results"
      );

    worksheet.columns = [
      {
        header: "Student Name",
        key: "name",
        width: 30,
      },
      {
        header: "Email",
        key: "email",
        width: 35,
      },
      {
        header: "Exam",
        key: "exam",
        width: 25,
      },
      {
        header: "Score",
        key: "score",
        width: 15,
      },
    ];

    results.forEach((result) => {

      worksheet.addRow({
        name:
          result.student?.name,
        email:
          result.student?.email,
        exam:
          result.exam?.title,
        score:
          result.score,
      });

    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=results.xlsx`
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  exportResultsExcel,
};