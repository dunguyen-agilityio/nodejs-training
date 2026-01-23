import { BaseProvider } from "#providers/base";

export abstract class AbstractMailProvider<T> extends BaseProvider<T> {
  abstract sendWithTemplate(
    from: string,
    to: string,
    data: Record<string, any>,
    templateId: string,
  ): Promise<void>;
}
