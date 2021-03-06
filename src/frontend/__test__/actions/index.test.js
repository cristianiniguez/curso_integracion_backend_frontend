import { setFavorite, loginRequest } from '../../actions/index';
import movieMock from '../../__mocks__/movieMock';

describe('Actions', () => {
  test('Set Favorite', () => {
    const payload = movieMock;
    const expectedAction = {
      type: 'SET_FAVORITE',
      payload,
    };
    expect(setFavorite(payload)).toEqual(expectedAction);
  });

  test('Login', () => {
    const payload = {
      email: 'saito@gmail.com',
      password: '12345',
    };
    const expectedAction = {
      type: 'LOGIN_REQUEST',
      payload,
    };
    expect(loginRequest(payload)).toEqual(expectedAction);
  });
});
