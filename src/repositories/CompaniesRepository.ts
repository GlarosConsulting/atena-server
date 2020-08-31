import {
  CompanyGetPayload,
  CompanyCreateInput,
  CompanyUpdateInput,
  FindManyCompanyArgs,
} from '@prisma/client';
import Repository from './Repository';

export type Company = CompanyGetPayload<{
  include: {
    city: true;
  };
}>;

interface Pagination {
  page: number;
  rowsPerPage: number;
}

class AgreementRepository extends Repository<
  Company,
  CompanyCreateInput,
  CompanyUpdateInput
> {
  private readonly include = {
    city: true,
  };

  findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({
      include: this.include,
    });
  }

  findById(id: string): Promise<Company | null> {
    return this.prisma.company.findOne({
      where: { id },
      include: this.include,
    });
  }

  create(data: CompanyCreateInput): Promise<Company | null> {
    return this.prisma.company.create({ data, include: this.include });
  }

  update(id: string, data: CompanyUpdateInput): Promise<Company | null> {
    return this.prisma.company.update({
      where: { id },
      data,
      include: this.include,
    });
  }

  delete(id: string): Promise<Company | null> {
    return this.prisma.company.delete({
      where: { id },
      include: this.include,
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.company.count({ where: { id } });

    return count > 0;
  }

  count({ cities }: { cities?: string[] }): Promise<number> {
    let args: FindManyCompanyArgs = {};

    if (cities) {
      args = {
        where: {
          city: {
            name: {
              in: cities,
            },
          },
        },
      };
    }

    return this.prisma.company.count({ ...args });
  }

  findByCnpj(cnpj: string): Promise<Company | null> {
    return this.prisma.company.findOne({
      where: { cnpj },
      include: this.include,
    });
  }

  async findAllPaginated({
    cities,
    page,
    rowsPerPage,
  }: { cities?: string[] } & Pagination): Promise<Company[]> {
    let args: FindManyCompanyArgs = {};

    if (cities) {
      args = {
        where: {
          city: {
            name: {
              in: cities,
            },
          },
        },
      };
    }

    if (page && rowsPerPage) {
      args = {
        skip: (page - 1) * rowsPerPage,
        take: rowsPerPage,
      };
    }

    const companies = await this.prisma.company.findMany({
      ...args,
      include: this.include,
    });

    return companies;
  }
}

export default new AgreementRepository();
