const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'public',
        enum: ['public', 'private']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likesCount: {
        type: Number,
        required: true,
        default: 0
    },
    likedUsers: [{type: String, required: true}],
    dislikesCount: {
        type: Number,
        required: true,
        default: 0
    },
    dislikedUsers: [{type: String, required: true}],
    comments: [{userId: {
        type: String,
        required: true,
        trim: true
    },
userName: {
    type: String,
    required: true
},
userImage: {
    type: String,
    required: true,
    trim: true
},
comment: {
    type: String,
    required: true,
    max: 500,
    min: 1,
    trim: true
},
commentedAt: {
    type: Date,
    default: Date.now
}}],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Story', StorySchema);