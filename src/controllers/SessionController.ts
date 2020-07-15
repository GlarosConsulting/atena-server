import { Request, Response } from 'express';
import ActiveDirectory from 'activedirectory2';

class SessionController {
  async create(request: Request, response: Response) {
    const config = {
      url: 'ldap://ad-glaros.southcentralus.cloudapp.azure.com',
      baseDN: 'dc=ad-glaros,dc=southcentralus,dc=cloudapp,dc=azure,dc=com',
      username: 'andre.victor',
      password: 'Desenvolvimento@123#',
    };

    const activeDirectory = new ActiveDirectory(config);

    activeDirectory.authenticate(
      config.username,
      config.password,
      (err, authenticated) => {
        console.log('err', err);
        console.log('authenticated', authenticated);
      },
    );

    return response.json({ ok: true });
  }
}

export default new SessionController();
