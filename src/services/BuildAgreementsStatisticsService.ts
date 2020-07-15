import { Agreement } from '~/repositories/AgreementsRepository';

interface Statistics {
  total: StatisticsItem;
}

interface StatisticsItem {
  count: number;
  value: number;
}

class BuildAgreementsStatisticsService {
  private agreements: Agreement[];

  constructor(agreements: Agreement[]) {
    this.agreements = agreements;
  }

  execute(): Statistics {
    const total: StatisticsItem = {
      count: this.agreements.length,
      value: this.agreements.reduce(
        (accumulator, agreement) =>
          accumulator +
          (agreement.proposalData
            ? agreement.proposalData.programs.reduce(
                (accumulator2, program) => accumulator2 + (program.value || 0),
                0,
              )
            : 0),
        0,
      ),
    };

    return {
      total,
    };
  }
}

export default BuildAgreementsStatisticsService;
