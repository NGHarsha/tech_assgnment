# Social Media Application Backend
## Technology Specs
- Backend REST API built on ExpressJS
- MongoDB is used for storing data. Mongoose ODM is used along with MongoDB

## Database Schema design
![Schema Diagram](https://user-images.githubusercontent.com/52374838/159852565-46e0ba6e-e5a5-4e45-8043-4a2b801193f1.png)


## End point Specifications
- ### /api/signup
  - Signup endpoint that receives name,email and password of user and registers user.
- ### /api/login
  - Requires email and password for signing in users.
- ### /api/posts/create 
  - Post creation end point.
  - Requires prior authorization
- ### /api/posts/comment/:postId
  - End point for posting comment on a specific post
- ### /api/posts/like/:postId
  - End point for posting comment on a specific post
- ### /api/comments/like/:commentId
  - End point for liking a comment.
- ### /api/posts/statistics/likes
  - Fetches latest list of users liking any post of a specific user
  - Userid is deduced from JWT token verification
- ### /api/posts/statistics/comments
  - Fetches latest list of users commenting on any post of a specific user
  - Userid is deduced from JWT token verification
- ### /api/comments/statistics/likes
  - Fetches latest list of users liking comments of any post of a specific user
  - Userid is deduced from JWT token verification

