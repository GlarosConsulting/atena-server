import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import AgreementsFilterController from '~/controllers/AgreementsFilterController';

const agreementsFilterRouter = Router();

agreementsFilterRouter.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      filters: Joi.object().required(),
    }),
  }),
  AgreementsFilterController.index,
);

export default agreementsFilterRouter;
