const Publicador = require('../models/Publicadores');

class PublicadorController {
    async list (req, res, next) {
        await Publicador.find({}, function (err, publicadorInfo) {
            if (err) {
                next(err);
            } else { 
                res.status(200).json(publicadorInfo);
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