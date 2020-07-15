import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import AgreementController from '~/controllers/AgreementController';

const agreementsRouter = Router();

agreementsRouter.get('/', AgreementController.index);
agreementsRouter.get(
  '/:id',
  celebrate(
    {
      params: Joi.object({
        id: Joi.string().uuid().required(),
      }),
    },
    { abortEarly: false },
  ),
  AgreementController.show,
);
agreementsRouter.post('', AgreementController.create);
agreementsRouter.put(
  '/:id',
  celebrate(
    {
      params: Joi.object({
        id: Joi.string().uuid().required(),
      }),
      body: Joi.object({
        id: Joi.string().optional(),
        name: Joi.string(),
        status: Joi.string(),
        start: Joi.date(),
        end: Joi.date(),
        program: Joi.string(),
      }),
    },
    { abortEarly: false },
  ),
  AgreementController.update,
);
agreementsRouter.delete(
  '/:id',
  celebrate(
    {
      params: Joi.object({
        id: Joi.string().uuid().required(),
      }),
    },
    { abortEarly: false },
  ),
  AgreementController.delete,
);
agreementsRouter.patch('/test', AgreementController.test);

export default agreementsRouter;
