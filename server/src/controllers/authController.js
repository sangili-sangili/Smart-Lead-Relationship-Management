const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(
        new AppError(
          'Please provide name, email and password',
          HTTP_STATUS.BAD_REQUEST,
          'MISSING_REQUIRED_FIELDS'
        )
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(
        new AppError(
          'A user with this email address already exists',
          HTTP_STATUS.CONFLICT,
          'USER_ALREADY_EXISTS'
        )
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || undefined
    });

    const token = user.generateToken();

    return ApiResponse.created(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      },
      'User registered successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login existing user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new AppError(
          'Please provide email and password',
          HTTP_STATUS.BAD_REQUEST,
          'MISSING_CREDENTIALS'
        )
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return next(
        new AppError(
          'Invalid email or password',
          HTTP_STATUS.UNAUTHORIZED,
          'INVALID_CREDENTIALS'
        )
      );
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(
        new AppError(
          'Invalid email or password',
          HTTP_STATUS.UNAUTHORIZED,
          'INVALID_CREDENTIALS'
        )
      );
    }

    const token = user.generateToken();

    return ApiResponse.success(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get currently authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(
        new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND')
      );
    }

    return ApiResponse.success(res, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(
        new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND')
      );
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id }
      });
      if (emailExists) {
        return next(
          new AppError(
            'This email address is already in use',
            HTTP_STATUS.CONFLICT,
            'EMAIL_ALREADY_IN_USE'
          )
        );
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Change authenticated user password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new AppError(
          'Please provide current password and new password',
          HTTP_STATUS.BAD_REQUEST,
          'MISSING_PASSWORD_FIELDS'
        )
      );
    }

    if (newPassword.length < 6) {
      return next(
        new AppError(
          'New password must be at least 6 characters',
          HTTP_STATUS.BAD_REQUEST,
          'PASSWORD_TOO_SHORT'
        )
      );
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(
        new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND')
      );
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(
        new AppError(
          'Current password is incorrect',
          HTTP_STATUS.UNAUTHORIZED,
          'INCORRECT_CURRENT_PASSWORD'
        )
      );
    }

    user.password = newPassword;
    await user.save();

    const token = user.generateToken();

    return ApiResponse.success(
      res,
      { token },
      'Password changed successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (for assignment dropdowns)
 * GET /api/auth/users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name email role avatar')
      .sort({ name: 1, _id: 1 })
      .lean();
    return ApiResponse.success(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUsers
};
