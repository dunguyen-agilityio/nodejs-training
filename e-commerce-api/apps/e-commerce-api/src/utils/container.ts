import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";
import { BaseRepository } from "../repositories/base";
import { BaseService } from "../services/base";
import { BaseController } from "../controllers/base";

import * as Entities from "../entities";
import * as Repositories from "../repositories";
import * as Services from "../services";
import * as Controllers from "../controllers";

import type * as TService from "../services/types";
import type * as TController from "../controllers/types";

type Register<
  T extends ObjectLiteral = ObjectLiteral,
  R extends BaseRepository<T> = BaseRepository<T>,
  S extends BaseService<T> = BaseService<T>,
  C extends BaseController<T> = BaseController<T>,
> = {
  Repository: R;
  Service: S;
  Controller: C;
  name: string;
  entity: EntityTarget<T>;
};

export class Container {
  constructor(private datasource: DataSource) {}
  private dependencies: Register[] = [];
  private repositories: Record<string, BaseRepository> = {};

  register = (
    name: string,
    dependencies?: {
      entityName: keyof typeof Entities;
    }
  ) => {
    const entityName = (dependencies?.entityName ||
      name) as keyof typeof Entities;

    const repositoryName =
      `${entityName}Repository` as keyof typeof Repositories;
    const serviceName = `${name}Service` as keyof typeof Services;
    const controllerName = `${name}Controller` as keyof typeof Controllers;

    if (!(entityName in Entities))
      throw new Error(`Entity: ${entityName} not found`);

    if (!(repositoryName in Repositories))
      throw new Error(`Repository: ${repositoryName} not found`);

    if (!(serviceName in Services))
      throw new Error(`Service: ${serviceName} not found`);

    if (!(controllerName in Controllers))
      throw new Error(`Controller: ${controllerName} not found`);

    const entity = Entities[entityName];

    let repository = this.repositories[repositoryName];

    if (!repository) {
      const entityRepository = this.datasource.getRepository(entity);

      repository = new (Repositories[repositoryName] as typeof BaseRepository)(
        entityRepository
      );
    }

    const service = new (Services[serviceName] as typeof BaseService)(
      repository
    );

    const controller = new (Controllers[
      controllerName
    ] as typeof BaseController)(service);

    this.dependencies.push({
      Controller: controller,
      entity,
      name,
      Repository: repository,
      Service: service,
    });
  };

  getItem = <T extends TRegister["name"]>(
    name: T
  ): Extract<TRegister, { name: T }> => {
    const item = this.dependencies.find((item) => item.name === name);
    if (!item) throw new Error("Item not register");

    return {
      controller: item.Controller,
      service: item.Service,
      name,
    } as Extract<TRegister, { name: T }>;
  };
}

export type TRegister =
  | {
      name: "Auth";
      service: InstanceType<typeof TService.AbstractAuthService>;
      controller: TController.AbstractAuthController;
    }
  | {
      name: "User";
      service: TService.AbstractUserService;
      controller: TController.AbstractUserController;
    }
  | {
      name: "Product";
      service: TService.AbstractProductService;
      controller: TController.AbstractProductController;
    }
  | {
      name: "Category";
      service: TService.AbstractCategoryService;
      controller: TController.AbstractCategoryController;
    }
  | {
      name: "Cart";
      service: TService.AbstractCartService;
      controller: TController.AbstractCartController;
    }
  | {
      name: "CartItem";
      service: TService.AbstractCartItemService;
      controller: TController.AbstractCartItemController;
    };
