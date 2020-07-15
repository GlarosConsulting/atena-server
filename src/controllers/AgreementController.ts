/* eslint-disable import/no-duplicates */
import { Request, Response } from 'express';
import { parseISO, format, isAfter, isBefore } from 'date-fns';
import ptBrLocale from 'date-fns/locale/pt-BR';

import AgreementsRepository, {
  Agreement,
} from '~/repositories/AgreementsRepository';
import BuildAgreementsStatisticsService from '~/services/BuildAgreementsStatisticsService';

class AgreementController {
  async index(request: Request, response: Response) {
    const {
      beginDate,
      endDate,
      UF,
      Cidade,
      NumeroLicitacao,
      NumProcessoLicitacao,
      ObjetoLicitacao,
      NumeroEdital,
      DataPublicacaoEdital,
      DataLicitacao,
      DataHomologacao,
      ReferenciaLegal,
      DescricaoLicitacao,
      ModalidadeLicitacao,
      RegistroDePreco,
      ValorLicitacao,
    } = request.query as { [key: string]: string };

    let agreements = await AgreementsRepository.findAll();

    const compareCaseInsensitive = (
      str: string | null,
      compare: string,
    ): boolean =>
      str ? str.toLowerCase().includes(compare.toLowerCase()) : false;

    if (beginDate)
      agreements = agreements.filter(agreement =>
        agreement.proposalData?.data?.proposalDate
          ? isAfter(
              agreement.proposalData.data.proposalDate,
              parseISO(beginDate),
            )
          : true,
      );
    if (endDate)
      agreements = agreements.filter(agreement =>
        agreement.proposalData?.data?.proposalDate
          ? isBefore(
              agreement.proposalData.data.proposalDate,
              parseISO(endDate),
            )
          : true,
      );

    if (UF)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(agreement.uf, UF),
      );
    if (Cidade)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(agreement.city, Cidade),
      );
    if (NumeroLicitacao)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(agreement.agreementId, NumeroLicitacao),
      );
    if (NumProcessoLicitacao)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(
          agreement.proposalData?.data?.processId
            ? agreement.proposalData?.data?.processId
            : null,
          NumProcessoLicitacao,
        ),
      );
    if (ObjetoLicitacao)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(
          agreement.proposalData?.data?.object
            ? agreement.proposalData?.data?.object
            : null,
          ObjetoLicitacao,
        ),
      );
    if (NumeroEdital)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(
          agreement.proposalData?.data?.proposalId
            ? agreement.proposalData?.data?.proposalId
            : null,
          NumeroEdital,
        ),
      );
    if (DataPublicacaoEdital)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(
          agreement.proposalData?.data?.proposalDate
            ? format(agreement.proposalData?.data?.proposalDate, 'dd/MM/yyyy', {
                locale: ptBrLocale,
              })
            : null,
          DataPublicacaoEdital,
        ),
      );
    if (DataLicitacao)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(
          agreement.proposalData?.data?.biddingDate
            ? format(agreement.proposalData?.data?.biddingDate, 'dd/MM/yyyy', {
                locale: ptBrLocale,
              })
            : null,
          DataLicitacao,
        ),
      );
    if (DataHomologacao)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(
          agreement.proposalData?.data?.homologationDate
            ? format(
                agreement.proposalData?.data?.homologationDate,
                'dd/MM/yyyy',
                { locale: ptBrLocale },
              )
            : null,
          DataHomologacao,
        ),
      );
    if (ReferenciaLegal)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(
          agreement.proposalData?.data?.legalFoundation
            ? agreement.proposalData?.data?.legalFoundation
            : null,
          ReferenciaLegal,
        ),
      );
    if (DescricaoLicitacao)
      agreements = agreements.filter(agreement =>
        compareCaseInsensitive(
          agreement.proposalData?.data?.justification
            ? agreement.proposalData?.data?.justification
            : null,
          DescricaoLicitacao,
        ),
      );
    if (ModalidadeLicitacao)
      agreements = agreements.filter(agreement =>
        agreement.convenientExecution
          ? agreement.convenientExecution.executionProcesses.some(process =>
              compareCaseInsensitive(process.type, ModalidadeLicitacao),
            )
          : true,
      );
    if (RegistroDePreco)
      agreements = agreements.filter(agreement =>
        agreement.convenientExecution
          ? agreement.convenientExecution.executionProcesses.some(process =>
              compareCaseInsensitive(
                process.date
                  ? format(process.date, 'dd/MM/yyyy', { locale: ptBrLocale })
                  : null,
                RegistroDePreco,
              ),
            )
          : true,
      );
    if (ValorLicitacao)
      agreements = agreements.filter(agreement =>
        agreement.proposalData
          ? agreement.proposalData.programs.some(program =>
              compareCaseInsensitive(
                program.value
                  ? Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(program.value)
                  : null,
                ValorLicitacao,
              ),
            )
          : true,
      );

    const buildAgreementsStatistics = new BuildAgreementsStatisticsService(
      agreements,
    );
    const statistics = buildAgreementsStatistics.execute();

    return response
      .header('X-Total-Count', String(agreements.length))
      .json({ statistics, agreements });
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const agreement = await AgreementsRepository.findById(id);

    if (!agreement) {
      return response
        .status(404)
        .json({ error: 'No agreement found with this ID.' });
    }

    return response.json(agreement);
  }

  async create(request: Request, response: Response) {
    const items = request.body;

    const promises: Promise<Agreement>[] = items.map(async (item: any) => {
      const {
        agreementId,
        name,
        uf,
        city,
        status,
        start,
        end,
        program,
        proposalData,
        workPlan,
        convenientExecution,
        accountability,
      } = item;

      return AgreementsRepository.create({
        agreementId,
        name,
        uf,
        city,
        status,
        start,
        end,
        program,
        proposalData: {
          create: {
            data: proposalData.data
              ? {
                  create: {
                    ...proposalData.data,
                    status: { create: proposalData.data.status },
                  },
                }
              : undefined,
            programs: Array.isArray(proposalData.programs)
              ? {
                  create: proposalData.programs.map((el: any) => ({
                    ...el,
                    details: el.details
                      ? {
                          create: {
                            ...el.details,
                            couterpartValues: {
                              create: el.details.counterpartValues,
                            },
                            transferValues: {
                              create: el.details.transferValues,
                            },
                          },
                        }
                      : null,
                  })),
                }
              : undefined,
            participants: proposalData.participants
              ? {
                  create: proposalData.participants,
                }
              : undefined,
          },
        },
        workPlan: {
          create: {
            physicalChrono: {
              create: workPlan.physicalChrono
                ? {
                    list: { create: workPlan.physicalChrono.list },
                    values: { create: workPlan.physicalChrono.values },
                  }
                : undefined,
            },
            disbursementChrono: {
              create: workPlan.disbursementChrono
                ? {
                    list: { create: workPlan.disbursementChrono.list },
                    values: {
                      create: {
                        registered: {
                          create: workPlan.disbursementChrono.values.registered,
                        },
                        register: {
                          create: workPlan.disbursementChrono.values.register,
                        },
                        total: {
                          create: workPlan.disbursementChrono.values.total,
                        },
                      },
                    },
                  }
                : undefined,
            },
            detailedApplicationPlan: {
              create: workPlan.detailedApplicationPlan
                ? {
                    list: { create: workPlan.detailedApplicationPlan.list },
                    values: {
                      create: {
                        assets: {
                          create:
                            workPlan.detailedApplicationPlan.values.assets,
                        },
                        tributes: {
                          create:
                            workPlan.detailedApplicationPlan.values.tributes,
                        },
                        construction: {
                          create:
                            workPlan.detailedApplicationPlan.values
                              .construction,
                        },
                        services: {
                          create:
                            workPlan.detailedApplicationPlan.values.services,
                        },
                        others: {
                          create:
                            workPlan.detailedApplicationPlan.values.others,
                        },
                        administrative: {
                          create:
                            workPlan.detailedApplicationPlan.values
                              .administrative,
                        },
                        total: {
                          create: workPlan.detailedApplicationPlan.values.total,
                        },
                      },
                    },
                  }
                : undefined,
            },
            consolidatedApplicationPlan: {
              create: workPlan.consolidatedApplicationPlan
                ? {
                    list: { create: workPlan.consolidatedApplicationPlan.list },
                    total: {
                      create: workPlan.consolidatedApplicationPlan.total,
                    },
                  }
                : undefined,
            },
            attachments: {
              create: workPlan.attachments
                ? {
                    proposalList: { create: workPlan.attachments.proposalList },
                    executionList: {
                      create: workPlan.attachments.executionList,
                    },
                  }
                : undefined,
            },
            notions: {
              create: workPlan.notions
                ? {
                    proposalList: { create: workPlan.notions.proposalList },
                    workPlanList: { create: workPlan.notions.workPlanList },
                  }
                : undefined,
            },
          },
        },
        convenientExecution: {
          create: {
            executionProcesses: Array.isArray(
              convenientExecution.executionProcesses,
            )
              ? {
                  create: convenientExecution.executionProcesses.map(
                    (el: any) => ({
                      ...el,
                      details: {
                        create: el.details,
                      },
                    }),
                  ),
                }
              : undefined,
          },
        },
        accountability: {
          create: {
            data: accountability.data
              ? {
                  create: accountability.data,
                }
              : undefined,
          },
        },
      });
    });

    const agreements = await Promise.all(promises);

    return response.json(agreements);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { name, status, start, end, program } = request.body;

    const agreementExistsById = await AgreementsRepository.existsById(id);

    if (!agreementExistsById) {
      return response
        .status(404)
        .json({ error: 'No agreement found with this ID.' });
    }

    const agreement = await AgreementsRepository.update(id, {
      name,
      status,
      start,
      end,
      program,
    });

    return response.json(agreement);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const agreementExistsById = await AgreementsRepository.existsById(id);

    if (!agreementExistsById) {
      return response
        .status(404)
        .json({ error: 'No agreement found with this ID.' });
    }

    const agreement = await AgreementsRepository.delete(id);

    return response.json(agreement);
  }

  async test(request: Request, response: Response) {
    const agreements = await AgreementsRepository.getTest([
      'Maceió',
      'Campestre',
    ]);

    return response
      .header('X-Total-Count', String(agreements.length))
      .json(agreements);
  }
}

export default new AgreementController();
