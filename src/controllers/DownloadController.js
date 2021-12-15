const axios = require("axios");
const fs = require("fs");
const carbone = require("carbone");
const path = require("path");

class DownloadController {
  async downloadMinister(req, res, next) {
    const minister = req.body;

    const publicador = {
      ...minister,
      sex: minister.sex === "M" ? "Masculino" : "Feminino",
      hopeGroup: minister.hopeGroup === "O" ? "Outras ovelhas" : "Ungidos",
      privilege: minister.privilege
        .split(",")
        .map(
          (p) =>
            ({
              A: "Ancião",
              P: "Publicador",
              S: "Servo ministerial",
              R: "Pioneiro",
              M: "Missionário",
            }[p])
        )
        .join(", "),
      birthdate: new Date(minister.birthdate).toLocaleDateString("pt-BR"),
      baptism: minister.baptism
        ? new Date(minister.baptism).toLocaleDateString("pt-BR")
        : "",
      data: [],
    };

    const registers = await axios
      .get(`${process.env.BASE_URL}?minister=${minister.id}`, {
        headers: {
          Accept: "application/json",
          Authorization: req.headers["authorization"],
        },
      })
      .catch((err) =>
        res.status(400).json({
          status: "error",
          message: `Relatório não gerado! (${err})`,
        })
      );

    publicador.data = registers.data.data.map((r) => ({
      ...r,
      hours: r.timeValue === "H" ? `${r.hours}:00` : `00:${r.hours}`,
      date: new Date(r.date).toLocaleDateString("pt-BR").slice(3),
    }));

    const templatePath = path.resolve(
      __dirname,
      "..",
      "templates",
      "PersonalReportTemplate.xlsx"
    );
    carbone.render(templatePath, publicador, function (err, result) {
      if (err) {
        res
          .status(400)
          .json({ status: "error", message: `Relatório não gerado! (${err})` });
      }

      const dir = path.resolve(__dirname, "..", "reports");

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const filePath = path.resolve(
        __dirname,
        "..",
        "reports",
        `Cartao${Date.now()}.xlsx`
      );
      // write the result
      fs.writeFileSync(filePath, result);
      res.download(filePath);
    });
  }

  async downloadRegisters(req, res, next) {
    const filters = req.body;

    let queryParams = "";

    for (let filter in filters) {
      queryParams += `&${filter}=${filters[filter]}`;
    }

    const registers = await axios
      .get(`${process.env.BASE_URL}?${queryParams.slice(1)}`, {
        headers: {
          Accept: "application/json",
          Authorization: req.headers["authorization"],
        },
      })
      .catch((err) =>
        res.status(400).json({
          status: "error",
          message: `Relatório não gerado! (${err})`,
        })
      );

    const reportData = {
      data: [],
      totals: {
        publishers: 0,
        videos: 0,
        hours: 0,
        revisits: 0,
        studies: 0,
      },
    };

    reportData.data = registers.data.data.map((r) => {
      reportData.totals.publishers += r.publishers;
      reportData.totals.videos += r.videos;
      reportData.totals.hours += r.timeValue === "H" ? r.hours * 60 : r.hours;
      reportData.totals.revisits += r.revisits;
      reportData.totals.studies += r.studies;

      return {
        ...r,
        hours: r.timeValue === "H" ? `${r.hours}:00` : `00:${r.hours}`,
        date: new Date(r.date).toLocaleDateString("pt-BR").slice(3),
      };
    });

    reportData.totals.hours =
      ((reportData.totals.hours / 60) ^ 0) +
      ":" +
      ("0" + (reportData.totals.hours % 60)).slice(-2);

    const templatePath = path.resolve(
      __dirname,
      "..",
      "templates",
      "ReportTemplate.xlsx"
    );
    carbone.render(templatePath, reportData, function (err, result) {
      if (err) {
        res.status(400).json({
          status: "error",
          message: `Relatório não gerado! (${err})`,
        });
      }

      const dir = path.resolve(__dirname, "..", "reports");

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const filePath = path.resolve(
        __dirname,
        "..",
        "reports",
        `Relatorio${Date.now()}.xlsx`
      );
      // write the result
      fs.writeFileSync(filePath, result);
      res.download(filePath);
    });
  }
}

module.exports = new DownloadController();
