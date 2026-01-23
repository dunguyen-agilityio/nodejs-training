import { DataSource, QueryRunner } from "typeorm";

import * as Entities from "#entities";
import * as Repositories from "#repositories";
import * as Services from "#services";
import * as Controllers from "#controllers";
import * as TControllers from "#controllers/types";
import * as Providers from "#providers";

import { BaseRepository } from "#repositories/base";
import { BaseService } from "#services/base";
import { BaseController } from "#controllers/base";
import { create, hasProperty } from "./object";

type ModuleKey =
  | keyof typeof Entities
  | "Checkout"
  | "SendGridMail"
  | "StripePaymentGateway"
  | "Auth"
  | keyof TProviders;

const AllRegister = { ...TControllers, ...Services, ...Providers };

type TRepository = typeof Repositories;
type TService = typeof Services;
type TProviders = typeof Providers;

type KeyRegister = keyof typeof AllRegister;

type TAllRegister = {
  [key in KeyRegister]: InstanceType<(typeof AllRegister)[key]>;
};

type Register<T extends KeyRegister> = TAllRegister[T];

export class Container {
  static #instance: Container;
  #dataSource: DataSource;
  #queryRunner: QueryRunner;
  items: Map<string, any> = new Map();
  #repositories: Record<string, BaseRepository> = {};

  private constructor() {}

  static get instance() {
    if (!this.#instance) {
      this.#instance = new Container();
    }

    return this.#instance;
  }

  getItem<T extends KeyRegister>(name: T): Register<T> {
    const item = this.items.get(name);

    if (!item) {
      throw new Error(`Missing register ${name}`);
    }

    return item as Register<T>;
  }

  setItem(name: string, value: any) {
    return this.items.set(name, value);
  }

  setDataSource(dataSource: DataSource) {
    this.#dataSource = dataSource;
    this.#queryRunner = this.#dataSource.createQueryRunner();

    this.#repositories = Object.entries(Entities).reduce(
      (prev, [key, Entity]) => {
        const [repositoryKey, repositoryName] = create<TRepository>(
          key,
          "Repository",
        );

        return {
          ...prev,
          [repositoryName]: new Repositories[repositoryKey](
            dataSource.manager.getRepository(Entity) as any,
          ),
        };
      },
      {} as {
        [key in keyof TRepository as Uncapitalize<key>]: InstanceType<
          TRepository[key]
        >;
      },
    );

    return this;
  }

  register<T extends ModuleKey>(key: T, context?: any) {
    if (context) {
      const [providerKey] = create<TProviders>(key, "Provider");
      this.setItem(providerKey, new Providers[providerKey](context));
    }

    const [serviceKey] = create<TService>(key, "Service");
    const [controllerKey] = create<typeof Controllers>(key, "Controller");

    if (hasProperty<keyof TService, typeof BaseService>(serviceKey, Services)) {
      const service = new Services[serviceKey]({
        paymentGatewayProvider: this.getItem("StripePaymentGatewayProvider"),
        mailProvider: this.getItem("SendGridMailProvider"),
        ...this.#repositories,
        authProvider: this.getItem("AuthProvider"),
      });
      this.setItem(serviceKey, service);

      if (
        hasProperty<keyof typeof Controllers, typeof BaseController>(
          controllerKey,
          Controllers,
        )
      ) {
        const controller = new Controllers[controllerKey](service);
        this.setItem(controllerKey, controller);
      }
    }

    return this;
  }

  get queryRunner() {
    return this.#queryRunner;
  }
}
