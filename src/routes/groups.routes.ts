import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import GroupController from '~/controllers/GroupController';

const groupsRouter = Router();

groupsRouter.get('/', GroupController.findAll);
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
  GroupController.create,
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
  GroupController.update,
);
groupsRouter.delete(
  '/:id',
  celebrate({
    params: {
      id: Joi.string().uuid(),
    },
  }),
  GroupController.delete,
);
groupsRouter.get('/lookup', GroupController.findAllAsLookup);

export default groupsRouter;
