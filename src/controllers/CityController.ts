import { Request, Response } from 'express';

import CitiesRepository from '../repositories/CitiesRepository';

class CityController {
  async findAll(request: Request, response: Response) {
    const cities = await CitiesRepository.findAll();

    return response.json(cities);
  }
}

export default new CityController();
