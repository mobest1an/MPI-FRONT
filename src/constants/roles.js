export const ROLES = {
    COMMISSAR: 'COMMISSAR',
    ESCORT: 'ESCORT',
    RECRUIT: 'RECRUIT'
};

export const ROLE_ROUTES = {
    [ROLES.COMMISSAR]: '/commissar',
    [ROLES.ESCORT]: '/escort',
    [ROLES.RECRUIT]: '/recruit'
};

const ROLE_PRIORITY = [ROLES.COMMISSAR, ROLES.ESCORT, ROLES.RECRUIT];

export const getRedirectPath = (roles = []) => {
    for (const role of ROLE_PRIORITY) {
        if (roles.includes(role)) {
            return ROLE_ROUTES[role];
        }
    }
    return '/login';
};
