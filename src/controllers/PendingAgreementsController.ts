import { Request, Response } from 'express';
import FindPendingAgreementsService from '~/services/FindPendingAgreementsService';

class PendingAgreementsController {
  async index(_request: Request, response: Response) {
    const findPendingAgreements = new FindPendingAgreementsService();

    const pendingAgreements = await findPendingAgreements.execute();

    return response.json(pendingAgreements);
  }
}

export default new PendingAgreementsController();
