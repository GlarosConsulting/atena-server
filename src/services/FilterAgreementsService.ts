import { isEqual, parseISO, isAfter, isBefore, parse } from 'date-fns';

import { Agreement } from '~/repositories/AgreementsRepository';
import contains from '~/utils/contains';

type DateRange = [string | undefined, string | undefined];
type ValueRange = [string | undefined, string | undefined];

export interface Filters {
  celebration?: {
    agreementId?: string;
    modality?: string;
    processId?: string;
    proposalId?: string;
    proposalDate?: DateRange;
    biddingDate?: DateRange;
    homologationDate?: DateRange;
    legalFoundation?: string;
    value?: ValueRange;
    description?: string;
    object?: string;
  };
  execution?: {
    executionId?: string;
    type?: string;
    date?: DateRange;
    processId?: string;
    status?: string;
    systemStatus?: string;
    system?: string;
    accepted?: string;
  };
  accountability?: {
    organ?: string;
    convenient?: string;
    documentNumber?: string;
    modality?: string;
    status?: string;
    number?: string;
    validity?: DateRange;
    limitDate?: DateRange;
    totalValue?: ValueRange;
    transferValue?: ValueRange;
    counterpartValue?: ValueRange;
    yieldValue?: ValueRange;
  };
}

interface Request {
  agreements: Agreement[];
  filters: Filters;
}

interface FilterCelebration {
  agreements: Agreement[];
  celebration: Filters['celebration'];
}

interface FilterExecution {
  agreements: Agreement[];
  execution: Filters['execution'];
}

interface FilterAccountability {
  agreements: Agreement[];
  accountability: Filters['accountability'];
}

const greaterThanOrEqual = (value?: number | null, compareTo = 0) =>
  value && value >= compareTo;

const lessThanOrEqual = (value?: number | null, compareTo = 0) =>
  !value || value <= compareTo;

const filterCelebration = ({
  agreements: _agreements,
  celebration,
}: FilterCelebration) => {
  let agreements = _agreements;

  if (celebration?.agreementId) {
    agreements = agreements.filter(agreement =>
      contains(agreement.agreementId, celebration.agreementId),
    );
  }
  if (celebration?.modality) {
    agreements = agreements.filter(agreement =>
      contains(agreement.proposalData?.data?.modality, celebration.modality),
    );
  }
  if (celebration?.processId) {
    agreements = agreements.filter(agreement =>
      contains(agreement.proposalData?.data?.processId, celebration.processId),
    );
  }
  if (celebration?.proposalId) {
    agreements = agreements.filter(agreement =>
      contains(
        agreement.proposalData?.data?.proposalId,
        celebration.proposalId,
      ),
    );
  }
  if (celebration?.proposalDate) {
    agreements = agreements.filter(agreement =>
      agreement.proposalData?.data?.proposalDate &&
      celebration.proposalDate &&
      celebration.proposalDate[0]
        ? isAfter(
            agreement.proposalData?.data?.proposalDate,
            parseISO(celebration.proposalDate[0]),
          )
        : true,
    );

    agreements = agreements.filter(agreement =>
      agreement.proposalData?.data?.proposalDate &&
      celebration.proposalDate &&
      celebration.proposalDate[1]
        ? isBefore(
            agreement.proposalData?.data?.proposalDate,
            parseISO(celebration.proposalDate[1]),
          )
        : true,
    );
  }
  if (celebration?.biddingDate) {
    agreements = agreements.filter(agreement =>
      agreement.proposalData?.data?.biddingDate &&
      celebration.biddingDate &&
      celebration.biddingDate[0]
        ? isAfter(
            agreement.proposalData?.data?.biddingDate,
            parseISO(celebration.biddingDate[0]),
          )
        : true,
    );

    agreements = agreements.filter(agreement =>
      agreement.proposalData?.data?.biddingDate &&
      celebration.biddingDate &&
      celebration.biddingDate[1]
        ? isAfter(
            agreement.proposalData?.data?.biddingDate,
            parseISO(celebration.biddingDate[1]),
          )
        : true,
    );
  }
  if (celebration?.homologationDate) {
    agreements = agreements.filter(agreement =>
      agreement.proposalData?.data?.homologationDate &&
      celebration.homologationDate &&
      celebration.homologationDate[0]
        ? isAfter(
            agreement.proposalData?.data?.homologationDate,
            parseISO(celebration.homologationDate[0]),
          )
        : true,
    );

    agreements = agreements.filter(agreement =>
      agreement.proposalData?.data?.homologationDate &&
      celebration.homologationDate &&
      celebration.homologationDate[1]
        ? isAfter(
            agreement.proposalData?.data?.homologationDate,
            parseISO(celebration.homologationDate[1]),
          )
        : true,
    );
  }
  if (celebration?.legalFoundation) {
    agreements = agreements.filter(agreement =>
      contains(
        agreement.proposalData?.data?.legalFoundation,
        celebration.legalFoundation,
      ),
    );
  }
  if (celebration?.value) {
    agreements = agreements.filter(agreement =>
      celebration.value && celebration.value[0]
        ? greaterThanOrEqual(
            agreement.proposalData?.programs.reduce(
              (accumulator, el) => accumulator + (el.value || 0),
              0,
            ),
            Number(celebration.value[0]),
          )
        : true,
    );

    agreements = agreements.filter(agreement =>
      celebration.value && celebration.value[1]
        ? lessThanOrEqual(
            agreement.proposalData?.programs.reduce(
              (accumulator, el) => accumulator + (el.value || 0),
              0,
            ),
            Number(celebration.value[1]),
          )
        : true,
    );
  }
  if (celebration?.description) {
    agreements = agreements.filter(agreement =>
      contains(
        agreement.proposalData?.data?.description,
        celebration.description,
      ),
    );
  }
  if (celebration?.object) {
    agreements = agreements.filter(agreement =>
      contains(agreement.proposalData?.data?.object, celebration.object),
    );
  }

  return agreements;
};

