const Relatorio = require('../models/Relatorios');

class RelatorioController {
    
    async list (req, res, next) {
        const limit = req.query.limit || 10
        const offset = req.query.offset || 0

        await Relatorio.find()
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .exec(function (err, relatorioInfo) {
            if (err) {
                next(err);
            } else { 
                Relatorio.countDocuments(filter, function(err, count) {
                    res.setHeader('x-total-count', count);
                    res.status(200).json(relatorioInfo);
                })
            }
        }).populate('publicador', 'nome');
    }

    async listOne(req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({status:"error", message: "Um ID para busca deve ser informado!" });
        } else {
            await Relatorio.findOne({ _id: req.params.id }, function (err, relatorioInfo) {
                if (err) {
                    next(err);
                } else {
                    if (relatorioInfo)
                        res.status(200).json(relatorioInfo);
                    else
                        res.status(400).json({status:"error", message: "Relatório não encontrado!" })
                }
            });
        }
    }

    async create (req, res, next) {
        await Relatorio.findOne({
            mesAno:req.body.mesAno,
            publicador: req.body.publicador,
            _id: { $ne: req.params.id }
        }, async function(err, relatorioInfo) {
            if (err) {
                next(err);
            } else if (relatorioInfo != null) {
                res.status(400).json({status:"error", message: "Um Relatorio com este Mês/Ano para este Publicador já esta cadastrado!" });
            } else {
                await Relatorio.create({...req.body }, function (err, relatorioInfo) {
                    if (err) 
                        next(err);
                    else
                        res.json(relatorioInfo);
                });
            }
        });
    }

    async update (req, res, next) {
        await Relatorio.findOne({
            mesAno:req.body.mesAno,
            publicador: req.body.publicador,
            _id: { $ne: req.params.id }
        }, async function(err, relatorioInfo) {
            if (err) {
                next(err);
            } else if (relatorioInfo != null) {
                res.status(400).json({status:"error", message: "Um Relatorio com este Mês/Ano para este Publicador já esta cadastrado!" });
            } else {
                if (req.params.id == null) {
                    res.status(400).json({status:"error", message: "Um ID para alteração deve ser informado!" });
                } else {
                    Relatorio.findByIdAndUpdate(req.params.id, {...req.body, id_publicador: req.params.idPub }, { new: true },function(err, relatorioInfo){
                        if(err) {
                            next(err);
                        } else {
                            res.json(relatorioInfo);
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
            await Relatorio.findByIdAndRemove(req.params.id, function(err) {
                if (err) {
                    next(err);
                } else {
                    res.json({status: "success"});
                }
            });
        }
    }
}

module.exports = new RelatorioController();