import { Request, Response } from 'express';
import path from 'path';
import readExcelFile from 'read-excel-file/node';
import axios from 'axios';

import { CityUpdateOneRequiredWithoutCompaniesInput } from '@prisma/client';
import uploadConfig from '~/config/upload';
import CompaniesRepository, {
  Company,
} from '~/repositories/CompaniesRepository';
import CitiesRepository from '~/repositories/CitiesRepository';

interface CompanyExcelSchema {
  cnpj: string;
  name: string;
  ibge: number;
  sphere: string;
}

interface IBGECityResponse {
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
      };
    };
  };
}

class CompaniesController {
  async findAll(request: Request, response: Response) {
    const { page, rowsPerPage } = request.query;

    const companies = await CompaniesRepository.findAllPaginated({
      page: Number(page),
      rowsPerPage: Number(rowsPerPage),
    });
    const totalCount = await CompaniesRepository.count();

    return response
      .header('X-Total-Count', String(totalCount))
      .header(
        'X-Total-Pages',
        String(Math.ceil(totalCount / Number(rowsPerPage || totalCount))),
      )
      .json(companies);
  }

  async import(request: Request, response: Response) {
    const importFilePath = path.join(
      uploadConfig.directory,
      request.file.filename,
    );

    const schema = {
      cnpj: {
        prop: 'cnpj',
        type: String,
      },
      nome: {
        prop: 'name',
        type: String,
      },
      codigo_ibge: {
        prop: 'ibge',
        type: String,
      },
      esfera: {
        prop: 'sphere',
        type: String,
      },
    };

    const { rows } = await readExcelFile<CompanyExcelSchema>(importFilePath, {
      schema,
    });

    const companies: Company[] = [];

    for (const row of rows) {
      const { cnpj, name, ibge, sphere } = row;

      const cityByIbge = await CitiesRepository.findByIbge(String(ibge));

      let city: CityUpdateOneRequiredWithoutCompaniesInput | null = null;

      if (cityByIbge) {
        city = {
          connect: {
            id: cityByIbge?.id,
          },
        };
      } else {
        try {
          const ibgeResponse = await axios.get<IBGECityResponse>(
            `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${ibge}`,
          );

          const { nome, microrregiao } = ibgeResponse.data;

          city = {
            create: {
              ibge: String(ibge),
              name: nome,
              uf: microrregiao.mesorregiao.UF.sigla,
            },
          };
        } catch {
          const defaultCity = await CitiesRepository.getDefault();

          city = {
            connect: {
              id: defaultCity?.id,
            },
          };
        }
      }

      const company = await CompaniesRepository.findByCnpj(row.cnpj);

      if (company) {
        const updatedCompany = await CompaniesRepository.update(
          String(company.id),
          {
            name,
            city,
            sphere,
          },
        );

        if (updatedCompany) companies.push(updatedCompany);
      } else {
        const createdCompany = await CompaniesRepository.create({
          cnpj,
          name,
          city,
          sphere,
        });

        if (createdCompany) companies.push(createdCompany);
      }
    }

    return response.json(companies);
  }
}

export default new CompaniesController();
