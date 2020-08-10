import { format, isAfter, parseISO, isBefore } from 'date-fns'; // eslint-disable-line
import ptBrLocale from 'date-fns/locale/pt-BR'; // eslint-disable-line

import { Agreement } from '~/repositories/AgreementsRepository';

interface Request {
  agreements: Agreement[];
  filters: PublicFilters;
}

export interface PublicFilters {
  beginDate: string;
  endDate: string;
  sphere: string;
  cityIds: string[];
  UF?: string;
  Cidade?: string;
  NumeroLicitacao?: string;
  NumProcessoLicitacao?: string;
  ObjetoLicitacao?: string;
  NumeroEdital?: string;
  DataPublicacaoEdital?: string;
  DataLicitacao?: string;
  DataHomologacao?: string;
  ReferenciaLegal?: string;
  DescricaoLicitacao?: string;
  ModalidadeLicitacao?: string;
  RegistroDePreco?: string;
  ValorLicitacao?: string;
  customFilter: string;
}

const containsCaseInsensitive = (
  str: string | null | undefined,
  compare: string,
): boolean => (str ? str.toLowerCase().includes(compare.toLowerCase()) : false);

export default class PublicFilterAgreementsService {
  public async execute({
    agreements: _agreements,
    filters,
  }: Request): Promise<Agreement[]> {
    let agreements = _agreements;
    const {
      beginDate,
      endDate,
      sphere,
      cityIds,
      customFilter,
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
    } = filters;

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
    if (sphere)
      agreements = agreements.filter(
        agreement => agreement.company?.sphere === sphere,
      );
    if (cityIds && cityIds.length > 0)
      agreements = agreements.filter(agreement =>
        agreement.company?.cityId
          ? cityIds.includes(agreement.company?.cityId)
          : true,
      );
    if (customFilter) {
      switch (customFilter) {
        case 'empenhados':
          agreements = agreements.filter(agreement =>
            containsCaseInsensitive(
              agreement.proposalData?.data?.modality,
              'Convênio',
            ),
          );
          break;
        case 'execucao':
          agreements = agreements.filter(
            agreement =>
              containsCaseInsensitive(
                agreement.proposalData?.data?.modality,
                'Convênio',
              ) &&
              containsCaseInsensitive(
                agreement.proposalData?.data?.status?.value,
                'Em execução',
              ),
          );
          break;
        case 'contratos-repasse':
          agreements = agreements.filter(agreement =>
            containsCaseInsensitive(
              agreement.proposalData?.data?.modality,
              'Contrato de repasse',
            ),
          );
          break;
        case 'contratos-repasse-execucao':
          agreements = agreements.filter(
            agreement =>
              containsCaseInsensitive(
                agreement.proposalData?.data?.modality,
                'Contrato de repasse',
              ) &&
              containsCaseInsensitive(
                agreement.proposalData?.data?.status?.value,
                'Em execução',
              ),
          );
          break;
        case 'licitacoes-concluidas':
          agreements = agreements.filter(agreement =>
            agreement.convenientExecution?.executionProcesses.some(
              executionProcess =>
                containsCaseInsensitive(
                  executionProcess.details?.executionProcess,
                  'Licitação',
                ),
            ),
          );
          break;
        case 'contratos-concluidos':
          agreements = agreements.filter(agreement =>
            agreement.convenientExecution?.contracts.some(contract =>
              contract.details?.endDate
                ? isBefore(contract.details?.endDate, new Date())
                : true,
            ),
          );
          break;
        default:
          break;
      }
    }

    if (UF)
      agreements = agreements.filter(agreement =>
        containsCaseInsensitive(agreement.company?.city.uf || '', UF),
      );
    if (Cidade)
      agreements = agreements.filter(agreement =>
        containsCaseInsensitive(agreement.company?.city.name || '', Cidade),
      );
    if (NumeroLicitacao)
      agreements = agreements.filter(agreement =>
        containsCaseInsensitive(agreement.agreementId, NumeroLicitacao),
      );
    if (NumProcessoLicitacao)
      agreements = agreements.filter(agreement =>
        containsCaseInsensitive(
          agreement.proposalData?.data?.processId
            ? agreement.proposalData?.data?.processId
            : null,
          NumProcessoLicitacao,
        ),
      );
    if (ObjetoLicitacao)
      agreements = agreements.filter(agreement =>
        containsCaseInsensitive(
          agreement.proposalData?.data?.object
            ? agreement.proposalData?.data?.object
            : null,
          ObjetoLicitacao,
        ),
      );
    if (NumeroEdital)
      agreements = agreements.filter(agreement =>
        containsCaseInsensitive(
          agreement.proposalData?.data?.proposalId
            ? agreement.proposalData?.data?.proposalId
            : null,
          NumeroEdital,
        ),
      );
    if (DataPublicacaoEdital)
      agreements = agreements.filter(agreement =>
        containsCaseInsensitive(
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
        containsCaseInsensitive(
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
        containsCaseInsensitive(
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
        containsCaseInsensitive(
          agreement.proposalData?.data?.legalFoundation
            ? agreement.proposalData?.data?.legalFoundation
            : null,
          ReferenciaLegal,
        ),
      );
    if (DescricaoLicitacao)
      agreements = agreements.filter(agreement =>
        containsCaseInsensitive(
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
              containsCaseInsensitive(process.type, ModalidadeLicitacao),
            )
          : true,
      );
    if (RegistroDePreco)
      agreements = agreements.filter(agreement =>
        agreement.convenientExecution
          ? agreement.convenientExecution.executionProcesses.some(process =>
              containsCaseInsensitive(
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
              containsCaseInsensitive(
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

    return agreements;
  }
}
