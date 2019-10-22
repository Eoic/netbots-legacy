import { BaseEntity } from "typeorm";

export const fillInstance = (instance: BaseEntity, data: object) => {
  for (const [key, value] of Object.entries(data)) {
    (instance as any)[key] = value;
  }

  return instance;
};
