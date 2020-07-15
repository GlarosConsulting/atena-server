import {
  AgreementGetPayload,
  AgreementCreateInput,
  AgreementUpdateInput,
} from '@prisma/client';
import Repository from './Repository';

export type Agreement = AgreementGetPayload<{
  include: {
    proposalData: {
      include: {
        data: {
          include: {
            status: true;
          };
        };
        programs: true;
        participants: true;
      };
    };
    workPlan: {
      include: {
        physicalChrono: {
          include: {
            list: true;
            values: true;
          };
        };
        disbursementChrono: {
          include: {
            list: true;
            values: {
              include: {
                registered: true;
                register: true;
                total: true;
              };
            };
          };
        };
        detailedApplicationPlan: {
          include: {
            list: true;
            values: {
              include: {
                assets: true;
                tributes: true;
                construction: true;
                services: true;
                others: true;
                administrative: true;
              };
            };
          };
        };
        consolidatedApplicationPlan: {
          include: {
            list: true;
            total: true;
          };
        };
      };
    };
    convenientExecution: {
      include: {
        executionProcesses: true;
      };
    };
    accountability: {
      include: {
        data: true;
      };
    };
  };
}>;

class AgreementRepository extends Repository<
  Agreement,
  AgreementCreateInput,
  AgreementUpdateInput
> {
  private readonly include = {
    proposalData: {
      include: {
        data: {
          include: {
            status: true,
          },
        },
        programs: {
          include: {
            details: {
              include: {
                couterpartValues: true,
                transferValues: true,
              },
            },
          },
        },
        participants: true,
      },
    },
    workPlan: {
      include: {
        physicalChrono: {
          include: {
            list: true,
            values: true,
          },
        },
        disbursementChrono: {
          include: {
            list: true,
            values: {
              include: {
                registered: true,
                register: true,
                total: true,
              },
            },
          },
        },
        detailedApplicationPlan: {
          include: {
            list: true,
            values: {
              include: {
                assets: true,
                tributes: true,
                construction: true,
                services: true,
                others: true,
                administrative: true,
              },
            },
          },
        },
        consolidatedApplicationPlan: {
          include: {
            list: true,
            total: true,
          },
        },
      },
    },
    convenientExecution: {
      include: {
        executionProcesses: true,
      },
    },
    accountability: {
      include: {
        data: true,
      },
    },
  };

  findAll(): Promise<Agreement[]> {
    return this.prisma.agreement.findMany({
      include: this.include,
    });
  }

  findById(id: string): Promise<Agreement | null> {
    return this.prisma.agreement.findOne({
      where: { id },
      include: this.include,
    });
  }

  create(data: AgreementCreateInput): Promise<Agreement | null> {
    return this.prisma.agreement.create({ data, include: this.include });
  }

  update(id: string, data: AgreementUpdateInput): Promise<Agreement | null> {
    return this.prisma.agreement.update({
      where: { id },
      data,
      include: this.include,
    });
  }

  delete(id: string): Promise<Agreement | null> {
    return this.prisma.agreement.delete({
      where: { id },
      include: this.include,
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.agreement.count({ where: { id } });

    return count > 0;
  }

  async getTest(cities: string[]): Promise<Agreement[]> {
    const agreements = await this.prisma.agreement.findMany({
      where: {
        city: {
          in: cities,
        },
        accountability: {
          data: {
            transferValue: {
              in: 975000,
            },
          },
        },
      },
      include: this.include,
    });

    return agreements;
  }
}

export default new AgreementRepository();
