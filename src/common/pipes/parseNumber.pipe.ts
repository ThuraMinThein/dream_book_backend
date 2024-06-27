import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isNumber } from 'class-validator';

@Injectable()
export class ParseNumberPipe implements PipeTransform<any> {
  constructor(private readonly valueName: string) {}
  transform(value: string): number {
    const errorMessage = `Invalid ${this.valueName} value, ${this.valueName} must be a number`;
    try {
      if (!value) {
        return;
      }
      if (!isNumber(Number(value))) {
        throw new Error(errorMessage);
      }

      return Number(value);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
