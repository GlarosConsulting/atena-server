import { Router } from 'express';

import CitiesController from '~/controllers/CitiesController';

const citiesRouter = Router();

citiesRouter.get('/', CitiesController.findAll);

export default citiesRouter;
