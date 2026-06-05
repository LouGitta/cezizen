import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that extracts the first sentence of a text block.
 * Identifies a sentence by finding the first period, exclamation point, or question mark.
 */
@Pipe({
  name: 'firstSentence',
  standalone: true,
})
export class FirstSentencePipe implements PipeTransform {
  /**
   * Transforms a string by returning only its first sentence.
   * @param value The raw input string.
   * @returns The first sentence or the original string if no separator is found.
   */
  transform(value: string): string {
    if (!value) return '';
    const match = value.match(/^[^.!?]*[.!?]/);

    return match ? match[0] : value;
  }
}
