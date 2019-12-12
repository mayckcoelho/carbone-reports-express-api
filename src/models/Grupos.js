const mongoose = require('mongoose');

const Grupo = new mongoose.Schema({
    nome: {
        type: String,
        trim: true,
        required: [true, 'Nome não informado!']
    },
    responsavel: {
        type: String,
        trim: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Grupo', Grupo);