import { format, isAfter, parseISO, isBefore, parse, startOfDay, addMinutes, endOfDay, subMinutes } from 'date-fns'; // eslint-disable-line
import { utcToZonedTime } from 'date-fns-tz'; // eslint-disable-line
import ptBrLocale from 'date-fns/locale/pt-BR'; // eslint-disable-line

import { Agreement } from '~/repositories/AgreementsRepository';
import contains from '~/utils/contains';

interface Request {
  agreements: Agreement[];
  filters: PublicFilters;
}

export interface PublicFilters {
  beginDate: string;
  endDate: string;
  sphere: string;
  cityIds: string[];
  onlyAlerts: string;
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
      onlyAlerts,
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

    console.log(beginDate);
    console.log(parseISO(beginDate));
    console.log(startOfDay(parseISO(beginDate)));
    console.log(agreements[0].agreementId);
    console.log(
      utcToZonedTime(agreements[0].proposalData?.data?.biddingDate, 'UTC'),
    );
    console.log(
      utcToZonedTime(agreements[0].accountability.data.limitDate, 'UTC'),
    );

    if (beginDate)
      agreements = agreements.filter(agreement =>
        agreement.proposalData?.data?.biddingDate
          ? isAfter(
              addMinutes(
                startOfDay(
                  utcToZonedTime(
                    agreement.proposalData.data.biddingDate,
                    'UTC',
                  ),
                ),
                10,
              ),
              startOfDay(parseISO(beginDate)),
            )
          : true,
      );

    if (endDate)
      agreements = agreements.filter(agreement =>
        agreement.accountability?.data?.limitDate
          ? isBefore(
              subMinutes(
                endOfDay(
                  utcToZonedTime(
                    agreement.accountability.data.limitDate,
                    'UTC',
                  ),
                ),
                10,
              ),
              endOfDay(parseISO(endDate)),
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

    if (onlyAlerts === 'true') {
      agreements = agreements.filter(agreement =>
        agreement.convenientExecution?.executionProcesses.some(
          executionProcess =>
            contains(executionProcess.details?.executionProcess, 'Licitação'),
        ),
      );

      agreements = agreements.filter(agreement =>
        contains(
          agreement.accountability?.data?.status,
          'Enviada para Análise',
        ),
      );
    }

    if (customFilter) {
      switch (customFilter) {
        case 'empenhados':
          agreements = agreements.filter(
            agreement =>
              contains(agreement.proposalData?.data?.modality, 'Convênio') ||
              contains(
                agreement.proposalData?.data?.modality,
                'Contrato de Repasse',
              ),
          );
          break;
        case 'execucao':
          agreements = agreements.filter(
            agreement =>
              (contains(agreement.proposalData?.data?.modality, 'Convênio') ||
                contains(
                  agreement.proposalData?.data?.modality,
                  'Contrato de Repasse',
                )) &&
              contains(
                agreement.proposalData?.data?.status?.value,
                'Em execução',
              ),
          );
          break;
        case 'pendencias-negativadas':
          agreements = agreements.filter(
            agreement =>
              contains(
                agreement.proposalData?.data?.status?.value,
                'Rejeitada',
              ) &&
              contains(
                agreement.proposalData?.data?.status?.value,
                'Inadimpl',
              ) &&
              contains(
                agreement.proposalData?.data?.status?.value,
                'Ressalvas',
              ),
          );
          break;
        case 'interrompidas':
          agreements = agreements.filter(
            agreement =>
              contains(
                agreement.proposalData?.data?.status?.value,
                'Rescindido',
              ) &&
              contains(
                agreement.proposalData?.data?.status?.value,
                'Anulado',
              ) &&
              contains(
                agreement.proposalData?.data?.status?.value,
                'Cancelado',
              ) &&
              contains(agreement.proposalData?.data?.status?.value, 'Excluído'),
          );
          break;
        case 'procedimentos':
          agreements = agreements.filter(
            agreement =>
              contains(agreement.proposalData?.data?.modality, 'Licitação') ||
              contains(agreement.proposalData?.data?.modality, 'Dispensa') ||
              contains(
                agreement.proposalData?.data?.modality,
                'Inexigibilidade',
              ) ||
              contains(agreement.proposalData?.data?.modality, 'Subconvênio'),
          );
          break;
        case 'concluidas':
          agreements = agreements.filter(agreement => {
            const validity = agreement.accountability?.data?.validity;

            if (!validity) return false;

            const [, endValidityDate] = validity.split(' a ');

            return isBefore(
              parse(endValidityDate, 'dd/MM/yyyy', new Date()),
              new Date(),
            );
          });
          break;
        default:
          break;
      }
    }

    if (UF)
      agreements = agreements.filter(agreement =>
        contains(agreement.company?.city.uf || '', UF),
      );

    if (Cidade)
      agreements = agreements.filter(agreement =>
        contains(agreement.company?.city.name || '', Cidade),
      );

    if (NumeroLicitacao)
      agreements = agreements.filter(agreement =>
        contains(agreement.agreementId, NumeroLicitacao),
      );

    if (NumProcessoLicitacao)
      agreements = agreements.filter(agreement =>
        contains(
          agreement.proposalData?.data?.processId
            ? agreement.proposalData?.data?.processId
            : null,
          NumProcessoLicitacao,
        ),
      );

    if (ObjetoLicitacao)
      agreements = agreements.filter(agreement =>
        contains(
          agreement.proposalData?.data?.object
            ? agreement.proposalData?.data?.object
            : null,
          ObjetoLicitacao,
        ),
      );

    if (NumeroEdital)
      agreements = agreements.filter(agreement =>
        contains(
          agreement.proposalData?.data?.proposalId
            ? agreement.proposalData?.data?.proposalId
            : null,
          NumeroEdital,
        ),
      );

    if (DataPublicacaoEdital)
      agreements = agreements.filter(agreement =>
        contains(
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
        contains(
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
        contains(
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
        contains(
          agreement.proposalData?.data?.legalFoundation
            ? agreement.proposalData?.data?.legalFoundation
            : null,
          ReferenciaLegal,
        ),
      );

    if (DescricaoLicitacao)
      agreements = agreements.filter(agreement =>
        contains(
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
              contains(process.type, ModalidadeLicitacao),
            )
          : true,
      );

    if (RegistroDePreco)
      agreements = agreements.filter(agreement =>
        agreement.convenientExecution
          ? agreement.convenientExecution.executionProcesses.some(process =>
              contains(
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
              contains(
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
