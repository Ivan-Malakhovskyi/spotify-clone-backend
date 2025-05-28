import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  HOST: string;

  @IsString()
  AUTH_SECRET: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_HOST: string;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_NAME: string;
}

export function validate(config: Record<string, unknown>) {
  console.log('config', config);

  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const err = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (err.length > 0) {
    throw new Error(err.toString());
  }

  return validatedConfig;
}
