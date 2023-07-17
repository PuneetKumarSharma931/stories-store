const express = require('express');
const router = express.Router();
const passport = require('passport');


// @desc Google Oauth call
// @route GET /auth/google

router.get('/google', passport.authenticate('google', { scope: ['profile']}));

// @desc Google Oauth Callback
// @route GET /auth/google/callback

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res)=>{

    res.status(200).redirect('/dashboard');
    
});

// @desc Logout User
// @route GET /logout

router.get('/logout', (req, res)=>{

    req.logout((e)=>{});
    res.redirect('/');
});

module.exports = router;