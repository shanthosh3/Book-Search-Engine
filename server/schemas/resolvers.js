const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User, Book } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                // .populate('savedBooks');

                return userData;
            }

            throw new AuthenticationError('You are not logged in!');
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const correctPassword = await user.isCorrectPassword(password);

            if (!correctPassword) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            if (context.user) {

                const user = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args } },
                    { new: true }
                );

                return user;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );

                return user;
            }

            throw new AuthenticationError('You need to be logged in!');
        }
    }
};

module.exports = resolvers;