const mongoose = require('mongoose');

const Relatorio = new mongoose.Schema({
    mesAno: {
        type: String,
        required: [true, 'Mês/Ano não informado!']
    },
    publicacoes: {
        type: Number,
        default: 0
    },
    videos: {
        type: Number,
        default: 0  
    },
    horas: {
        type: Number,
        default: 0
    },
    revisitas: {
        type: Number,
        default: 0
    },
    estudos: {
        type: Number,
        default: 0
    },
    obs: {
        type: String,
        trim: true
    },
    publicador: { type: mongoose.Schema.Types.ObjectId, ref: "Publicador" }
}, {
    timestamps: true
});

module.exports = mongoose.model('Relatorio', Relatorio);