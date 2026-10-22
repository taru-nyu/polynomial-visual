import { Node } from './node.js';

/**
 * Builds a singly linked list from an array of terms.
 * @param {Array<{coef: number, exp: number}>} terms
 * @returns {Node|null} Head of the linked list
 */
export function fromTerms(terms) {
  if (!terms || terms.length === 0) return null;
  const head = new Node(terms[0].coef, terms[0].exp);
  let current = head;
  for (let i = 1; i < terms.length; i++) {
    current.next = new Node(terms[i].coef, terms[i].exp);
    current = current.next;
  }
  return head;
}

/**
 * Converts a linked list to an array of term objects.
 * @param {Node|null} head
 * @returns {Array<{coef: number, exp: number}>}
 */
export function toTerms(head) {
  const terms = [];
  let current = head;
  while (current !== null) {
    terms.push({ coef: current.coef, exp: current.exp });
    current = current.next;
  }
  return terms;
}

/**
 * Formats terms or linked list into a standard polynomial string.
 * @param {Array<{coef: number, exp: number}>|Node|null} input
 * @returns {string} Formatted polynomial, e.g. "5x^4 + 3x^2 - 2x + 7" or "0"
 */
export function toText(input) {
  let terms = [];
  if (!input) return '0';
  if (Array.isArray(input)) {
    terms = input;
  } else if (input instanceof Node) {
    terms = toTerms(input);
  }

  // Filter out any zero coefficients
  const nonZero = terms.filter(t => t.coef !== 0);
  if (nonZero.length === 0) return '0';

  let result = '';
  for (let i = 0; i < nonZero.length; i++) {
    const { coef, exp } = nonZero[i];
    const absCoef = Math.abs(coef);
    const sign = coef < 0 ? '-' : '+';

    let termStr = '';
    if (exp === 0) {
      termStr = `${absCoef}`;
    } else if (exp === 1) {
      termStr = absCoef === 1 ? 'x' : `${absCoef}x`;
    } else {
      termStr = absCoef === 1 ? `x^${exp}` : `${absCoef}x^${exp}`;
    }

    if (i === 0) {
      result += coef < 0 ? `-${termStr}` : termStr;
    } else {
      result += ` ${sign} ${termStr}`;
    }
  }

  return result || '0';
}

/**
 * Creates an independent clone of a linked list.
 * @param {Node|null} head
 * @returns {Node|null}
 */
export function cloneList(head) {
  if (!head) return null;
  const newHead = new Node(head.coef, head.exp);
  let currNew = newHead;
  let currOld = head.next;
  while (currOld !== null) {
    currNew.next = new Node(currOld.coef, currOld.exp);
    currNew = currNew.next;
    currOld = currOld.next;
  }
  return newHead;
}

/**
 * Checks if terms or linked list nodes have strictly descending exponents.
 * @param {Array<{coef: number, exp: number}>|Node|null} input
 * @returns {boolean}
 */
export function isSortedDesc(input) {
  const terms = Array.isArray(input) ? input : toTerms(input);
  if (terms.length <= 1) return true;
  for (let i = 0; i < terms.length - 1; i++) {
    if (terms[i].exp <= terms[i + 1].exp) {
      return false;
    }
  }
  return true;
}

/**
 * Appends a node to the end of a list.
 * @param {Node|null} head
 * @param {Node|null} tail
 * @param {number} coef
 * @param {number} exp
 * @returns {{ head: Node, tail: Node, node: Node }}
 */
export function appendNode(head, tail, coef, exp) {
  const newNode = new Node(coef, exp);
  if (!head) {
    return { head: newNode, tail: newNode, node: newNode };
  }
  if (tail) {
    tail.next = newNode;
  } else {
    let curr = head;
    while (curr.next !== null) curr = curr.next;
    curr.next = newNode;
  }
  return { head, tail: newNode, node: newNode };
}
