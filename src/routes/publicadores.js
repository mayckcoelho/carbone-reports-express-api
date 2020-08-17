const express = require('express');

const router = express.Router();

const PublicadorController = require('../controllers/PublicadorController');

router.get('/cartao/:id', PublicadorController.download);
router.get('/', PublicadorController.list);
router.get('/:id', PublicadorController.listOne);
router.post('/', PublicadorController.create);
router.put('/:id', PublicadorController.update);
router.delete('/:id', PublicadorController.delete);

module.exports = router;