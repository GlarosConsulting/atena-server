import {
  City as _City,
  CityCreateInput,
  CityUpdateInput,
} from '@prisma/client';
import Repository from './Repository';

export type City = _City;

class CitiesRepository extends Repository<
  City,
  CityCreateInput,
  CityUpdateInput
> {
  findAll(): Promise<City[]> {
    return this.prisma.city.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: string): Promise<City | null> {
    return this.prisma.city.findOne({
      where: { id },
    });
  }

  create(data: CityCreateInput): Promise<City | null> {
    return this.prisma.city.create({ data });
  }

  update(id: string, data: CityUpdateInput): Promise<City | null> {
    return this.prisma.city.update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<City | null> {
    return this.prisma.city.delete({
      where: { id },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.city.count({ where: { id } });

    return count > 0;
  }

  findByIbge(ibge: string): Promise<City | null> {
    return this.prisma.city.findOne({
      where: { ibge },
    });
  }

  async getDefault(): Promise<City | null> {
    let city = await this.prisma.city.findOne({
      where: {
        ibge: 'DEFAULT',
      },
    });

    if (!city) {
      city = await this.prisma.city.create({
        data: {
          ibge: 'DEFAULT',
          name: 'DEFAULT',
          uf: 'DEFAULT',
        },
      });
    }

    return city;
  }
}

export default new CitiesRepository();
