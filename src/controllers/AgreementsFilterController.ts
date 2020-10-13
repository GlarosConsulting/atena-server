import { Request, Response } from 'express';

import AgreementsRepository from '~/repositories/AgreementsRepository';
import BuildAgreementsStatisticsService from '~/services/BuildAgreementsStatisticsService';
import PublicFilterAgreementsService, {
  PublicFilters,
} from '~/services/PublicFilterAgreementsService';
import FilterAgreementsService, {
  Filters,
} from '~/services/FilterAgreementsService';
import BuildPendingAgreementsService from '~/services/BuildPendingAgreementsService';

class AgreementsFilterController {
  async index(request: Request, response: Response) {
    const publicFilters = (request.query as unknown) as PublicFilters;
    const { filters } = request.body as { filters: Filters };

    let agreements = await AgreementsRepository.findAll();

    const publicFilterAgreements = new PublicFilterAgreementsService();
    const filterAgreements = new FilterAgreementsService();
    const buildAgreementsStatistics = new BuildAgreementsStatisticsService();
    const buildPendingAgreementsService = new BuildPendingAgreementsService();

    agreements = await publicFilterAgreements.execute({
      agreements,
      filters: publicFilters,
    });

    agreements = await filterAgreements.execute({
      agreements,
      filters,
    });

    const pendingAgreements = await buildPendingAgreementsService.execute({
      agreements,
    });

    const statistics = buildAgreementsStatistics.execute({ agreements });

    return response
      .header('X-Total-Count', String(agreements.length))
      .json({ statistics, agreements, pendingAgreements });
  }
}

export default new AgreementsFilterController();
