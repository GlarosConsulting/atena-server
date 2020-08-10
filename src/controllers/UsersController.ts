import { Request, Response } from 'express';

import UsersRepository from '~/repositories/UsersRepository';
import GroupsRepository from '~/repositories/GroupsRepository';

class UsersController {
  async findAll(request: Request, response: Response) {
    const users = await UsersRepository.findAll();

    return response.json(users);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const user = await UsersRepository.findById(id);

    if (!user) {
      return response
        .status(404)
        .json({ error: 'No user found with this ID.' });
    }

    return response.json(user);
  }

  async create(request: Request, response: Response) {
    const { name, username, email, groupId } = request.body;

    const userByUsername = await UsersRepository.findByUsername(username);

    if (userByUsername) {
      return response.status(409).json({ error: 'Username already used.' });
    }

    const userByEmail = await UsersRepository.findByEmail(email);

    if (userByEmail) {
      return response.status(409).json({ error: 'E-mail already used.' });
    }

    const group = await GroupsRepository.findById(groupId || '');

    if (groupId && !group) {
      return response
        .status(409)
        .json({ error: 'No group found with this ID.' });
    }

    const user = await UsersRepository.create({
      name,
      username,
      email,
      group: group && {
        connect: {
          id: groupId,
        },
      },
    });

    return response.json(user);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { name, username, email, groupId } = request.body;

    const checkUserExists = await UsersRepository.existsById(id);

    if (!checkUserExists) {
      return response
        .status(404)
        .json({ error: 'No user found with thid ID.' });
    }

    const userByUsername = await UsersRepository.findByUsername(username || '');

    if (userByUsername && userByUsername.id !== id) {
      return response.status(409).json({ error: 'Username already used.' });
    }

    const userByEmail = await UsersRepository.findByEmail(email || '');

    if (userByEmail && userByEmail.id !== id) {
      return response.status(409).json({ error: 'E-mail already used.' });
    }

    const group = await GroupsRepository.findById(groupId);

    if (!group) {
      return response
        .status(404)
        .json({ error: 'No group found with this ID.' });
    }

    const updateUser = await UsersRepository.update(id, {
      name,
      username,
      email,
      group: {
        connect: {
          id: groupId,
        },
      },
    });

    return response.json(updateUser);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const checkUserExists = await UsersRepository.existsById(id);

    if (!checkUserExists) {
      return response
        .status(404)
        .json({ error: 'No user found with thid ID.' });
    }

    const deleteUser = await UsersRepository.delete(id);

    return response.json(deleteUser);
  }
}

export default new UsersController();
