import { Router } from 'express';

import { celebrate, Joi, celebrate } from 'celebrate';
import UserController from '~/controllers/UserController';

const usersRouter = Router();

usersRouter.get('/', UserController.findAll);
usersRouter.get(
  '/:id',
  celebrate({
    params: {
      id: Joi.string().uuid().required(),
    },
  }),
  UserController.show,
);
usersRouter.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      groupId: Joi.string().uuid(),
    }),
  }),
  UserController.create,
);
usersRouter.put(
  '/:id',
  celebrate({
    params: {
      id: Joi.string().uuid().required(),
    },
    body: Joi.object().keys({
      name: Joi.string(),
      username: Joi.string(),
      email: Joi.string().email(),
      groupId: Joi.string().uuid(),
    }),
  }),
  UserController.update,
);
usersRouter.delete('/:id', UserController.delete);

export default usersRouter;
