import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import AgreementController from '~/controllers/AgreementsFilterController';

const agreementsFilterRouter = Router();

agreementsFilterRouter.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      filters: Joi.object().required(),
    }),
  }),
  AgreementController.index,
);

export default agreementsFilterRouter;
