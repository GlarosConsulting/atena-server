import express from 'express';
import { celebrate, SchemaOptions, Joi } from 'celebrate';

import AgreementController from './controllers/AgreementController';

const routes = express.Router();

routes.get('/agreements', AgreementController.index);
routes.get(
  '/agreements/:id',
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
routes.post('/agreements', AgreementController.create);
routes.put(
  '/agreements/:id',
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
routes.delete(
  '/agreements/:id',
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

export default routes;
