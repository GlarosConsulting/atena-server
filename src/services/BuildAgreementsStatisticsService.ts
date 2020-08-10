import { Agreement } from '~/repositories/AgreementRepository';

<<<<<<< Updated upstream
interface Statistics {
=======
import { Agreement } from '~/repositories/AgreementsRepository';
import contains from '~/utils/contains';

interface Request {
  agreements: Agreement[];
}

interface Response {
>>>>>>> Stashed changes
  total: StatisticsItem;
}

interface StatisticsItem {
  count: number;
  value: number;
}

<<<<<<< Updated upstream
=======
interface TopTenOrganItem {
  name: string;
  count: number;
  percentage: number;
}

interface CounterpartItem {
  financial: number;
  assetsAndServices: number;
  empty: number;
}

interface Trimesters {
  0: number;
  1: number;
  2: number;
  3: number;
}

const greaterThan = (value?: number | null, compareTo = 0) =>
  value && value > compareTo;

const lessThanOrEqual = (value?: number | null, compareTo = 0) =>
  !value || value <= compareTo;

>>>>>>> Stashed changes
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
          agreement.proposalData.programs.reduce(
            (accumulator2, program) => accumulator2 + (program.value || 0),
            0,
          ),
        0,
      ),
    };

    return {
      total,
    };
  }
}

export default BuildAgreementsStatisticsService;
