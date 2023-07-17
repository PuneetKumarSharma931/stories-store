const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Story = require('../models/Story');
const User = require('../models/User');

// @desc Add Story Page
// @route GET /stories/add

router.get('/add', ensureAuth, (req, res)=>{

    res.render('stories/add');
});

// @desc Process Add Story request
// @route POST /stories

router.post('/', ensureAuth, async (req, res)=>{

    try {
        
        req.body.user = req.user.id;

        await Story.create(req.body);

        res.redirect('/dashboard');
        
    } catch (error) {
        
        console.error(error);
        res.render('error/500');
    }
});

// @desc Get Public Stories
// @route GET /

router.get('/', ensureAuth, async (req, res)=>{

    try {
        
        const stories = await Story.find({ status: 'public' }).populate('user').sort({ createdAt: 'desc' }).lean();

        res.render('stories/index', {
            stories
        });
        
    } catch (error) {
        
        console.error(error);
        res.render('error/500');
    }
});

//@desc Edit Stories
//@route GET /stories/edit/:id

router.get('/edit/:id', ensureAuth, async (req, res)=>{

    try {
        
        const story = await Story.findOne( { _id: req.params.id }).lean();

        if(!story) {

            res.render('error/404');
        }

        if(story.user != req.user.id) {

            res.redirect('/stories');
        }
        else {

            res.render('stories/edit', {
                story
            });
        }

    } catch (error) {
        
        console.log(error);
        res.render('error/500');
    }
});

// @desc Processing edit request
// @route PUT /:id

router.put('/:id', ensureAuth, async (req, res)=>{

    try {
        
        const story = await Story.findById( { _id: req.params.id }).lean();

        if (!story) {

            res.render('error/404');
        }

        if(story.user != req.user.id) {

            res.redirect('/stories');

        }
        else {

            await Story.findByIdAndUpdate( { _id: req.params.id }, req.body, {
                new: true,
                runValidators: true
            });

            res.redirect('/dashboard');
        }
    } catch (error) {
        
        console.log(error);
        res.render('error/500');
    }

});

//@desc Processing Delete Story
//@route DELETE /stories/:id

router.delete('/:id', ensureAuth, async (req, res) => {

    try {
        
        await Story.findByIdAndDelete( { _id: req.params.id });

        res.redirect('/dashboard');

    } catch (error) {
        
        console.log(error);
        res.render('error/500');
    }
});

//@desc Show story page
//@route GET /stories/:id

router.get('/:id', ensureAuth, async (req, res)=>{

    try {
        
        const story = await Story.findById(req.params.id).populate('user').lean();

        if (!story) {

            res.render('error/404');
        }

        res.render('stories/show', {
            story
        });

    } catch (error) {
        
        console.log("We have an error here!");
        console.log(error);
        res.render('error/404');
    }
});

//@desc Get User Stories
//@route GET /stories/user/:userId

router.get('/user/:userId', ensureAuth, async (req, res)=>{

    try {
        
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public'
        }).populate('user').sort({ createdAt: 'desc' }).lean();

        const user = await User.findById(req.params.userId).lean();

        res.render('stories/showUserStories', {
            stories,
            name: user.displayName,
        });

    } catch (error) {
        
        console.log(error);
        res.render('error/500');
    }
});

//@desc Like Handler
//@route POST /stories/likes/:storyId

router.post('/likes/:storyId', ensureAuth, async (req, res) => {

    try {

        let story = await Story.findById(req.params.storyId).populate('user').lean();
        
        if (!story) {

            res.render('error/404');
        }

        if(story.likedUsers.find((user) => { return user === req.user.id }) != undefined) {

            story.likedUsers.splice(story.likedUsers.findIndex((user) => { return user === req.user.id }), 1);
            story.likesCount--;
        }
        else {

            story.likedUsers.push(req.user.id);
            story.likesCount++;
        }


        if(story.dislikedUsers.find((user) => { return user === req.user.id }) != undefined) {

            story.dislikedUsers.splice(story.dislikedUsers.findIndex((user) => { return user === req.user.id }), 1);
            story.dislikesCount--;
        }

        await Story.findByIdAndUpdate(req.params.storyId, story);

        res.redirect(`/stories/${req.params.storyId}`);

    } catch (error) {
        
        console.log(error);
        res.render('error/500');
    }
});

//@desc Dislike Handler
//@route POST /stories/dislikes/:storyId

