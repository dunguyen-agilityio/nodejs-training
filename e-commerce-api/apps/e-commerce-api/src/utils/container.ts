import { DataSource, QueryRunner } from "typeorm";

import * as Entities from "#entities";
import * as Repositories from "#repositories";
import * as Services from "#services";
import * as Controllers from "#controllers";

import { TController, TRepository, TService } from "#types/container";
import { uncapitalize } from "./string";
import { PaymentService } from "#services/stripe/type";
import { StripePaymentService } from "#services/stripe/index";
import { PaymentController } from "#controllers/checkout/index";

type Item = TRepository & TService & TController;

export enum Payment {
  "Stripe" = "stripe",
}

export class Container {
  static #instance: Container;
  #dataSource: DataSource;
  #queryRunner: QueryRunner;
  items: Map<string, any> = new Map();
  #payments: Map<Payment, PaymentService> = new Map();
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
      const repositoryName = uncapitalize(entity) + "Repository";

      if (!this.items.has(repositoryName)) {
        const repo = this.#dataSource.getRepository(Entities[entity]);
        const repository = new Repositories[`${entity}Repository`](repo as any);
        repositories[repositoryName] = repository;
        this.setItem(repositoryName, repository);
      }
    });

    for (const [value] of this.#registers) {
      const serviceName = `${uncapitalize(value)}Service`;

      if (this.items.has(serviceName)) {
        continue;
      }

      const service = new Services[`${value}Service` as keyof typeof Services](
        repositories as TRepository
      );

      const controllerName = `${uncapitalize(value)}Controller`;

      const controller = new Controllers[
        `${value}Controller` as keyof typeof Controllers
      ](service as any);

      this.setItem(serviceName, service);
      this.setItem(controllerName, controller);
    }

    return this;
  }

  addPayment(name: Payment) {
    if (name === Payment.Stripe) {
      const paymentService = new StripePaymentService();
      const paymentController = new PaymentController(paymentService);
      this.#payments.set(name, new StripePaymentService());
      this.setItem("paymentController", paymentController);
      this.setItem("paymentService", paymentService);
    }

    return this;
  }

  getPayment(name: Payment): PaymentService {
    if (!this.#payments.has(name)) {
      throw new Error(`Payment not register`);
    }

    const payment = this.#payments.get(name) as PaymentService;
    return payment;
  }

  get queryRunner() {
    return this.#queryRunner;
  }
}
