import { Router } from 'express';

import { celebrate, Joi } from 'celebrate';
import SessionsController from '~/controllers/SessionsController';

const sessionsRouter = Router();

sessionsRouter.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  SessionsController.create,
);

export default sessionsRouter;
