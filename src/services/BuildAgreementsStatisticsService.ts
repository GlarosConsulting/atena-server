import { isBefore, parseISO, parse } from 'date-fns';

import { Agreement } from '~/repositories/AgreementsRepository';
import contains from '~/utils/contains';

interface Request {
  agreements: Agreement[];
}

interface Response {
  total: StatisticsItem;
  execution: StatisticsItem;
  pending: StatisticsItem;
  interrupted: StatisticsItem;
  procedures: StatisticsItem;
  completed: StatisticsItem;
  topTenOrgans: TopTenOrganItem[];
  counterpart: CounterpartItem;
}

interface StatisticsItem {
  count: number;
  value: number;
}

interface TopTenOrganItem {
  name: string;
  value: number;
  percentage: number;
}

interface CounterpartItem {
  financial: number;
  assetsAndServices: number;
  empty: number;
}

const greaterThan = (value?: number | null, compareTo = 0) =>
  value && value > compareTo;

const lessThanOrEqual = (value?: number | null, compareTo = 0) =>
  !value || value <= compareTo;

class BuildAgreementsStatisticsService {
  execute({ agreements }: Request): Response {
    const agreementsModalityConvenioAndContratoRepasse = agreements.filter(
      agreement =>
        contains(agreement.proposalData?.data?.modality, 'Convênio') ||
        contains(agreement.proposalData?.data?.modality, 'Contrato de Repasse'),
    );
    const total: StatisticsItem = {
      count: agreementsModalityConvenioAndContratoRepasse.length,
      value: agreementsModalityConvenioAndContratoRepasse.reduce(
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

    const agreementsInExecutionModalityConvenioAndContratoRepasse = agreements.filter(
      agreement =>
        (contains(agreement.proposalData?.data?.modality, 'Convênio') ||
          contains(
            agreement.proposalData?.data?.modality,
            'Contrato de Repasse',
          )) &&
        contains(agreement.proposalData?.data?.status?.value, 'Em execução'),
    );
    const execution: StatisticsItem = {
      count: agreementsInExecutionModalityConvenioAndContratoRepasse.length,
      value: agreementsInExecutionModalityConvenioAndContratoRepasse.reduce(
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

    const agreementsPending = agreements.filter(
      agreement =>
        contains(agreement.proposalData?.data?.status?.value, 'Rejeitada') ||
        contains(agreement.proposalData?.data?.status?.value, 'Inadimpl') ||
        contains(agreement.proposalData?.data?.status?.value, 'Ressalvas'),
    );
    const pending: StatisticsItem = {
      count: agreementsPending.length,
      value: agreementsPending.reduce(
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

    const agreementsInterrupted = agreements.filter(
      agreement =>
        contains(agreement.proposalData?.data?.status?.value, 'Rescindido') ||
        contains(agreement.proposalData?.data?.status?.value, 'Anulado') ||
        contains(agreement.proposalData?.data?.status?.value, 'Cancelado') ||
        contains(agreement.proposalData?.data?.status?.value, 'Excluído'),
    );
    const interrupted: StatisticsItem = {
      count: agreementsInterrupted.length,
      value: agreementsInterrupted.reduce(
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

    const agreementsProcedures = agreements.filter(
      agreement =>
        contains(agreement.proposalData?.data?.modality, 'Licitação') ||
        contains(agreement.proposalData?.data?.modality, 'Dispensa') ||
        contains(agreement.proposalData?.data?.modality, 'Inexigibilidade') ||
        contains(agreement.proposalData?.data?.modality, 'Subconvênio'),
    );
    const procedures: StatisticsItem = {
      count: agreementsProcedures.length,
      value: agreementsProcedures.reduce(
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

    const agreementsDataTerminoVigenciaLessThanToday = agreements.filter(
      agreement => {
        const validity = agreement.accountability?.data?.validity;

        if (!validity) return false;

        const [, endValidityDate] = validity.split(' a ');

        return isBefore(
          parse(endValidityDate, 'dd/MM/yyyy', new Date()),
          new Date(),
        );
      },
    );
    const completed: StatisticsItem = {
      count: agreementsDataTerminoVigenciaLessThanToday.length,
      value: agreementsDataTerminoVigenciaLessThanToday.reduce(
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
        const [number, name] = organName.split(' - ');
        const count = topTenOrganNames.filter(el => el === organName).length;

        const organAgreements = agreements.filter(findAgreement =>
          findAgreement.proposalData?.data?.organ?.includes(number),
        );

        return {
          name,
          value: organAgreements.reduce(
            (accumulator, agreement) =>
              accumulator +
              (agreement.proposalData
                ? agreement.proposalData.programs.reduce(
                    (accumulator2, program) =>
                      accumulator2 + (program.value || 0),
                    0,
                  )
                : 0),
            0,
          ),
          percentage: (count / topTenOrgansCountTotal) * 100,
        };
      });

    topTenOrgans.length = 10;
    topTenOrgans = topTenOrgans.filter(el => el);

    const counterpart: CounterpartItem = {
      financial: agreements
        .filter(agreement =>
          agreement.proposalData?.programs.some(program =>
            greaterThan(program.details?.couterpartValues?.financial, 0),
          ),
        )
        .reduce(
          (accumulator, agreement) =>
            accumulator +
            (agreement.proposalData
              ? agreement.proposalData.programs.reduce(
                  (accumulator2, program) =>
                    accumulator2 + (program.value || 0),
                  0,
                )
              : 0),
          0,
        ),
      assetsAndServices: agreements
        .filter(agreement =>
          agreement.proposalData?.programs.some(program =>
            greaterThan(
              program.details?.couterpartValues?.assetsAndServices,
              0,
            ),
          ),
        )
        .reduce(
          (accumulator, agreement) =>
            accumulator +
            (agreement.proposalData
              ? agreement.proposalData.programs.reduce(
                  (accumulator2, program) =>
                    accumulator2 + (program.value || 0),
                  0,
                )
              : 0),
          0,
        ),
      empty: agreements
        .filter(agreement =>
          agreement.proposalData?.programs.some(
            program =>
              lessThanOrEqual(
                program.details?.couterpartValues?.financial,
                0,
              ) &&
              lessThanOrEqual(
                program.details?.couterpartValues?.assetsAndServices,
                0,
              ),
          ),
        )
        .reduce(
          (accumulator, agreement) =>
            accumulator +
            (agreement.proposalData
              ? agreement.proposalData.programs.reduce(
                  (accumulator2, program) =>
                    accumulator2 + (program.value || 0),
                  0,
                )
              : 0),
          0,
        ),
    };

    return {
      total,
      execution,
      pending,
      interrupted,
      procedures,
      completed,
      topTenOrgans,
      counterpart,
    };
  }
}

export default BuildAgreementsStatisticsService;
