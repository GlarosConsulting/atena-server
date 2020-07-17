import { Request, Response } from 'express';
import UsersRepository from '~/repositories/UsersRepository';

class SessionController {
  async create(request: Request, response: Response) {
    const { email } = request.body;

    const user = await UsersRepository.findByEmail(email);

    if (!user) {
      return response
        .status(404)
        .json({ error: 'Invalid e-mail or password.' });
    }

    return response.json({ user });
  }
}

export default new SessionController();
