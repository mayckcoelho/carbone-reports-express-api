const express = require('express');

const router = express.Router();

const GrupoController = require('../controllers/GrupoController');

router.get('/', GrupoController.list);
router.get('/:id', GrupoController.listOne);
router.post('/', GrupoController.create);
router.put('/:id', GrupoController.update);
router.delete('/:id', GrupoController.delete);

module.exports = router;