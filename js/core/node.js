/**
 * Node class representing a term in a polynomial stored as a singly linked list.
 */
export class Node {
  /**
   * @param {number} coef - Coefficient of the term (non-zero integer)
   * @param {number} exp - Exponent of the term (whole number >= 0)
   * @param {Node|null} [next=null] - Pointer to the next node in the list
   */
  constructor(coef, exp, next = null) {
    this.coef = coef;
    this.exp = exp;
    this.next = next;
  }
}
