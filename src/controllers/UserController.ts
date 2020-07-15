import { Request, Response } from 'express';

import UsersRepository from '../repositories/UsersRepository';

class UserController {
  async findAll(request: Request, response: Response) {
    const users = await UsersRepository.findAll();

    return response.json(users);
  }

  async create(request: Request, response: Response) {
    const users = await UsersRepository.findAll();

    return response.json(users);
  }
}

export default new UserController();
