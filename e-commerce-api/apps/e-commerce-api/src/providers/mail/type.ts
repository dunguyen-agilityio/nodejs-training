import { BaseProvider } from "../base";

export abstract class AbstractMailProvider<T> extends BaseProvider<unknown, T> {
  abstract sendWithTemplate(
    from: string,
    to: string,
    data: Record<string, any>,
    templateId: string,
  ): Promise<void>;
}
