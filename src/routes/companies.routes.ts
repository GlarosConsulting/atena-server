import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import multer from 'multer';

import uploadConfig from '~/config/upload';
import CompaniesController from '~/controllers/CompaniesController';

const companiesRouter = Router();
const upload = multer(uploadConfig);

companiesRouter.get(
  '/',
  celebrate(
    {
      query: Joi.object().keys({
        page: Joi.number(),
        rowsPerPage: Joi.number(),
      }),
    },
    { abortEarly: false },
  ),
  CompaniesController.findAll,
);
companiesRouter.post(
  '/import',
  upload.single('file'),
  CompaniesController.import,
);

export default companiesRouter;
