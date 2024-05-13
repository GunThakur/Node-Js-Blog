const express = require('express')
const router = express.Router();
const Post = require('../models/Post')
const User = require('../models/User')


// Routes

// Get Post:id
router.get('/post/:id',async(req,res)=>{
  try{
    slug = req.params.id

    const data = await Post.findById({_id:slug})
    const locals = {
      title:data.title,
      desc:data.body,
      currentRoute: `/post/${slug}`
    }
    res.render('posts',{locals})
  }catch(err){
    console.log(err)
  }
})










router.get('', async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    let perPage = 3;
    let page = req.query.page || 1;

    const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', { 
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/'
    });

  } catch (error) {
    console.log(error);
  }

});
    
    // Post - SearchItem
    
    router.post('/search',async(req,res)=>{
        try{
            const locals = {
                title: "Search",
                description: "Simple Blog created by express,NodeJS and MongoDB"
            }
            let searchTerm = req.body.searchTerm
            let NoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,'')
            const data = await Post.find({
              $or:[
                {title:{$regex: new RegExp(NoSpecialChar,'i')}},
                {body:{$regex: new RegExp(NoSpecialChar,'i')}}
              ]
            })


            // console.log(searchTerm)
            res.render('search', { locals,data});
        
          } catch (error) {
            console.log(error);
          }
    })




router.get('/about',(req,res)=>{
  res.render('about',{
    currentRoute: '/about'
  })
})
module.exports = router;

// function insertPostData (){
  //     Post.insertMany([
    //         {
      //             title: "Get blog",
      //             body: "This is a get api"
      //         },
      //     ])
      // }
      // insertPostData()

    //   router.get('/',async(req,res)=>{
    //     try{
    //         const locals = {
    //             title: "NodeJs Blog",
    //             description: "Simple Blog created by express,NodeJS and MongoDB"
    //         }
    //         const data = await Post.find()
    //         res.render('index', { locals,data, });
        
    //       } catch (error) {
    //         console.log(error);
    //       }
    // })