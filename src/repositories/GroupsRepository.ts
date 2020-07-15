import {
  GroupGetPayload,
  GroupCreateInput,
  GroupUpdateInput,
} from '@prisma/client';
import Repository from './Repository';

export type Group = GroupGetPayload<{
  include: {
    cities: true;
  };
}>;

class GroupsRepository extends Repository<
  Group,
  GroupCreateInput,
  GroupUpdateInput
> {
  findAll(): Promise<Group[]> {
    return this.prisma.group.findMany({ include: { cities: true } });
  }

  findById(id: string): Promise<Group | null> {
    return this.prisma.group.findOne({
      where: { id },
      include: { cities: true },
    });
  }

  create(data: GroupCreateInput): Promise<Group | null> {
    return this.prisma.group.create({ data, include: { cities: true } });
  }

  update(id: string, data: GroupUpdateInput): Promise<Group | null> {
    return this.prisma.group.update({
      where: { id },
      data,
      include: { cities: true },
    });
  }

  delete(id: string): Promise<Group | null> {
    return this.prisma.group.delete({
      where: { id },
      include: { cities: true },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.group.count({
      where: { id },
    });

    return count > 0;
  }
}

export default new GroupsRepository();
