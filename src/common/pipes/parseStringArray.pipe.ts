import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseStringArrayPipe implements PipeTransform<string, string[]> {
  transform(value: string): string[] {
    if (!value) {
      return [];
    }

    const array = value.split(',').map((item) => item.trim());

    return array;
  }
}
