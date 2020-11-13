import gravatar from '../../utils/gravatar';

test('Gravatar Function test', () => {
  const email = 'saito@gmail.com';
  const gravatarUrl = 'https://gravatar.com/avatar/f63b0ca8c3b04acb1b86a8431d75e6a5';
  expect(gravatarUrl).toEqual(gravatar(email));
});