router.post('/dislikes/:storyId', ensureAuth, async (req, res) => {

    try {

        let story = await Story.findById(req.params.storyId).populate('user').lean();

        if (!story) {

            res.render('error/404');
        }

        if(story.dislikedUsers.find((user) => { return user === req.user.id }) != undefined) {

            story.dislikedUsers.splice(story.dislikedUsers.findIndex((user) => { return user === req.user.id }), 1);
            story.dislikesCount--;
        }
        else {

            story.dislikedUsers.push(req.user.id);
            story.dislikesCount++;
        }

        if(story.likedUsers.find((user) => { return user === req.user.id }) != undefined) {

            story.likedUsers.splice(story.likedUsers.findIndex((user) => { return user === req.user.id }), 1);
            story.likesCount--;
        }

        await Story.findByIdAndUpdate(req.params.storyId, story);

        res.redirect(`/stories/${req.params.storyId}`);

    } catch (error) {
        
        console.log(error);
        res.render('error/500');
    }
});

//@desc Show Add Comment Page
//@route GET /stories/comments/:storyId

router.get('/comments/:storyId', ensureAuth, async (req, res) => {

    try {
        
        const story = await Story.findById(req.params.storyId).populate('user').lean();

        if(story.comments.find((comment) => { return comment.userId === req.user.id}) != undefined) {

            res.redirect(`/stories/${req.params.storyId}`);
        }

        res.render('stories/addComment', {
            story
        });

    } catch (error) {
        
        console.log(error);
        res.render('error/500');
    }
});

//@desc Add Comment Handler
//@route POST /stories/comments/:storyId

router.post('/comments/:storyId', ensureAuth, async (req, res) => {

    try {

        let story = await Story.findById(req.params.storyId).populate('user').lean();

        story.comments.push({
            userId: req.user.id,
            userName: req.user.displayName,
            userImage: req.user.image,
            comment: req.body.body
        });

        await Story.findByIdAndUpdate(req.params.storyId, story);

        res.redirect(`/stories/${req.params.storyId}`);

    } catch (error) {
        
        console.log(error);
        res.redirect('error/500')
    }
});

//@desc Show Edit Comment Page
//@route GET /stories/comments/edit/storyId/userId

router.get('/comments/edit/:storyId/:userId', ensureAuth, async (req, res) => {

    try {
        
        const story = await Story.findById(req.params.storyId).populate('user').lean();

        if(!story) {

            res.status(404).render('error/404.hbs');
            return;
        }

        const commentIndex = story.comments.findIndex((comment) => {

            return comment.userId === req.params.userId;
        });

        if(commentIndex === -1) {

            return res.status(404).render('error/404.hbs');
        }

        if(story.comments[commentIndex].userId !== req.user.id) {

            return res.redirect(`/stories/${story._id}`);
        }

        res.render('stories/editComment.hbs', {
            story,
            comment: story.comments[commentIndex]
        });

    } catch (error) {
        
        res.status(500).render('error/500.hbs');
    }
});

//@desc Handle Edit Comment
//@route PUT /stories/comments/edit/storyId/userId

router.put('/comments/edit/:storyId/:userId', ensureAuth, async (req, res) => {

    try {
        
        let story = await Story.findById(req.params.storyId).populate('user').lean();

        if(!story) {

            res.status(404).render('error/404.hbs');
            return;
        }

        const commentIndex = story.comments.findIndex((comment) => {

            return comment.userId === req.params.userId;
        });

        if(commentIndex === -1) {

            return res.status(404).render('error/404.hbs');
        }

        if(story.comments[commentIndex].userId !== req.user.id) {

            return res.redirect(`/stories/${story._id}`);
        }

        story.comments[commentIndex] = {
            
            userId: req.params.userId,
            userName: story.comments[commentIndex].userName,
            userImage: story.comments[commentIndex].userImage,
            comment: req.body.body,
            commentedAt: Date.now()
        };

        await Story.findByIdAndUpdate(req.params.storyId, story);

        res.redirect(`/stories/${req.params.storyId}`);

    } catch (error) {
        
        res.status(500).render('error/500.hbs');
    }
});

//@desc Handle Delete Comment
//@route DELETE /stories/comments/delete/storyId/userId

router.delete('/comments/delete/:storyId/:userId', ensureAuth, async (req, res) => {

    try {
        
        let story = await Story.findById(req.params.storyId).populate('user').lean();

        if(!story) {

            res.status(404).render('error/404.hbs');
            return;
        }

        const commentIndex = story.comments.findIndex((comment) => {

            return comment.userId === req.params.userId;
        });

        if(commentIndex === -1) {

            return res.status(404).render('error/404.hbs');
        }

        if(story.comments[commentIndex].userId !== req.user.id) {

            return res.redirect(`/stories/${story._id}`);
        }

        story.comments.splice(commentIndex, 1);

        await Story.findByIdAndUpdate(req.params.storyId, story);

        res.redirect(`/stories/${req.params.storyId}`);

    } catch (error) {
        
        res.status(500).render('error/500.hbs');
    }
});

module.exports = router;