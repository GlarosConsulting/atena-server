import { Router } from 'express';

import sessionsRouter from '~/routes/sessions.routes';
import agreementsRouter from '~/routes/agreements.routes';
import usersRouter from '~/routes/users.routes';
import groupsRouter from '~/routes/groups.routes';
import companiesRouter from '~/routes/companies.routes';
import citiesRouter from '~/routes/cities.routes';

const router = Router();

router.use('/sessions', sessionsRouter);
router.use('/agreements', agreementsRouter);
router.use('/users', usersRouter);
router.use('/groups', groupsRouter);
router.use('/companies', companiesRouter);
router.use('/cities', citiesRouter);

router.get('/ping', (request, response) => {
  return response.send('Pong');
});

export default router;
