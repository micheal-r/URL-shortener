const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    res.render('index');
});

router.get('/admin', (req, res) => {
    if (req.cookies.authenticated === process.env.ADMIN_PASSWORD) {
        return res.redirect('/admin/dashboard');
    }
    res.render('adminLogin');
});

router.post('/admin', auth, async (req, res) => {
    res.redirect('/admin/dashboard');
});

router.get('/admin/dashboard', auth, async (req, res) => {
    try {
        const urls = await Url.find().sort({ date: -1 });
        res.render('admin', { urls });
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});

router.post('/admin/delete/:id', auth, async (req, res) => {
    try {
        await Url.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});

router.post('/admin/edit/:id', auth, async (req, res) => {
    try {
        const { shortUrl } = req.body;
        await Url.findByIdAndUpdate(req.params.id, { shortUrl });
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});

router.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;
    if (!originalUrl) {
        return res.status(400).json('Invalid URL');
    }

    try {
        let url = await Url.findOne({ originalUrl });
        if (url) {
            res.json(url);
        } else {
            url = new Url({ originalUrl });
            await url.save();
            res.json(url);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});

router.get('/:shortUrl', async (req, res) => {
    try {
        const url = await Url.findOne({ shortUrl: req.params.shortUrl });
        if (url) {
            return res.redirect(url.originalUrl);
        } else {
            return res.status(404).json('No URL found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});

module.exports = router;
