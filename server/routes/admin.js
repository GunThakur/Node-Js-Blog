const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtSecret = process.env.JWT_SECRET;

const adminLayout = '../views/layouts/admin';

// GET Admin Home Page
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: 'Admin',
            description: 'Simple Blog created by Express, Node.js, and MongoDB',
            currentRoute:'/admin'
        };
        res.render('admin/index', { locals, layout: adminLayout, csrfToken: req.csrfToken() });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

// POST Admin Register
router.post('/register', async (req, res) => {
  const { username, password, _csrf } = req.body;

  // Validate CSRF token
  // if (!_csrf || _csrf !== req.csrfToken()) {
  //     return res.status(403).send('Invalid CSRF token');
  // }

  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: 'User created', user });
  } catch (err) {
      if (err.code === 11000) {
          return res.status(409).json({ message: 'User already exists' });
      }
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
  }
});


// POST Admin Login
router.post('/admin', async (req, res) => {
    try {
        const { username, password  } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// GET Admin Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Dashboard',
            description: 'Simple Dashboard created by Express, Node.js, and MongoDB'
        };
        const data = await Post.find();
        res.render('admin/dashboard', { locals, data, layout: adminLayout });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// * GET /
// * Admin - Create New Post
// */
router.get('/add-post', authMiddleware, async (req, res) => {
 try {
   const locals = {
     title: 'Add Post',
     description: 'Simple Blog created with NodeJs, Express & MongoDb.'
   }

   const data = await Post.find();
   res.render('admin/add-post', {
     locals,
     layout: adminLayout
   });

 } catch (error) {
   console.log(error);
 }

});


/**
 * POST /
 * Admin - Create New Post
*/
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });

      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Admin - Get Edit Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    })

  } catch (error) {
    console.log(error);
  }

});

/**
 * PUT /
 * Admin - PUT Edit Post
*/
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id,{
      title:req.body.title,
      body:req.body.body,
      updatedAt:Date.now()
    })

    res.redirect(`/edit-post/${req.params.id}`)

  } catch (error) {
    console.log(error);
  }

});
//  * Delete /
//  * Admin - Delete Post
// */
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndDelete({_id:req.params.id})

    res.redirect(`/dashboard`)

  } catch (error) {
    console.log(error);
  }

});




// Admin Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/')
});

module.exports = router;
