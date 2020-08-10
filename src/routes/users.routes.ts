import { Router } from 'express';

import { celebrate, Joi } from 'celebrate';
import UsersController from '~/controllers/UsersController';

const usersRouter = Router();

usersRouter.get('/', UsersController.findAll);
usersRouter.get(
  '/:id',
  celebrate({
    params: {
      id: Joi.string().uuid().required(),
    },
  }),
  UsersController.show,
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
  UsersController.create,
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
  UsersController.update,
);
usersRouter.delete('/:id', UsersController.delete);

export default usersRouter;
