import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstSentence',
  standalone: true,
})
export class FirstSentencePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const match = value.match(/^[^.!?]*[.!?]/);

    return match ? match[0] : value;
  }
}
