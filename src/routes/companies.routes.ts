import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import multer from 'multer';

import uploadConfig from '~/config/upload';
import CompanyController from '~/controllers/CompanyController';

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
  CompanyController.findAll,
);
companiesRouter.post(
  '/import',
  upload.single('file'),
  CompanyController.import,
);

export default companiesRouter;
