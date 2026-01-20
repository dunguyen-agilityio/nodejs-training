import { DataSource, QueryRunner } from "typeorm";

import * as Entities from "#entities";
import * as Repositories from "#repositories";
import * as Services from "#services";
import * as Controllers from "#controllers";

import { TController, TRepository, TService } from "#types/container";
import { uncapitalize } from "./string";
import { StripePaymentGateway } from "#services/payment-gateway/index";
import Stripe from "stripe";
import { PaymentGateway } from "#services/types";

type Item = TRepository & TService & TController;

export enum Payment {
  "Stripe" = "stripe",
}

type TRegister = keyof typeof Entities | "Checkout";

export class Container {
  static #instance: Container;
  #dataSource: DataSource;
  #queryRunner: QueryRunner;
  items: Map<string, any> = new Map();
  #payments: Map<Payment, PaymentGateway> = new Map();
  #registers: Map<string, TRegister> = new Map();
  #repositories: Record<string, any> = {};
  #stripePaymentGateway: PaymentGateway;

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

  register<T extends TRegister>(entity: T, name: string = entity) {
    this.#registers.set(name, entity);
    return this;
  }

  build() {
    this.#registers.forEach((entity) => {
      const repositoryName = uncapitalize(entity) + "Repository";

      if (!this.items.has(repositoryName) && entity !== "Checkout") {
        const repo = this.#dataSource.getRepository(Entities[entity]);
        const repository = new Repositories[`${entity}Repository`](repo as any);
        this.#repositories[repositoryName] = repository;
        this.setItem(repositoryName, repository);
      }
    });

    for (const [value] of this.#registers) {
      const serviceName = `${uncapitalize(value)}Service`;

      if (this.items.has(serviceName)) {
        continue;
      }

      const serviceKey = `${value}Service` as keyof typeof Services;

      let service;

      if (serviceKey !== "StripePaymentGateway") {
        service = new Services[serviceKey](
          this.#repositories as TRepository,
          this.#stripePaymentGateway,
        );
      }

      const controllerName = `${uncapitalize(value)}Controller`;
      const controllerKey = `${value}Controller` as keyof typeof Controllers;
      if (!(controllerKey in Controllers)) {
        throw new Error(`Not found ${controllerKey}`);
      }

      const controller = new Controllers[controllerKey](service as any);

      this.setItem(serviceName, service);
      this.setItem(controllerName, controller);
    }

    return this;
  }

  addPayment(name: Payment) {
    if (name === Payment.Stripe) {
      const apiKey = process.env.STRIPE_API_KEY;
      if (!apiKey) {
        throw new Error("STRIPE_API_KEY environment variable is required");
      }
      this.#stripePaymentGateway = new StripePaymentGateway(new Stripe(apiKey));
    }

    return this;
  }

  getPayment(name: Payment): PaymentGateway {
    if (!this.#payments.has(name)) {
      throw new Error(`Payment not register`);
    }

    const payment = this.#payments.get(name) as PaymentGateway;
    return payment;
  }

  get queryRunner() {
    return this.#queryRunner;
  }
}
