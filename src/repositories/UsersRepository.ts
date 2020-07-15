import {
  User as _User,
  UserCreateInput,
  UserUpdateInput,
} from '@prisma/client';
import Repository from './Repository';

export type User = _User;

class CitiesRepository extends Repository<
  User,
  UserCreateInput,
  UserUpdateInput
> {
  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({});
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findOne({
      where: { id },
    });
  }

  create(data: UserCreateInput): Promise<User | null> {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: UserUpdateInput): Promise<User | null> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<User | null> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { id } });

    return count > 0;
  }
}

export default new CitiesRepository();
