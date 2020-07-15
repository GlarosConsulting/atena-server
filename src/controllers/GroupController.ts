import { Request, Response } from 'express';

import GroupsRepository from '~/repositories/GroupsRepository';
import CitiesRepository from '~/repositories/CitiesRepository';
import everyAsync from '~/utils/everyAsync';

class GroupController {
  async findAll(request: Request, response: Response) {
    const groups = await GroupsRepository.findAll();

    return response.json(groups);
  }

  async create(request: Request, response: Response) {
    const { name, cities }: { name: string; cities: string[] } = request.body;

    const checkAllCitiesExists = await everyAsync(cities, cityId =>
      CitiesRepository.existsById(cityId),
    );

    if (!checkAllCitiesExists) {
      return response
        .status(404)
        .json({ error: 'Some provided city ID is invalid.' });
    }

    const group = await GroupsRepository.create({
      name,
      cities: {
        connect: cities.map(cityId => ({ id: cityId })),
      },
    });

    return response.json(group);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { name, cities }: { name: string; cities: string[] } = request.body;

    const checkGroupExists = await GroupsRepository.existsById(id);

    if (!checkGroupExists) {
      return response
        .status(404)
        .json({ error: 'No group found with this ID.' });
    }

    const checkAllCitiesExists = await everyAsync(cities, cityId =>
      CitiesRepository.existsById(cityId),
    );

    if (!checkAllCitiesExists) {
      return response
        .status(404)
        .json({ error: 'Some provided city ID is invalid.' });
    }

    const updatedGroup = await GroupsRepository.update(id, {
      name,
      cities: {
        set: cities.map(cityId => ({ id: cityId })),
      },
    });

    return response.json(updatedGroup);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const checkGroupExists = await GroupsRepository.existsById(id);

    if (!checkGroupExists) {
      return response
        .status(404)
        .json({ error: 'No group found with this ID.' });
    }

    const deletedGroup = await GroupsRepository.delete(id);

    return response.json(deletedGroup);
  }

  async findAllAsLookup(request: Request, response: Response) {
    const groups = await GroupsRepository.findAll();

    const lookup: { [key: string]: string } = {};

    groups.forEach(group => {
      lookup[group.id] = group.name;
    });

    return response.json(lookup);
  }
}

export default new GroupController();
