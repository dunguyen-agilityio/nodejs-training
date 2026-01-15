import { DataSource, QueryRunner } from "typeorm";

import * as Entities from "#entities";
import * as Repositories from "#repositories";
import * as Services from "#services";
import * as Controllers from "#controllers";

import { TController, TRepository, TService } from "#types/container";
import { BaseService } from "#services/base";

type Item = TRepository & TService & TController;

export class Container {
  static #instance: Container;
  #dataSource: DataSource;
  #queryRunner: QueryRunner;
  items: Map<string, any> = new Map();
  #registers: Map<string, keyof typeof Entities> = new Map();

  static get instance() {
    if (!this.#instance) {
      this.#instance = new Container();
    }

    return this.#instance;
  }

  getItem<T extends keyof Item>(name: T): Item[T] {
    return this.items.get(name);
  }

  setItem(name: string, value: any) {
    return this.items.set(name, value);
  }

  setDataSource(dataSource: DataSource) {
    this.#dataSource = dataSource;
    this.#queryRunner = this.#dataSource.createQueryRunner();
    return this;
  }

  register<T extends keyof typeof Entities>(entity: T, name: string = entity) {
    this.#registers.set(name, entity);
    return this;
  }

  build() {
    const repositories: Record<string, any> = {};
    this.#registers.forEach((entity) => {
      if (!this.items.has(`${entity.toLowerCase()}Repository`)) {
        const repository = new Repositories[`${entity}Repository`](
          this.#dataSource.getRepository(Entities[entity]) as any
        );

        repositories[`${entity.toLowerCase()}Repository`] = repository;

        this.setItem(`${entity.toLowerCase()}Repository` as any, repository);
      }
    });

    for (const [value] of this.#registers) {
      let service: BaseService = this.getItem(
        `${value.toLowerCase()}Service` as any
      );

      const serviceName = `${value}Service` as keyof typeof Services;

      if (!(serviceName in Services)) continue;

      if (!service) {
        service = new Services[serviceName](repositories as TRepository);

        this.setItem(`${value.toLowerCase()}Service`, service);
      }

      const controllerName = `${value}Controller` as keyof typeof Controllers;

      if (!(controllerName in Controllers)) continue;

      if (!this.items.has(`${value.toLowerCase()}Controller`)) {
        const controller = new Controllers[controllerName](service as any);
        this.setItem(`${value.toLowerCase()}Controller`, controller);
      }
    }

    return this;
  }

  get queryRunner() {
    return this.#queryRunner;
  }
}
