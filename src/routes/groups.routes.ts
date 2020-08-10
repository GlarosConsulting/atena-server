import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import GroupsController from '~/controllers/GroupsController';

const groupsRouter = Router();

groupsRouter.get('/', GroupsController.findAll);
groupsRouter.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      access: Joi.string()
        .uppercase()
        .valid('ANY', 'MUNICIPAL_SPHERE', 'STATE_SPHERE', 'CITIES')
        .required(),
      cityIds: Joi.array().items(Joi.string().uuid()).min(1),
    }),
  }),
  GroupsController.create,
);
groupsRouter.put(
  '/:id',
  celebrate({
    params: {
      id: Joi.string().uuid(),
    },
    body: Joi.object().keys({
      name: Joi.string(),
      access: Joi.string()
        .uppercase()
        .valid('ANY', 'MUNICIPAL_SPHERE', 'STATE_SPHERE', 'CITIES'),
      cityIds: Joi.array().items(Joi.string().uuid()),
    }),
  }),
  GroupsController.update,
);
groupsRouter.delete(
  '/:id',
  celebrate({
    params: {
      id: Joi.string().uuid(),
    },
  }),
  GroupsController.delete,
);
groupsRouter.get('/lookup', GroupsController.findAllAsLookup);

export default groupsRouter;
