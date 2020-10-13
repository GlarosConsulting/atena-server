import { endOfDay, isBefore, subMinutes } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import AgreementsRepository, {
  Agreement,
} from '~/repositories/AgreementsRepository';
import contains from '~/utils/contains';

interface IRequest {
  agreements: Agreement[];
}

interface PendingAgreement {
  name: string;
  value: number;
  percentage: number;
}

class BuildPendingAgreementsService {
  public async execute({
    agreements: originalAgreements,
  }: IRequest): Promise<PendingAgreement[]> {
    const agreements = originalAgreements.filter(agreement =>
      agreement.accountability?.data?.limitDate
        ? isBefore(
            utcToZonedTime(agreement.accountability.data.limitDate, 'UTC'),
            new Date(),
          )
        : true,
    );

    const topPendingAgreementsCities: Agreement[] = agreements
      .sort(
        (a, b) =>
          agreements.filter(
            agreement => agreement.company?.city.ibge === a.company?.city.ibge,
          ).length -
          agreements.filter(
            agreement => agreement.company?.city.ibge === b.company?.city.ibge,
          ).length,
      )
      .reverse();

    const topCitiesName = topPendingAgreementsCities
      .map(agreement => agreement.company?.city.name)
      .filter(el => el) as string[];

    const topCitiesCount: { [key: string]: number } = {};

    topCitiesName.forEach(cityName => {
      topCitiesCount[cityName] = topCitiesName.filter(
        el => el === cityName,
      ).length;
    });

    const topCitiesCountTotal = Object.values(topCitiesCount).reduce(
      (accumulator, count) => accumulator + count,
      0,
    );

    const pendingAgreements = topCitiesName
      .filter((el, index) => {
        return topCitiesName.indexOf(el) === index;
      })
      .map<PendingAgreement>(cityName => {
        const count = topCitiesName.filter(el => el === cityName).length;

        const cityAgreements = agreements.filter(
          findAgreement => findAgreement.company?.city.name === cityName,
        );

        return {
          name: cityName,
          value: cityAgreements.reduce(
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
          percentage: (count / topCitiesCountTotal) * 100,
        };
      });

    return pendingAgreements;
  }
}

export default BuildPendingAgreementsService;
