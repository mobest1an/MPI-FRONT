import { ROLES, ROLE_ROUTES, getRedirectPath } from '../../constants/roles';

describe('Roles Constants', () => {
  describe('ROLES', () => {
    it('should define all expected roles', () => {
      expect(ROLES).toEqual({
        COMMISSAR: 'COMMISSAR',
        ESCORT: 'ESCORT',
        RECRUIT: 'RECRUIT',
        MILITARY_POLICE: 'MILITARY_POLICE'
      });
    });
  });

  describe('ROLE_ROUTES', () => {
    it('should map each role to its corresponding route', () => {
      expect(ROLE_ROUTES).toEqual({
        [ROLES.COMMISSAR]: '/commissar',
        [ROLES.ESCORT]: '/escort',
        [ROLES.RECRUIT]: '/recruit',
        [ROLES.MILITARY_POLICE]: '/military-police'
      });
    });
  });

  describe('getRedirectPath', () => {
    it('should return commissar route for user with commissar role', () => {
      const roles = [ROLES.COMMISSAR, ROLES.RECRUIT];
      expect(getRedirectPath(roles)).toBe('/commissar');
    });

    it('should return escort route for user with escort role but no commissar role', () => {
      const roles = [ROLES.ESCORT, ROLES.RECRUIT];
      expect(getRedirectPath(roles)).toBe('/escort');
    });

    it('should return military police route for user with military police role but no higher roles', () => {
      const roles = [ROLES.MILITARY_POLICE, ROLES.RECRUIT];
      expect(getRedirectPath(roles)).toBe('/military-police');
    });

    it('should return recruit route for user with only recruit role', () => {
      const roles = [ROLES.RECRUIT];
      expect(getRedirectPath(roles)).toBe('/recruit');
    });

    it('should return login route for user with no recognized roles', () => {
      const roles = ['UNKNOWN_ROLE'];
      expect(getRedirectPath(roles)).toBe('/login');
    });

    it('should return login route for empty roles array', () => {
      expect(getRedirectPath([])).toBe('/login');
    });

    it('should return login route for undefined roles', () => {
      expect(getRedirectPath()).toBe('/login');
    });

    it('should prioritize roles according to ROLE_PRIORITY order', () => {
      // Проверяем, что приоритет соблюдается: COMMISSAR > ESCORT > MILITARY_POLICE > RECRUIT
      const roles1 = [ROLES.RECRUIT, ROLES.COMMISSAR, ROLES.ESCORT];
      expect(getRedirectPath(roles1)).toBe('/commissar');
      
      const roles2 = [ROLES.MILITARY_POLICE, ROLES.ESCORT, ROLES.RECRUIT];
      expect(getRedirectPath(roles2)).toBe('/escort');
      
      const roles3 = [ROLES.RECRUIT, ROLES.MILITARY_POLICE];
      expect(getRedirectPath(roles3)).toBe('/military-police');
    });
  });
});