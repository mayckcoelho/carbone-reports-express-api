const Publicador = require('../models/Publicadores');

class PublicadorController {
    async list (req, res, next) {
        const limit = req.query.limit || 10
        const offset = req.query.offset || 0

        const filter = { }
        if (req.query.nome)
            filter['nome'] = new RegExp(req.query.nome, "i")

        await Publicador.find(filter)
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .exec(function (err, publicadorInfo) {
            if (err) {
                next(err);
            } else { 
                Publicador.countDocuments(filter, function(err, count) {
                    res.status(200).json({ data: publicadorInfo, total: count });
                })
            }
        });
    }

    async listOne(req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({status:"error", message: "Um ID para busca deve ser informado!" });
        } else {
            await Publicador.findById(req.params.id, function (err, publicadorInfo) {
                if (err) {
                    next(err);
                } else {
                    if (publicadorInfo)
                        res.status(200).json(publicadorInfo);
                    else
                        res.status(400).json({status:"error", message: "Publicador não encontrado!" })
                }
            });
        }
    }

    async create (req, res, next) {
        await Publicador.create(req.body, function (err, publicadorInfo) {
            if (err) 
                next(err);
            else
                res.json(publicadorInfo);
        });
    }

    async update (req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({status:"error", message: "Um ID para alteração deve ser informado!" });
        } else {
            Publicador.findByIdAndUpdate(req.params.id, req.body, { new: true },function(err, publicadorInfo){
                if(err) {
                    next(err);
                } else {
                    res.json(publicadorInfo);
                }
            });
        }
    }

    async delete (req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({status:"error", message: "Um ID para exclusão deve ser informado!" });
        } else {
            await Publicador.findByIdAndRemove(req.params.id, function(err) {
                if (err) {
                    next(err);
                } else {
                    res.json({status: "success"});
                }
            });
        }
    }
}

module.exports = new PublicadorController();