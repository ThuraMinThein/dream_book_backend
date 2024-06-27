import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseNumberArrayPipe implements PipeTransform {
  transform(value: string): number[] {
    if (!value) {
      return [];
    }

    try {
      const values = value.split(',').map((val) => {
        const parsed = parseFloat(val.trim());
        if (isNaN(parsed)) {
          throw new BadRequestException(`Invalid number: ${val}`);
        }
        return parsed;
      });
      return values;
    } catch (error) {
      throw new BadRequestException('Invalid input for number array');
    }
  }
}
