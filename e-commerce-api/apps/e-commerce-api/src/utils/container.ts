import { DataSource } from "typeorm";

import * as Entities from "#entities";
import * as Repositories from "#repositories";
import * as Services from "#services";
import * as Controllers from "#controllers";
import * as Providers from "#providers";
import { create, hasProperty } from "./object";
import { Dependencies } from "#services/base";
import { uncapitalize } from "./string";

const ProviderMapping = {
  SendGridMailProvider: "MailProvider",
  StripePaymentGatewayProvider: "PaymentGatewayProvider",
};

type ModuleKey =
  | keyof typeof Entities
  | "Checkout"
  | "Auth"
  | "Metric"
  | "AdminOrder"
  | keyof typeof ProviderMapping;

type TRepository = typeof Repositories;
type TService = typeof Services;

type AllRegister = Controllers.Controllers &
  Services.Services &
  Providers.Providers;

type TAllRegister = {
  [key in keyof AllRegister]: AllRegister[key];
};

type Register<T extends keyof AllRegister> = TAllRegister[T];

export class Container {
  static #instance: Container;
  items: Map<string, any> = new Map();
  #dependencies = {} as Record<keyof Dependencies, any>;

  private constructor() {}

  static get instance() {
    if (!this.#instance) {
      this.#instance = new Container();
    }

    return this.#instance;
  }

  getItem<T extends keyof AllRegister>(name: T): Register<T> {
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
    Object.entries(Entities).forEach(([key, Entity]) => {
      const [repositoryKey, repositoryName] = create<TRepository>(key, {
        type: "Repository",
      });

      if (repositoryKey in Repositories) {
        this.#dependencies[uncapitalize(repositoryName) as keyof Dependencies] =
          new Repositories[repositoryKey](
            dataSource.manager.getRepository(Entity) as any,
          );
      } else {
        console.log("Missing register: ", key);
      }
    });

    return this;
  }

  register<T extends ModuleKey>(key: T) {
    const [providerKey, providerName] = create<typeof Providers>(key, {
      nameMapping: ProviderMapping,
    });

    if (hasProperty<keyof typeof Providers>(providerKey, Providers)) {
      const provider = new Providers[providerKey]();

      this.#dependencies[uncapitalize(providerName) as keyof Dependencies] =
        provider;
      this.setItem(providerName, provider);
      return this;
    }

    const [serviceKey] = create<TService>(key, { type: "Service" });
    const [controllerKey] = create<typeof Controllers>(key, {
      type: "Controller",
    });

    if (hasProperty<keyof TService>(serviceKey, Services)) {
      const service = new Services[serviceKey](this.#dependencies);
      this.setItem(serviceKey, service);

      if (hasProperty<keyof typeof Controllers>(controllerKey, Controllers)) {
        const controller = new Controllers[controllerKey](service as any);
        this.setItem(controllerKey, controller);
      }
    }

    return this;
  }
}
