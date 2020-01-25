const express = require('express');

const router = express.Router();

const RelatorioController = require('../controllers/RelatorioController');

router.get('/download', RelatorioController.download);
router.get('/', RelatorioController.list);
router.get('/:id', RelatorioController.listOne);
router.post('/', RelatorioController.create);
router.put('/:id', RelatorioController.update);
router.delete('/:id', RelatorioController.delete);

module.exports = router;