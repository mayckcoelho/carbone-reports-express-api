const Grupo = require('../models/Grupos');

class GrupoController {
    async list (req, res, next) {
        const limit = req.query.limit || 10
        const offset = req.query.offset || 0

        const filter = { }
        if (req.query.nome)
            filter['nome'] = new RegExp(req.query.nome, "i")
        
        if (req.query.responsavel)
            filter['responsavel'] = new RegExp(req.query.responsavel, "i")

        await Grupo.find(filter)
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .exec(function (err, grupoInfo) {
            if (err) {
                next(err);
            } else { 
                Grupo.countDocuments(filter, function(err, count) {
                    res.status(200).json({ data: grupoInfo, total: count });
                })
            }
        });
    }

    async listOne(req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({status:"error", message: "Um ID para busca deve ser informado!" });
        } else {
            await Grupo.findById(req.params.id, function (err, grupoInfo) {
                if (err) {
                    next(err);
                } else {
                    if (grupoInfo)
                        res.status(200).json(grupoInfo);
                    else
                        res.status(400).json({status:"error", message: "Grupo não encontrado!" })
                }
            });
        }
    }

    async create (req, res, next) {
        await Grupo.findOne({
            nome:req.body.nome
        }, async function(err, grupoInfo) {
            if (err) {
                next(err);
            } else if (grupoInfo != null) {
                res.status(400).json({status:"error", message: "Um grupo com este nome já esta cadastrado!" });
            } else {
                await Grupo.create(req.body, function (err, grupoInfo) {
                    if (err) 
                        next(err);
                    else
                        res.json(grupoInfo);
                });
            }
        });
    }

    async update (req, res, next) {
        await Grupo.findOne({
            nome:req.body.nome,
            _id: { $ne: req.params.id }
        }, async function(err, grupoInfo) {
            if (err) {
                next(err);
            } else if (grupoInfo != null) {
                res.status(400).json({status:"error", message: "Um grupo com este nome já esta cadastrado!" });
            } else {
                if (req.params.id == null) {
                    res.status(400).json({status:"error", message: "Um ID para alteração deve ser informado!" });
                } else {
                    Grupo.findByIdAndUpdate(req.params.id, req.body, { new: true },function(err, grupoInfo){
                        if(err) {
                            next(err);
                        } else {
                            res.json(grupoInfo);
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
            await Grupo.findByIdAndRemove(req.params.id, function(err) {
                if (err) {
                    next(err);
                } else {
                    res.json({status: "success"});
                }
            });
        }
    }
}

module.exports = new GrupoController();