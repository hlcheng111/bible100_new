import { TrackingEngine } from './TrackingEngine';
import { MemoryProgressStore } from './MemoryProgressStore';

describe('TrackingEngine', () => {
  const store = new MemoryProgressStore();
  const engine = new TrackingEngine(store, { userId: 'test-user' });

  beforeEach(() => store.clear());

  test('getTracks returns three main tracks', () => {
    const tracks = TrackingEngine.getTracks();
    expect(tracks.map((t) => t.id)).toEqual(['ot_front', 'ot_back', 'nt']);
  });

  test('parseUnitId', () => {
    expect(TrackingEngine.parseUnitId('ot_front_1_1')).toEqual({
      trackId: 'ot_front',
      bookId: 1,
      chapter: 1,
    });
  });

  test('markComplete updates track summary', async () => {
    await engine.markComplete('ot_front_1_1');
    const summary = await engine.getTrackSummary('ot_front');
    expect(summary.completed).toBe(1);
    expect(summary.percent).toBe(Math.round((1 / summary.total) * 100));
  });

  test('mergeRemote prefers completed remote', async () => {
    await engine.openUnit('nt_40_1');
    await engine.mergeRemote([
      {
        unitId: 'nt_40_1',
        trackId: 'nt',
        status: 'completed',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    const p = await engine.getProgress('nt_40_1');
    expect(p.status).toBe('completed');
  });
});
