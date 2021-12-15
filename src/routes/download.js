const express = require("express");

const router = express.Router();

const DownloadController = require("../controllers/DownloadController");

router.post("/ministers", DownloadController.downloadMinister);
router.post("/registers", DownloadController.downloadRegisters);

module.exports = router;
