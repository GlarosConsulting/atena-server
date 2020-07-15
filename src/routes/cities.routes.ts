import { Router } from 'express';

import CityController from '~/controllers/CityController';

const citiesRouter = Router();

citiesRouter.get('/', CityController.findAll);

export default citiesRouter;
