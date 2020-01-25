const Relatorio = require('../models/Relatorios');
const Publicador = require('../models/Publicadores');
const moment = require('moment')
const fs = require('fs');
const carbone = require('carbone');

class RelatorioController {

    async download(req, res, nexte) {
        const publicadores = req.query.publicador ? req.query.publicador.split(',') : []

        // filtra publicadores dos grupos
        const filterPublicadores = {}
        if (req.query.grupo || req.query.privilegio) {
            if (req.query.grupo)
                filterPublicadores["id_grupo"] = { $in: req.query.grupo.split(',') }

            if (req.query.privilegio)
                filterPublicadores['privilegio'] = new RegExp(req.query.privilegio, "i")

            const publicadorInfo = await Publicador.find(filterPublicadores);

            publicadorInfo.map(pub => {
                if (!publicadores.includes(pub._id))
                    publicadores.push(pub._id)
            })
        }

        const filter = {}
        if (publicadores.length > 0) {
            filter["publicador"] = { $in: publicadores }
        }

        if (req.query.inicio || req.query.fim) {
            filter['mesAno'] = {}
            if (req.query.inicio) {
                const [mes, ano] = req.query.inicio.split('/')
                filter['mesAno']['$gte'] = new Date(ano, mes, 1)
            }

            if (req.query.fim) {
                const [mes, ano] = req.query.fim.split('/')
                filter['mesAno']['$lte'] = new Date(ano, mes, 1)
            }
        }

        await Relatorio.find(filter)
        .populate('publicador', 'nome')
        .exec(function (err, relatorioInfo) {
            if (err) {
                next(err);
            } else {
                const data = {
                    dados: []
                }

                relatorioInfo.map(rel => {
                    data.dados.push({ ...rel.toObject(), mesAno: moment(rel.mesAno).format('MM/YYYY')})
                })

                carbone.render('./backend/src/templates/ReportTemplate.xlsx', data, function (err, result) {
                    if (err) {
                        res.status(400).json({ status: "error", message: `Relatório não gerado! (${err})` })
                    }

                    const dir = './backend/src/reports'

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    const filePath = `./backend/src/reports/Relatorio${Date.now()}.xlsx`
                    // write the result
                    fs.writeFileSync(filePath, result);
                    res.download(filePath)
                });
            }
        });

    }

    async list(req, res, next) {
        const limit = parseInt(req.query.limit) || undefined
        const offset = parseInt(req.query.offset) || 0
        const publicadores = req.query.publicador ? req.query.publicador.split(',') : []

        // filtra publicadores dos grupos
        const filterPublicadores = {}
        if (req.query.grupo || req.query.privilegio) {
            if (req.query.grupo)
                filterPublicadores["id_grupo"] = { $in: req.query.grupo.split(',') }

            if (req.query.privilegio)
                filterPublicadores['privilegio'] = new RegExp(req.query.privilegio, "i")

            const publicadorInfo = await Publicador.find(filterPublicadores);

            publicadorInfo.map(pub => {
                if (!publicadores.includes(pub._id))
                    publicadores.push(pub._id)
            })
        }

        const filter = {}
        if (publicadores.length > 0) {
            filter["publicador"] = { $in: publicadores }
        }

        if (req.query.inicio || req.query.fim) {
            filter['mesAno'] = {}
            if (req.query.inicio) {
                const [mes, ano] = req.query.inicio.split('/')
                filter['mesAno']['$gte'] = new Date(ano, mes, 1)
            }

            if (req.query.fim) {
                const [mes, ano] = req.query.fim.split('/')
                filter['mesAno']['$lte'] = new Date(ano, mes, 1)
            }
        }

        //console.log(filter)

        await Relatorio.find(filter)
            .skip(offset)
            .limit(limit)
            .populate('publicador', 'nome')
            .exec(function (err, relatorioInfo) {
                if (err) {
                    next(err);
                } else {
                    Relatorio.countDocuments(filter, function (err, count) {
                        res.status(200).json({ data: relatorioInfo, total: count });
                    })
                }
            });
    }

    async listOne(req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({ status: "error", message: "Um ID para busca deve ser informado!" });
        } else {
            await Relatorio.findOne({ _id: req.params.id }, function (err, relatorioInfo) {
                if (err) {
                    next(err);
                } else {
                    if (relatorioInfo)
                        res.status(200).json(relatorioInfo);
                    else
                        res.status(400).json({ status: "error", message: "Relatório não encontrado!" })
                }
            });
        }
    }

    async create(req, res, next) {
        await Relatorio.findOne({
            mesAno: req.body.mesAno,
            publicador: req.body.publicador,
            _id: { $ne: req.params.id }
        }, async function (err, relatorioInfo) {
            if (err) {
                next(err);
            } else if (relatorioInfo != null) {
                res.status(400).json({ status: "error", message: "Um Relatorio com este Mês/Ano para este Publicador já esta cadastrado!" });
            } else {
                await Relatorio.create({ ...req.body }, function (err, relatorioInfo) {
                    if (err)
                        next(err);
                    else
                        res.json(relatorioInfo);
                });
            }
        });
    }

    async update(req, res, next) {
        await Relatorio.findOne({
            mesAno: req.body.mesAno,
            publicador: req.body.publicador,
            _id: { $ne: req.params.id }
        }, async function (err, relatorioInfo) {
            if (err) {
                next(err);
            } else if (relatorioInfo != null) {
                res.status(400).json({ status: "error", message: "Um Relatorio com este Mês/Ano para este Publicador já esta cadastrado!" });
            } else {
                if (req.params.id == null) {
                    res.status(400).json({ status: "error", message: "Um ID para alteração deve ser informado!" });
                } else {
                    Relatorio.findByIdAndUpdate(req.params.id, { ...req.body, id_publicador: req.params.idPub }, { new: true }, function (err, relatorioInfo) {
                        if (err) {
                            next(err);
                        } else {
                            res.json(relatorioInfo);
                        }
                    });
                }
            }
        });
    }

    async delete(req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({ status: "error", message: "Um ID para exclusão deve ser informado!" });
        } else {
            await Relatorio.findByIdAndRemove(req.params.id, function (err) {
                if (err) {
                    next(err);
                } else {
                    res.json({ status: "success" });
                }
            });
        }
    }
}

module.exports = new RelatorioController();