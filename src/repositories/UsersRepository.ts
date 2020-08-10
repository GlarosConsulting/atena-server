import {
  UserGetPayload,
  UserCreateInput,
  UserUpdateInput,
} from '@prisma/client';
import Repository from './Repository';

export type User = UserGetPayload<{
  include: {
    group: {
      include: {
        cities: true;
      };
    };
  };
}>;

class CitiesRepository extends Repository<
  User,
  UserCreateInput,
  UserUpdateInput
> {
  private readonly include = {
    group: {
      include: {
        cities: true,
      },
    },
  };

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ include: this.include });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findOne({
      where: { id },
      include: this.include,
    });
  }

  create(data: UserCreateInput): Promise<User | null> {
    return this.prisma.user.create({ data, include: this.include });
  }

  update(id: string, data: UserUpdateInput): Promise<User | null> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: this.include,
    });
  }

  delete(id: string): Promise<User | null> {
    return this.prisma.user.delete({
      where: { id },
      include: this.include,
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { id } });

    return count > 0;
  }

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findOne({
      where: { username },
      include: this.include,
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findOne({
      where: { email },
      include: this.include,
    });
  }
}

export default new CitiesRepository();
