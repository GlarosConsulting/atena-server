import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import AgreementsController from '~/controllers/AgreementsController';

const agreementsRouter = Router();

agreementsRouter.get('/', AgreementsController.index);
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
  AgreementsController.show,
);
agreementsRouter.post('', AgreementsController.create);
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
  AgreementsController.update,
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
  AgreementsController.delete,
);
agreementsRouter.patch('/test', AgreementsController.test);

export default agreementsRouter;