const filterExecution = ({
  agreements: _agreements,
  execution,
}: FilterExecution) => {
  let agreements = _agreements;

  if (execution?.executionId) {
    agreements = agreements.filter(agreement =>
      agreement.convenientExecution?.executionProcesses.some(process =>
        contains(process.executionId, execution.executionId),
      ),
    );
  }
  if (execution?.type) {
    agreements = agreements.filter(agreement =>
      agreement.convenientExecution?.executionProcesses.some(process =>
        contains(process.type, execution.type),
      ),
    );
  }
  if (execution?.date) {
    agreements = agreements.filter(agreement =>
      agreement.convenientExecution?.executionProcesses.some(process =>
        process.date && execution.date && execution.date[0]
          ? isEqual(process.date, parseISO(execution.date[0]))
          : true,
      ),
    );

    agreements = agreements.filter(agreement =>
      agreement.convenientExecution?.executionProcesses.some(process =>
        process.date && execution.date && execution.date[1]
          ? isEqual(process.date, parseISO(execution.date[1]))
          : true,
      ),
    );
  }
  if (execution?.processId) {
    agreements = agreements.filter(agreement =>
      agreement.convenientExecution?.executionProcesses.some(process =>
        contains(process.processId, execution.processId),
      ),
    );
  }
  if (execution?.status) {
    agreements = agreements.filter(agreement =>
      agreement.convenientExecution?.executionProcesses.some(process =>
        contains(process.status, execution.status),
      ),
    );
  }
  if (execution?.systemStatus) {
    agreements = agreements.filter(agreement =>
      agreement.convenientExecution?.executionProcesses.some(process =>
        contains(process.systemStatus, execution.systemStatus),
      ),
    );
  }
  if (execution?.system) {
    agreements = agreements.filter(agreement =>
      agreement.convenientExecution?.executionProcesses.some(process =>
        contains(process.system, execution.system),
      ),
    );
  }
  if (execution?.accepted) {
    agreements = agreements.filter(agreement =>
      agreement.convenientExecution?.executionProcesses.some(process =>
        contains(process.accepted, execution.accepted),
      ),
    );
  }

  return agreements;
};

