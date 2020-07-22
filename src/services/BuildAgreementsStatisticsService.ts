import { isBefore } from 'date-fns';

import { Agreement } from '~/repositories/AgreementsRepository';

interface Request {
  agreements: Agreement[];
}

interface Response {
  total: StatisticsItem;
  execution: StatisticsItem;
  transfer: StatisticsItem;
  transferInExecution: StatisticsItem;
  completedBiddings: StatisticsItem;
  completedContracts: StatisticsItem;
  topTenOrgans: TopTenOrganItem[];
  counterpart: CounterpartItem;
}

interface StatisticsItem {
  count: number;
  value: number;
}

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

const contains = (str?: string | null, value?: string) =>
  value && str?.toUpperCase().includes(value.toUpperCase());

const greaterThan = (value?: number | null, compareTo = 0) =>
  value && value > compareTo;

const lessThanOrEqual = (value?: number | null, compareTo = 0) =>
  !value || value <= compareTo;

class BuildAgreementsStatisticsService {
  execute({ agreements }: Request): Response {
    const agreementsModalityConvenio = agreements.filter(agreement =>
      contains(agreement.proposalData?.data?.modality, 'Convênio'),
    );
    const total: StatisticsItem = {
      count: agreementsModalityConvenio.length,
      value: agreementsModalityConvenio.reduce(
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

    const agreementsInExecutionModalityConvenio = agreements.filter(
      agreement =>
        contains(agreement.proposalData?.data?.modality, 'Convênio') &&
        contains(agreement.proposalData?.data?.status.value, 'Em execução'),
    );
    const execution: StatisticsItem = {
      count: agreementsInExecutionModalityConvenio.length,
      value: agreementsInExecutionModalityConvenio.reduce(
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

    const agreementsModalityRepasse = agreements.filter(agreement =>
      contains(agreement.proposalData?.data?.modality, 'Contrato de repasse'),
    );
    const transfer: StatisticsItem = {
      count: agreementsModalityRepasse.length,
      value: agreementsModalityRepasse.reduce(
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

    const agreementsInExecutionModalityRepasse = agreements.filter(
      agreement =>
        contains(
          agreement.proposalData?.data?.modality,
          'Contrato de repasse',
        ) &&
        contains(agreement.proposalData?.data?.status.value, 'Em execução'),
    );
    const transferInExecution: StatisticsItem = {
      count: agreementsInExecutionModalityRepasse.length,
      value: agreementsInExecutionModalityRepasse.reduce(
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

    const agreementsLicitacao = agreements.filter(agreement =>
      agreement.convenientExecution?.executionProcesses.some(executionProcess =>
        contains(executionProcess.details?.executionProcess, 'Licitação'),
      ),
    );
    const completedBiddings: StatisticsItem = {
      count: agreementsLicitacao.length,
      value: agreementsLicitacao.reduce(
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

    const agreementsDataVigenciaLessThanToday = agreements.filter(agreement =>
      agreement.convenientExecution?.contracts.some(contract =>
        contract.details?.endDate
          ? isBefore(contract.details?.endDate, new Date())
          : true,
      ),
    );
    const completedContracts: StatisticsItem = {
      count: agreementsDataVigenciaLessThanToday.length,
      value: agreementsDataVigenciaLessThanToday.reduce(
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

    const topTenOrgansAgreements: Agreement[] = agreements
      .sort(
        (a, b) =>
          agreements.filter(
            agreement =>
              agreement.proposalData?.data?.organ ===
              a.proposalData?.data?.organ,
          ).length -
          agreements.filter(
            agreement =>
              agreement.proposalData?.data?.organ ===
              b.proposalData?.data?.organ,
          ).length,
      )
      .reverse();
    const topTenOrganNames = topTenOrgansAgreements
      .map(agreement => agreement.proposalData?.data?.organ)
      .filter(el => el) as string[];

    const topTenOrgansCount: { [key: string]: number } = {};

    topTenOrganNames.forEach(organName => {
      topTenOrgansCount[organName] = topTenOrganNames.filter(
        el => el === organName,
      ).length;
    });

    const topTenOrgansCountTotal = Object.values(topTenOrgansCount).reduce(
      (accumulator, count) => accumulator + count,
      0,
    );

    let topTenOrgans = topTenOrganNames
      .filter((el, index) => {
        return topTenOrganNames.indexOf(el) === index;
      })
      .map<TopTenOrganItem>(organName => {
        const name = organName.split(' - ')[1];
        const count = topTenOrganNames.filter(el => el === organName).length;

        return {
          name,
          count,
          percentage: (count / topTenOrgansCountTotal) * 100,
        };
      });

    topTenOrgans.length = 10;
    topTenOrgans = topTenOrgans.filter(el => el);

    const counterpart: CounterpartItem = {
      financial: agreements.filter(agreement =>
        agreement.proposalData?.programs.some(program =>
          greaterThan(program.details?.couterpartValues?.financial, 0),
        ),
      ).length,
      assetsAndServices: agreements.filter(agreement =>
        agreement.proposalData?.programs.some(program =>
          greaterThan(program.details?.couterpartValues?.assetsAndServices, 0),
        ),
      ).length,
      empty: agreements.filter(agreement =>
        agreement.proposalData?.programs.some(
          program =>
            lessThanOrEqual(program.details?.couterpartValues?.financial, 0) &&
            lessThanOrEqual(
              program.details?.couterpartValues?.assetsAndServices,
              0,
            ),
        ),
      ).length,
    };

    return {
      total,
      execution,
      transfer,
      transferInExecution,
      completedBiddings,
      completedContracts,
      topTenOrgans,
      counterpart,
    };
  }
}

export default BuildAgreementsStatisticsService;
