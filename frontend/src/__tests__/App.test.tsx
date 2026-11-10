test('App compiles without errors (smoke test)', () => {
  expect(() => {
    require('../App');
  }).not.toThrow();
});