const filterAccountability = ({
  agreements: _agreements,
  accountability,
}: FilterAccountability) => {
  let agreements = _agreements;

  if (accountability?.organ) {
    agreements = agreements.filter(agreement =>
      contains(agreement.accountability?.data?.organ, accountability.organ),
    );
  }
  if (accountability?.convenient) {
    agreements = agreements.filter(agreement =>
      contains(
        agreement.accountability?.data?.convenient,
        accountability.convenient,
      ),
    );
  }
  if (accountability?.documentNumber) {
    agreements = agreements.filter(agreement =>
      contains(
        agreement.accountability?.data?.documentNumber,
        accountability.documentNumber,
      ),
    );
  }
  if (accountability?.modality) {
    agreements = agreements.filter(agreement =>
      contains(
        agreement.accountability?.data?.modality,
        accountability.modality,
      ),
    );
  }
  if (accountability?.status) {
    agreements = agreements.filter(agreement =>
      contains(agreement.accountability?.data?.status, accountability.status),
    );
  }
  if (accountability?.number) {
    agreements = agreements.filter(agreement =>
      contains(agreement.accountability?.data?.number, accountability.number),
    );
  }
  if (accountability?.validity) {
    agreements = agreements.filter(agreement => {
      if (
        !agreement.accountability?.data?.validity ||
        !accountability.validity ||
        !accountability.validity[0]
      )
        return true;

      const validityDates = agreement.accountability?.data?.validity.split(
        ' a ',
      );

      if (validityDates.length <= 1) return true;

      const parsedDate = parse(validityDates[0], 'dd/MM/yyyy', Date.now());

      return isAfter(parsedDate, parseISO(accountability.validity[0]));
    });

    agreements = agreements.filter(agreement => {
      if (
        !agreement.accountability?.data?.validity ||
        !accountability.validity ||
        !accountability.validity[1]
      )
        return true;

      const validityDates = agreement.accountability?.data?.validity.split(
        ' a ',
      );

      if (validityDates.length <= 1) return true;

      const parsedDate = parse(validityDates[1], 'dd/MM/yyyy', Date.now());

      return isAfter(parsedDate, parseISO(accountability.validity[1]));
    });
  }
  if (accountability?.limitDate) {
    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.limitDate &&
      accountability.limitDate &&
      accountability.limitDate[0]
        ? isAfter(
            agreement.accountability?.data?.limitDate,
            parseISO(accountability.limitDate[0]),
          )
        : true,
    );

    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.limitDate &&
      accountability.limitDate &&
      accountability.limitDate[1]
        ? isBefore(
            agreement.accountability?.data?.limitDate,
            parseISO(accountability.limitDate[1]),
          )
        : true,
    );
  }
  if (accountability?.totalValue) {
    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.totalValue &&
      accountability.totalValue &&
      accountability.totalValue[0]
        ? greaterThanOrEqual(
            agreement.accountability?.data?.totalValue,
            Number(accountability.totalValue[0]),
          )
        : true,
    );

    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.totalValue &&
      accountability.totalValue &&
      accountability.totalValue[1]
        ? lessThanOrEqual(
            agreement.accountability?.data?.totalValue,
            Number(accountability.totalValue[1]),
          )
        : true,
    );
  }
  if (accountability?.transferValue) {
    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.transferValue &&
      accountability.transferValue &&
      accountability.transferValue[0]
        ? greaterThanOrEqual(
            agreement.accountability?.data?.transferValue,
            Number(accountability.transferValue[0]),
          )
        : true,
    );

    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.transferValue &&
      accountability.transferValue &&
      accountability.transferValue[1]
        ? lessThanOrEqual(
            agreement.accountability?.data?.transferValue,
            Number(accountability.transferValue[1]),
          )
        : true,
    );
  }
  if (accountability?.counterpartValue) {
    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.counterpartValue &&
      accountability.counterpartValue &&
      accountability.counterpartValue[0]
        ? greaterThanOrEqual(
            agreement.accountability?.data?.counterpartValue,
            Number(accountability.counterpartValue[0]),
          )
        : true,
    );

    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.counterpartValue &&
      accountability.counterpartValue &&
      accountability.counterpartValue[1]
        ? lessThanOrEqual(
            agreement.accountability?.data?.counterpartValue,
            Number(accountability.counterpartValue[1]),
          )
        : true,
    );
  }
  if (accountability?.yieldValue) {
    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.yieldValue &&
      accountability.yieldValue &&
      accountability.yieldValue[0]
        ? greaterThanOrEqual(
            agreement.accountability?.data?.yieldValue,
            Number(accountability.yieldValue[0]),
          )
        : true,
    );

    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.yieldValue &&
      accountability.yieldValue &&
      accountability.yieldValue[1]
        ? lessThanOrEqual(
            agreement.accountability?.data?.yieldValue,
            Number(accountability.yieldValue[1]),
          )
        : true,
    );
  }

  return agreements;
};

export default class FilterAgreementsService {
  public async execute({
    agreements: _agreements,
    filters,
  }: Request): Promise<Agreement[]> {
    let agreements = _agreements;
    const { celebration, execution, accountability } = filters;

    agreements = filterCelebration({ agreements, celebration });
    agreements = filterExecution({ agreements, execution });
    agreements = filterAccountability({ agreements, accountability });

    return agreements;
  }
}
