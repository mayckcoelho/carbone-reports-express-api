const Relatorio = require('../models/Relatorios');
const Publicador = require('../models/Publicadores');
const moment = require('moment')
const fs = require('fs');
const carbone = require('carbone');
const path = require('path');

class RelatorioController {

    async download(req, res, next) {
        let publicadores = req.query.publicador ? req.query.publicador.split(',') : []
        const mudou = req.query.mudou

        // filtra publicadores dos grupos
        const filterPublicadores = {}
        if (publicadores.length > 0 || req.query.grupo || req.query.privilegio || mudou) {
            if (publicadores.length > 0)
                filterPublicadores["_id"] = { $in: publicadores }

            if (req.query.grupo)
                filterPublicadores["id_grupo"] = { $in: req.query.grupo.split(',') }

            if (req.query.privilegio)
                filterPublicadores['privilegio'] = new RegExp(req.query.privilegio, "i")

            if (mudou)
                filterPublicadores["status"] = { $in: ['I', 'M', 'A'] }
            else
                filterPublicadores["status"] = { $in: ['I', 'A'] }

            const publicadorInfo = await Publicador.find(filterPublicadores);

            publicadores = [...publicadorInfo]
        }

        const filter = {}
        if (publicadores.length > 0) {
            filter["publicador"] = { $in: publicadores }
        }

        if (req.query.inicio || req.query.fim) {
            filter['mesAno'] = {}
            if (req.query.inicio) {
                const [mes, ano] = req.query.inicio.split('/')
                const dateIni = moment(`${ano}-${mes}-01`)

                filter['mesAno']['$gte'] = dateIni.format('YYYY-MM-DD')
            }

            if (req.query.fim) {
                const [mes, ano] = req.query.fim.split('/')
                const dateFim = moment(`${ano}-${mes}-01`)
                filter['mesAno']['$lte'] = dateFim.add(1, 'months').add(-1, 'days').format('YYYY-MM-DD')
            }
        }

        await Relatorio.find(filter)
            .populate('publicador', 'nome')
            .exec(function (err, relatorioInfo) {
                if (err) {
                    next(err);
                } else {
                    let data = {
                        dados: [],
                        totais: {
                            publicacoes: 0,
                            videos: 0,
                            horas: 0,
                            revisitas: 0,
                            estudos: 0
                        }
                    }

                    relatorioInfo.map(rel => {
                        data.dados.push({
                            ...rel.toObject(),
                            horas: rel.valorTempo === 'H' ? `${rel.horas}:00` : `00:${rel.horas}`,
                            mesAno: moment(rel.mesAno).format('MM/YYYY')
                        })

                        data.totais.publicacoes += rel.publicacoes;
                        data.totais.videos += rel.videos;
                        data.totais.horas += rel.valorTempo === 'H' ? (rel.horas * 60) : rel.horas;
                        data.totais.revisitas += rel.revisitas;
                        data.totais.estudos += rel.estudos;
                    })

                    data.totais.horas = (data.totais.horas / 60 ^ 0) + ':' + ('0' + data.totais.horas % 60).slice(-2);
                    const templatePath = path.resolve(__dirname, '..', 'templates', 'ReportTemplate.xlsx')
                    carbone.render(templatePath, data, function (err, result) {
                        if (err) {
                            res.status(400).json({ status: "error", message: `Relatório não gerado! (${err})` })
                        }

                        const dir = path.resolve(__dirname, '..', 'reports')

                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir);
                        }

                        const filePath = path.resolve(__dirname, '..', 'reports', `Relatorio${Date.now()}.xlsx`)
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
        let publicadores = req.query.publicador ? req.query.publicador.split(',') : []
        const mudou = req.query.mudou

        // filtra publicadores dos grupos
        const filterPublicadores = {}
        if (publicadores.length > 0 || req.query.grupo || req.query.privilegio || mudou) {
            if (publicadores.length > 0)
                filterPublicadores["_id"] = { $in: publicadores }

            if (req.query.grupo)
                filterPublicadores["id_grupo"] = { $in: req.query.grupo.split(',') }

            if (req.query.privilegio)
                filterPublicadores['privilegio'] = new RegExp(req.query.privilegio, "i")

            if (mudou)
                filterPublicadores["status"] = { $in: ['I', 'M', 'A'] }
            else
                filterPublicadores["status"] = { $in: ['I', 'A'] }

            const publicadorInfo = await Publicador.find(filterPublicadores);

            publicadores = [...publicadorInfo]
        }

        const filter = {}
        if (publicadores.length > 0) {
            filter["publicador"] = { $in: publicadores }
        }



        // console.log(filter)
        if (req.query.inicio || req.query.fim) {
            filter['mesAno'] = {}
            if (req.query.inicio) {
                const [mes, ano] = req.query.inicio.split('/')
                const dateIni = moment(`${ano}-${mes}-01`)

                filter['mesAno']['$gte'] = dateIni.format('YYYY-MM-DD')
            }

            if (req.query.fim) {
                const [mes, ano] = req.query.fim.split('/')
                const dateFim = moment(`${ano}-${mes}-01`)
                filter['mesAno']['$lte'] = dateFim.add(1, 'months').add(-1, 'days').format('YYYY-MM-DD')
            }
        }

        await Relatorio.find(filter)
            .skip(offset)
            .limit(limit)
            .populate('publicador', 'nome')
            .sort([['mesAno', -1]])
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
                console.log(req.body)
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