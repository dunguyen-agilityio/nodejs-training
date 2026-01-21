import { DataSource, EntityTarget, ObjectLiteral, QueryRunner } from "typeorm";

import * as Entities from "#entities";
import * as Repositories from "#repositories";
import * as Services from "#services";
import * as Controllers from "#controllers";
import * as Providers from "#providers";

import { TController, TRepository, TService } from "#types/container";
import { uncapitalize } from "./string";
import Stripe from "stripe";
import { BaseRepository } from "#repositories/base";
import { BaseService } from "#services/base";
import { BaseController } from "#controllers/base";

import sgMail from "@sendgrid/mail";
import { AbstractPaymentGateway } from "#services/payment-gateway/type";
import { MailProvider } from "../providers/types";
import { BaseProvider } from "../providers/base";

export enum Payment {
  "Stripe" = "StripePaymentGateway",
}

export enum Mail {
  "SendGrid" = "SendGridMail",
}

type ModuleKey =
  | keyof typeof Entities
  | "Checkout"
  | "Mail"
  | "Auth"
  | Payment.Stripe
  | Mail.SendGrid;

type TProvider = {
  stripePaymentGatewayProvider: BaseProvider<sgMail.MailService>;
  sendGridMailProvider: BaseProvider<unknown, sgMail.MailService>;
};

type Item = TRepository & TService & TController & TProvider;

type ProviderName<K extends ModuleKey = ModuleKey> = `${K}Provider`;

type RepositoryName<K extends ModuleKey = ModuleKey> = `${K}Repository`;

type ServiceName<K extends ModuleKey = ModuleKey> = `${K}Service`;

type ControllerName<K extends ModuleKey = ModuleKey> = `${K}Controller`;

export class Container {
  static #instance: Container;
  #dataSource: DataSource;
  #queryRunner: QueryRunner;
  items: Map<string, any> = new Map();
  #registers: Map<string, ModuleKey> = new Map();
  #repositories: Record<string, any> = {};
  #stripe: Stripe;

  private constructor() {}

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

  register<T extends ModuleKey>(entity: T, name: string = entity) {
    if (name === Mail.SendGrid) {
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey) {
        throw new Error("SENDGRID_API_KEY environment variable is required");
      }
      sgMail.setApiKey(apiKey);
    }

    if (name === Payment.Stripe) {
      const apiKey = process.env.STRIPE_API_KEY;
      if (!apiKey) {
        throw new Error("STRIPE_API_KEY environment variable is required");
      }
      this.#stripe = new Stripe(apiKey);
    }

    this.#registers.set(name, entity);
    return this;
  }

  build() {
    const hasProperty = <K extends PropertyKey, V = unknown>(
      key: K,
      obj: object,
    ): obj is Record<K, V> => {
      return key in obj;
    };

    const providers: Record<string, BaseProvider> = {};

    this.#registers.forEach((entity) => {
      const providerkey = `${entity}Provider` as keyof typeof Providers;
      const providerName = (uncapitalize(entity) +
        "Provider") as keyof TProvider;

      if (
        hasProperty<ProviderName, BaseProvider<Stripe, sgMail.MailService>>(
          providerkey,
          Providers,
        )
      ) {
        const provider = new Providers[providerkey](this.#stripe, sgMail);
        this.setItem(providerName, provider);
        providers[providerName] = provider;
      }
    });

    this.#registers.forEach((entity) => {
      const repositoryName = uncapitalize(entity) + "Repository";
      const repositoryKey =
        `${entity}Repository` as `${typeof entity}Repository`;

      if (
        !this.items.has(repositoryName) &&
        hasProperty<ModuleKey, EntityTarget<ObjectLiteral>>(entity, Entities) &&
        hasProperty<RepositoryName, typeof BaseRepository>(
          repositoryKey,
          Repositories,
        )
      ) {
        const repo = this.#dataSource.getRepository(Entities[entity]);
        const repository = new Repositories[repositoryKey](repo);
        this.#repositories[repositoryName] = repository;
        this.setItem(repositoryName, repository);
      }
    });

    const { sendGridMailProvider, stripePaymentGatewayProvider } = providers;

    for (const [key, value] of this.#registers) {
      const serviceName = `${uncapitalize(key)}Service`;

      const serviceKey = `${value}Service` as keyof typeof Services;

      let service = this.items.get(serviceName);

      if (
        !service &&
        hasProperty<ServiceName, typeof BaseService>(serviceKey, Services)
      ) {
        service = new Services[serviceKey](
          this.#repositories as TRepository,
          stripePaymentGatewayProvider,
          sendGridMailProvider,
        );
        this.setItem(serviceName, service);
      }

      const controllerName = `${uncapitalize(key)}Controller`;
      const controllerKey = `${key}Controller` as keyof typeof Controllers;

      if (
        service &&
        !this.items.has(controllerName) &&
        hasProperty<ControllerName, typeof BaseController>(
          controllerKey,
          Controllers,
        )
      ) {
        const controller = new Controllers[controllerKey](service);

        this.setItem(controllerName, controller);
      }
    }

    return this;
  }

  get queryRunner() {
    return this.#queryRunner;
  }
}
