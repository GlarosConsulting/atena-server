import { Router } from 'express';

import { celebrate, Joi } from 'celebrate';
import SessionController from '~/controllers/SessionController';

const sessionsRouter = Router();

sessionsRouter.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  SessionController.create,
);

export default sessionsRouter;
