export class BaseController<Service> {
  constructor(protected service: Service) {}
}
