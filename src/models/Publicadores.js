const mongoose = require('mongoose');

const Publicador = new mongoose.Schema({
    nome: {
        type: String,
        trim: true,
        required: [true, 'Nome não informado!'],
    },
    data_nascimento: {
        type: Date,
        required: [true, 'Data de Nascimento não Informada']
    },
    data_batismo: {
        type: Date
    },
    sexo: {
        type: String,
        enum: ['F', 'M'],
        default: 'M',
        required: [true, "Gênero não informado!"]
    },
    grupo: {
        type: String,
        enum: ['O', 'U'],
        default: 'O',
        required: [true, "Grupo de Esperança não informado!"]
    },
    privilegio: {
        type: String,
        enum: ['A', 'S', 'P', 'R', 'M']
    },
    status: {
        type: String,
        enum: ['A', 'I', 'M'],
        default: 'A',
        required: [true, "Status não informado!"]
    },
    id_grupo: { type: mongoose.Schema.Types.ObjectId, ref: "Grupo" }
}, {
    timestamps: true
});

module.exports = mongoose.model('Publicador', Publicador);