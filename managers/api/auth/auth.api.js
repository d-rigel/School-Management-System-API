const { apiConfig } = require('../../../static_arch/main.system')

module.exports = {
    /**
     * User Registration
     * POST /api/auth/register
     */
    register: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.auth.register.preStack,
        handler: async function({ req, res, device, managers, validators }) {
            try {
                const { email, password, firstName, lastName, role, schoolId } = req.body;
                
                // Validate required fields
                if (!email || !password || !firstName || !lastName || !role) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Missing required fields: email, password, firstName, lastName, role'
                    };
                }

                // Validate email
                if (!validators.email(email)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid email format'
                    };
                }

                // Validate password strength
                if (!validators.strongPassword(password)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
                    };
                }

                // Validate names
                if (!validators.name(firstName)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'First name must be between 2 and 100 characters'
                    };
                }

                if (!validators.name(lastName)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Last name must be between 2 and 100 characters'
                    };
                }

                // Validate role
                if (!validators.role(role)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid role. Must be superadmin or school_admin'
                    };
                }

                // Validate schoolId for school_admin
                if (role === 'school_admin') {
                    if (!schoolId) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'School ID is required for school administrators'
                        };
                    }
                    if (!validators.objectId(schoolId)) {
                        return {
                            ok: false,
                            code: 400,
                            errors: 'Invalid school ID format'
                        };
                    }
                }

                const result = await managers.user.register({
                    email, password, firstName, lastName, role, schoolId
                });
                
                return result;
            } catch (error) {
                console.error('Register API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Registration failed'
                };
            }
        }
    },

    /**
     * User Login
     * POST /api/auth/login
     */
    login: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.auth.login.preStack,
        handler: async function({ req, res, device, managers, validators }) {
            try {
                const { email, password } = req.body;
                
                // Validate required fields
                if (!email || !password) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Email and password are required'
                    };
                }

                // Validate email format
                if (!validators.email(email)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Invalid email format'
                    };
                }

                const result = await managers.user.login({ email, password });
                return result;
            } catch (error) {
                console.error('Login API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Login failed'
                };
            }
        }
    },

    /**
     * User Logout
     * POST /api/auth/logout
     */
    logout: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.auth.logout.preStack,
        handler: async function({ req, res, token, managers }) {
            try {
                const authToken = req.headers.token || req.headers.authorization?.substring(7);
                const result = await managers.user.logout({
                    userId: token.userId,
                    token: authToken
                });
                return result;
            } catch (error) {
                console.error('Logout API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Logout failed'
                };
            }
        }
    },

    /**
     * Refresh Token
     * POST /api/auth/refresh
     */
    refresh: {
        httpExposed: true,
        method: 'POST',
        handler: async function({ req, res, managers }) {
            try {
                const { refreshToken } = req.body;
                
                if (!refreshToken) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Refresh token is required'
                    };
                }

                const result = await managers.user.refreshAccessToken({ refreshToken });
                return result;
            } catch (error) {
                console.error('Refresh token API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Token refresh failed'
                };
            }
        }
    },

    /**
     * Get Profile
     * GET /api/auth/profile
     */
    profile: {
        httpExposed: true,
        method: 'GET',
        preStack: apiConfig.auth.profile.preStack,
        handler: async function({ req, res, token, managers }) {
            try {
                const result = await managers.user.getProfile({
                    userId: token.userId
                });
                return result;
            } catch (error) {
                console.error('Get profile API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to retrieve profile'
                };
            }
        }
    },

    /**
     * Update Profile
     * PUT /api/auth/updateProfile
     */
    updateProfile: {
        httpExposed: true,
        method: 'PUT',
        preStack: apiConfig.auth.updateProfile.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { firstName, lastName, isActive } = req.body;
                
                // Validate firstName if provided
                if (firstName && !validators.name(firstName)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'First name must be between 2 and 100 characters'
                    };
                }

                // Validate lastName if provided
                if (lastName && !validators.name(lastName)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Last name must be between 2 and 100 characters'
                    };
                }

                // Validate isActive if provided
                if (isActive !== undefined && !validators.boolean(isActive)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'isActive must be a boolean'
                    };
                }

                const result = await managers.user.updateProfile({
                    userId: token.userId,
                    updates: { firstName, lastName, isActive }
                });
                return result;
            } catch (error) {
                console.error('Update profile API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to update profile'
                };
            }
        }
    },

    /**
     * Change Password
     * POST /api/auth/changePassword
     */
    changePassword: {
        httpExposed: true,
        method: 'POST',
        preStack: apiConfig.auth.changePassword.preStack,
        handler: async function({ req, res, token, managers, validators }) {
            try {
                const { currentPassword, newPassword } = req.body;
                
                if (!currentPassword || !newPassword) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'Current password and new password are required'
                    };
                }

                // Validate new password strength
                if (!validators.strongPassword(newPassword)) {
                    return {
                        ok: false,
                        code: 400,
                        errors: 'New password must be at least 8 characters with uppercase, lowercase, number and special character'
                    };
                }

                const result = await managers.user.changePassword({
                    userId: token.userId,
                    currentPassword,
                    newPassword
                });
                return result;
            } catch (error) {
                console.error('Change password API error:', error);
                return {
                    ok: false,
                    code: 500,
                    errors: 'Failed to change password'
                };
            }
        }
    }
};





