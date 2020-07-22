/* eslint-disable import/no-duplicates */
import { Request, Response } from 'express';

import AgreementsRepository, {
  Agreement,
} from '~/repositories/AgreementsRepository';
import BuildAgreementsStatisticsService from '~/services/BuildAgreementsStatisticsService';
import FilterAgreementsService, {
  Filters,
} from '~/services/FilterAgreementsService';

class AgreementController {
  async index(request: Request, response: Response) {
    const filters = (request.query as unknown) as Filters;

    let agreements = await AgreementsRepository.findAll();

    const filterAgreements = new FilterAgreementsService();
    const buildAgreementsStatistics = new BuildAgreementsStatisticsService();

    agreements = filterAgreements.execute({ agreements, filters });

    const statistics = buildAgreementsStatistics.execute({ agreements });

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
        company,
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
        company: company
          ? {
              connect: {
                id: company.id,
              },
            }
          : undefined,
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
            contracts: Array.isArray(convenientExecution.contracts)
              ? {
                  create: convenientExecution.contracts.map((el: any) => ({
                    ...el,
                    details: {
                      create: el.details,
                    },
                  })),
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
