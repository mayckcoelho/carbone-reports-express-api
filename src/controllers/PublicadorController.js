const Publicador = require('../models/Publicadores');
const Relatorio = require('../models/Relatorios');
const moment = require('moment')
const fs = require('fs');
const carbone = require('carbone');
const path = require('path');

class PublicadorController {
    async download(req, res, next) {
        const publicadorInfo = await Publicador.findById(req.params.id).catch(err => {
            next(err)
        });

        const publicador = {
            ...publicadorInfo.toObject(),
            sexo: publicadorInfo.sexo === 'M' ? 'Masculino' : 'Feminino',
            grupo: publicadorInfo.grupo === 'O' ? 'Outras ovelhas' : 'Ungidos',
            privilegio: publicadorInfo.privilegio.split(',').map(p => ({
                'A': 'Ancião',
                'P': 'Publicador',
                'S': 'Servo ministerial',
                'R': 'Pioneiro',
                'M': 'Missionário',
            }[p])).join(', '),
            data_nascimento: moment(publicadorInfo.data_nascimento).format('DD/MM/YYYY'),
            data_batismo: publicadorInfo.data_batismo ? moment(publicadorInfo.data_batismo).format('DD/MM/YYYY') : "",
            dados: []
        }

        const relatorioInfo = await Relatorio.find({ publicador: req.params.id }).catch(err => {
            next(err)
        })

        relatorioInfo.map(rel => {
            publicador.dados.push({
                ...rel.toObject(),
                horas: rel.valorTempo === 'H' ? `${rel.horas}:00` : `00:${rel.horas}`,
                mesAno: moment(rel.mesAno).format('MM/YYYY')
            })
        })


        // console.log(publicador)
        const templatePath = path.resolve(__dirname, '..', 'templates', 'PersonalReportTemplate.xlsx')
        carbone.render(templatePath, publicador, function (err, result) {
            if (err) {
                res.status(400).json({ status: "error", message: `Relatório não gerado! (${err})` })
            }

            const dir = path.resolve(__dirname, '..', 'reports')

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            const filePath = path.resolve(__dirname, '..', 'reports', `Cartao${Date.now()}.xlsx`)
            // write the result
            fs.writeFileSync(filePath, result);
            res.download(filePath)
        });
    }

    async list(req, res, next) {
        const limit = parseInt(req.query.limit) || undefined
        const offset = parseInt(req.query.offset) || 0

        const filter = {}
        if (req.query.nome)
            filter['nome'] = new RegExp(req.query.nome.toLowerCase(), "i")

        await Publicador.find(filter)
            .skip(offset)
            .limit(limit)
            .exec(function (err, publicadorInfo) {
                if (err) {
                    next(err);
                } else {
                    Publicador.countDocuments(filter, function (err, count) {
                        res.status(200).json({ data: publicadorInfo, total: count });
                    })
                }
            });
    }

    async listOne(req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({ status: "error", message: "Um ID para busca deve ser informado!" });
        } else {
            await Publicador.findById(req.params.id, function (err, publicadorInfo) {
                if (err) {
                    next(err);
                } else {
                    if (publicadorInfo)
                        res.status(200).json(publicadorInfo);
                    else
                        res.status(400).json({ status: "error", message: "Publicador não encontrado!" })
                }
            });
        }
    }

    async create(req, res, next) {
        await Publicador.create(req.body, function (err, publicadorInfo) {
            if (err)
                next(err);
            else
                res.json(publicadorInfo);
        });
    }

    async update(req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({ status: "error", message: "Um ID para alteração deve ser informado!" });
        } else {
            Publicador.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, publicadorInfo) {
                if (err) {
                    next(err);
                } else {
                    res.json(publicadorInfo);
                }
            });
        }
    }

    async delete(req, res, next) {
        if (req.params.id == null) {
            res.status(400).json({ status: "error", message: "Um ID para exclusão deve ser informado!" });
        } else {

            try {
                await Relatorio.remove({ publicador: req.params.id })
                await Publicador.findByIdAndRemove(req.params.id)

                res.json({ status: "success" })
            } catch (err) {
                next(err)
            }
        }
    }
}

module.exports = new PublicadorController();