const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = new mongoose.Schema({
    name: {
        type: String,
        trim: true,  
        required: [true, 'Nome não informado!']
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'Email não informado!']
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'Senha não informada!']
    }
}, {
    timestamps: true
});

// hash user password before saving into database
User.pre('save', function(next){
    this.password = bcrypt.hashSync(this.password, saltRounds);
    next();
});

module.exports = mongoose.model('User', User);