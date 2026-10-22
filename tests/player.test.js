import test from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../js/player/player.js';
import { parsePoly } from '../js/core/parser.js';
import { runTwoPointer } from '../js/algorithms/twoPointer.js';
import { PRESETS } from '../js/core/presets.js';

test('14.3 Player: navigation and deterministic frame identity (goTo, prev, next)', () => {
  const basic = PRESETS.find(p => p.name === 'Basic');
  const p = parsePoly(basic.p).terms;
  const q = parsePoly(basic.q).terms;
  const { steps } = runTwoPointer(p, q);

  const player = new Player();
  player.load(steps);

  assert.equal(player.state, 'ready');
  assert.equal(player.currentIndex, 0);

  // Test goTo(i), then prev, then next produces exact same frame as goTo(i)
  const testIndices = [1, 3, 5, steps.length - 2];
  for (const idx of testIndices) {
    player.goTo(idx);
    const frameAtIdx = player.getCurrentStep();

    player.prev();
    const framePrev = player.getCurrentStep();
    assert.notDeepEqual(framePrev, frameAtIdx);

    player.next();
    const frameAfterNext = player.getCurrentStep();

    assert.deepEqual(
      frameAfterNext,
      frameAtIdx,
      `Step ${idx} frame after prev->next must match original goTo(${idx})`
    );
  }

  // Test jump to end
  player.jumpToEnd();
  assert.equal(player.currentIndex, steps.length - 1);
  assert.equal(player.state, 'finished');

  // Test restart
  player.restart();
  assert.equal(player.currentIndex, 0);
  assert.equal(player.state, 'ready');

  // Test speed clamping
  player.setSpeed(10);
  assert.equal(player.speed, 4.0);
  player.setSpeed(0.01);
  assert.equal(player.speed, 0.25);
  player.setSpeed(1.0);
  assert.equal(player.speed, 1.0);
});
