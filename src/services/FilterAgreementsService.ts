import { isEqual, parseISO } from 'date-fns';

import { Agreement } from '~/repositories/AgreementsRepository';
import contains from '~/utils/contains';

export interface Filters {
  celebration?: {
    agreementId?: string;
    modality?: string;
    processId?: string;
    proposalId?: string;
    proposalDate?: string;
    biddingDate?: string;
    homologationDate?: string;
    legalFoundation?: string;
    value?: string;
    description?: string;
    object?: string;
  };
  execution?: {
    executionId?: string;
    type?: string;
    date?: string;
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
    validity?: string;
    limitDate?: string;
    totalValue?: string;
    transferValue?: string;
    counterpartValue?: string;
    yieldValue?: string;
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
      agreement.proposalData?.data?.proposalDate && celebration.proposalDate
        ? isEqual(
            agreement.proposalData?.data?.proposalDate,
            parseISO(celebration.proposalDate),
          )
        : true,
    );
  }
  if (celebration?.biddingDate) {
    agreements = agreements.filter(agreement =>
      agreement.proposalData?.data?.biddingDate && celebration.biddingDate
        ? isEqual(
            agreement.proposalData?.data?.biddingDate,
            parseISO(celebration.biddingDate),
          )
        : true,
    );
  }
  if (celebration?.homologationDate) {
    agreements = agreements.filter(agreement =>
      agreement.proposalData?.data?.homologationDate &&
      celebration.homologationDate
        ? isEqual(
            agreement.proposalData?.data?.homologationDate,
            parseISO(celebration.homologationDate),
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
  if (celebration?.legalFoundation) {
    agreements = agreements.filter(agreement =>
      contains(
        String(
          agreement.proposalData?.programs.reduce(
            (accumulator, el) => accumulator + (el.value || 0),
            0,
          ),
        ),
        celebration.legalFoundation,
      ),
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
        process.date && execution.date
          ? isEqual(process.date, parseISO(execution.date))
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
    agreements = agreements.filter(agreement =>
      contains(
        agreement.accountability?.data?.validity,
        accountability.validity,
      ),
    );
  }
  if (accountability?.limitDate) {
    agreements = agreements.filter(agreement =>
      agreement.accountability?.data?.limitDate && accountability.limitDate
        ? isEqual(
            agreement.accountability?.data?.limitDate,
            parseISO(accountability.limitDate),
          )
        : true,
    );
  }
  if (accountability?.totalValue) {
    agreements = agreements.filter(agreement =>
      contains(
        String(agreement.accountability?.data?.totalValue),
        accountability.totalValue,
      ),
    );
  }
  if (accountability?.transferValue) {
    agreements = agreements.filter(agreement =>
      contains(
        String(agreement.accountability?.data?.transferValue),
        accountability.transferValue,
      ),
    );
  }
  if (accountability?.counterpartValue) {
    agreements = agreements.filter(agreement =>
      contains(
        String(agreement.accountability?.data?.counterpartValue),
        accountability.counterpartValue,
      ),
    );
  }
  if (accountability?.yieldValue) {
    agreements = agreements.filter(agreement =>
      contains(
        String(agreement.accountability?.data?.yieldValue),
        accountability.yieldValue,
      ),
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
