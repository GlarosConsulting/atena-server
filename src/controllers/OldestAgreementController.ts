import { Request, Response } from 'express';

import AgreementsRepository from '~/repositories/AgreementsRepository';

class OldestAgreementController {
  async index(_request: Request, response: Response) {
    const agreements = await AgreementsRepository.findAll();

    agreements.sort((a, b) => {
      if (!a.proposalData?.data?.biddingDate) return 1;
      if (!b.proposalData?.data?.biddingDate) return 1;

      return a.proposalData?.data?.biddingDate <
        b.proposalData?.data?.biddingDate
        ? -1
        : 0;
    });

    return response.json(agreements[0]);
  }
}

export default new OldestAgreementController();