// ----------------------------------------------------------------------------------------------------

// module.exports = {
//     /**
//      * User Registration
//      * POST /api/auth/register
//      */
//     register: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__device'],
//         preStack: apiConfig.auth.register.preStack,
//         handler: async function({ req, res, device, managers }) {
//             try {
//                 const { email, password, firstName, lastName, role, schoolId } = req.body;
                
//                 // Validate
//                 if (!email || !password || !firstName || !lastName || !role) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Missing required fields'
//                     };
//                 }

//                 if (role === 'school_admin' && !schoolId) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'School ID is required for school administrators'
//                     };
//                 }

//                 const result = await managers.user.register({
//                     email, password, firstName, lastName, role, schoolId
//                 });
                
//                 return result;
//             } catch (error) {
//                 console.error('Register API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Registration failed'
//                 };
//             }
//         }
//     },

//     /**
//      * User Login
//      * POST /api/auth/login
//      */
//     login: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__device'],
//         preStack: apiConfig.auth.login.preStack,
//         handler: async function({ req, res, device, managers }) {
//             try {
//                 const { email, password } = req.body;
                
//                 if (!email || !password) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Email and password are required'
//                     };
//                 }

//                 const result = await managers.user.login({ email, password });
//                 return result;
//             } catch (error) {
//                 console.error('Login API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Login failed'
//                 };
//             }
//         }
//     },

//     /**
//      * User Logout
//      * POST /api/auth/logout
//      */
//     logout: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token'],
//         preStack: apiConfig.auth.logout.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const authToken = req.headers.token || req.headers.authorization?.substring(7);
//                 const result = await managers.user.logout({
//                     userId: token.userId,
//                     token: authToken
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Logout API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Logout failed'
//                 };
//             }
//         }
//     },

//     /**
//      * Refresh Token
//      * POST /api/auth/refresh
//      */
//     refresh: {
//         httpExposed: true,
//         method: 'POST',
//         handler: async function({ req, res, managers }) {
//             try {
//                 const { refreshToken } = req.body;
                
//                 if (!refreshToken) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Refresh token is required'
//                     };
//                 }

//                 const result = await managers.user.refreshAccessToken({ refreshToken });
//                 return result;
//             } catch (error) {
//                 console.error('Refresh token API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Token refresh failed'
//                 };
//             }
//         }
//     },

//     /**
//      * Get Profile
//      * GET /api/auth/profile
//      */
//     profile: {
//         httpExposed: true,
//         method: 'GET',
//         // preStack: ['__token'],
//         preStack: apiConfig.auth.profile.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const result = await managers.user.getProfile({
//                     userId: token.userId
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Get profile API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to retrieve profile'
//                 };
//             }
//         }
//     },

//     /**
//      * Update Profile
//      * PUT /api/auth/updateProfile
//      */
//     updateProfile: {
//         httpExposed: true,
//         method: 'PUT',
//         // preStack: ['__token'],
//         preStack: apiConfig.auth.updateProfile.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const { firstName, lastName, isActive } = req.body;
                
//                 const result = await managers.user.updateProfile({
//                     userId: token.userId,
//                     updates: { firstName, lastName, isActive }
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Update profile API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to update profile'
//                 };
//             }
//         }
//     },

//     /**
//      * Change Password
//      * POST /api/auth/changePassword
//      */
//     changePassword: {
//         httpExposed: true,
//         method: 'POST',
//         // preStack: ['__token'],
//         preStack: apiConfig.auth.changePassword.preStack,
//         handler: async function({ req, res, token, managers }) {
//             try {
//                 const { currentPassword, newPassword } = req.body;
                
//                 if (!currentPassword || !newPassword) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'Current password and new password are required'
//                     };
//                 }

//                 if (newPassword.length < 8) {
//                     return {
//                         ok: false,
//                         code: 400,
//                         errors: 'New password must be at least 8 characters long'
//                     };
//                 }

//                 const result = await managers.user.changePassword({
//                     userId: token.userId,
//                     currentPassword,
//                     newPassword
//                 });
//                 return result;
//             } catch (error) {
//                 console.error('Change password API error:', error);
//                 return {
//                     ok: false,
//                     code: 500,
//                     errors: 'Failed to change password'
//                 };
//             }
//         }
//     }
// };