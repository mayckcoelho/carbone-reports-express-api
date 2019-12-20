const User = require('../models/User');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');


class UserController {
    async list (req, res, next) {
        const limit = req.query.limit || 2
        const offset = req.query.offset || 0

        const filter = { }
        if (req.query.name)
            filter['name'] = new RegExp(req.query.name, "i")

        if (req.query.email)
            filter['email'] = new RegExp(req.query.email, "i")

        await User.find(filter)
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .exec(function (err, userInfo) {
            if (err) {
                next(err);
            } else { 
                User.countDocuments(filter, function(err, count) {
                    res.status(200).json({ data: userInfo, total: count });
                })
            }
        });
    }

    async listOne(req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({status:"error", message: "Um ID para busca deve ser informado!" });
        } else {
            await User.findById(req.params.id, function (err, userInfo) {
                if (err) {
                    next(err);
                } else {
                    if (userInfo)
                        res.status(200).json(userInfo);
                    else
                        res.status(400).json({status:"error", message: "Usuário não encontrado!" })
                }
            });
        }
    }

    async create (req, res, next) {
        await User.findOne({
            email:req.body.email 
        }, async function(err, userInfo) {
            if (err) {
                next(err);
            } else if (userInfo != null) {
                res.status(400).json({status:"error", message: "Um usuário com este email já esta cadastrado!" });
            } else {
                await User.create(req.body, function (err, userInfo) {
                    if (err) 
                        next(err);
                    else
                        res.json(userInfo);
                });
            }
        });
    }

    async update (req, res, next) {
        await User.findOne({
            email:req.body.email,
            _id: { $ne: req.params.id }
        }, async function(err, userInfo) {
            if (req.params.id == null) {
                res.status(400).json({status:"error", message: "Um ID para alteração deve ser informado!" });
            } else {
                if (err) {
                    next(err);
                } else if (userInfo != null) {
                    res.status(400).json({status:"error", message: "Um usuário com este email já esta cadastrado!" });
                } else {
                    User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, userInfo){
                        if(err) {
                            next(err);
                        } else {
                            res.json(userInfo);
                        }
                    });
                }
            }
        });
    }

    async delete (req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({status:"error", message: "Um ID para exclusão deve ser informado!" });
        } else {
            await User.findByIdAndRemove(req.params.id, function(err) {
                if (err) {
                    next(err);
                } else {
                    res.json({status: "success"});
                }
            });
        }
    }

    async authenticate (req, res, next) {
        await User.findOne({
            email:req.body.email 
        }, function(err, userInfo) {
            if (err) {
                next(err);
            } else {
                if (userInfo != null && bcrypt.compareSync(req.body.password, userInfo.password)) {
                    const token = jwt.sign({id: userInfo._id}, req.app.get('secretKey'), { expiresIn: '1h' });
                    res.json({user: userInfo, token:token });
                } else {
                    res.status(404).json({status:"error", message: "Email/Senha inválido!" });
                }
            }
        });
    }
}

module.exports = new UserController();