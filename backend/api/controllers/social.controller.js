import mongoose from 'mongoose';
import { createNotification, getNotificationById } from '../utils/notifications.js';
import prisma from '../db/prisma.connection.js'; 
import Post from '../models/Post.model.js';
import Like from '../models/Like.model.js';
import Comment from '../models/Comment.model.js';
import Follow from '../models/Follow.model.js';
import redis from '../db/redis.connection.js';
import { io } from '../../index.js';
// --- MONGOOSE DATABASE CONNECTION ---
// const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/CollegeConnectSocial';
// if (mongoose.connection.readyState === 0) { 
//   mongoose.connect(MONGO_URL)
//     .then(() => console.log('MongoDB connected for Social Controller...'))
//     .catch(err => console.error('MongoDB connection error:', err));
// }


export const createPost = async (req, res) => {
  try {
    const { caption, visibility, event_id } = req.body;
    const { id: userId } = req.user;

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const image_url = req.file.path;
    const public_id = req.file.filename;

    const newPost = await Post.create({
      caption: caption || '',
      image_url,
      image_public_id: public_id,
      visibility: visibility || 'PUBLIC',
      user_id: Number(userId),
      event_id: event_id ? Number(event_id) : null,
    });
    
    const author = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, profile_photo: true }
    });

    const postToReturn = { 
      ...newPost.toObject(), 
      user: author,
      isLiked: false 
    };

    res.status(201).json({ message: 'Post created successfully', post: postToReturn });
  } catch (err) {
    console.error('Create Post Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


// This feed is not working
// getting server error
 export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const { id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const cached = await redis.get(`post:${postId}`);
    if (cached) {
      console.log('Cache hit for post', postId);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(' Cache miss for post', postId);

    // Fetch post from MongoDB
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    //  Fetch author from PostgreSQL
    const author = await prisma.user.findUnique({
      where: { id: post.user_id },
      select: { id: true, name: true, profile_photo: true },
    });

    // Fetch comments from MongoDB
    const comments = await Comment.find({ post_id: post._id }).sort({ created_at: 1 });

    // Enrich comments with user data
    const commentUserIds = comments.map(c => c.user_id);
    const commentUsers = await prisma.user.findMany({
      where: { id: { in: commentUserIds } },
      select: { id: true, name: true, profile_photo: true },
    });

    const userMap = new Map(commentUsers.map(u => [u.id, u]));
    const commentsWithUser = comments.map(comment => ({
      ...comment.toObject(),
      user: userMap.get(comment.user_id),
    }));

    // Like check
    const isLiked = await Like.exists({ post_id: post._id, user_id: Number(userId) });

    // Final response object
    const postResponse = {
      ...post.toObject(),
      id: post._id.toString(),
      user: author,
      comments: commentsWithUser,
      isLiked: !!isLiked,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
    };

    // Store complete object in cache for 5 minutes
    await redis.setEx(`post:${postId}`, 300, JSON.stringify(postResponse));

    res.json(postResponse);
  } catch (err) {
    console.error('Get Post By ID Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    // Get following list
    const following = await Follow.find({ follower_id: userId }).select('following_id');
    const followingIds = following.map((f) => f.following_id);

    // Get user info from Postgres
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { department: true } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get feed posts
    const posts = await Post.find({
      $or: [
        { user_id: { $in: [...followingIds, userId] } },
        { visibility: 'PUBLIC' },
      ],
    })
      .sort({ created_at: -1 })
      .limit(20);

    // Enrich each post with user and like info
    // Get all user IDs from the posts
    const authorIds = [...new Set(posts.map(p => p.user_id))];
    
    // Get all user data from Postgres in one call
    const authors = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true, profile_photo: true }
    });
    const authorMap = new Map(authors.map(a => [a.id, a]));

    // Get like status for all posts in the feed in one call
    const postIds = posts.map(p => p._id);
    const userLikes = await Like.find({ post_id: { $in: postIds }, user_id: userId }).select('post_id');
    const likedPostIds = new Set(userLikes.map(l => l.post_id.toString()));

    const feed = posts.map(post => {
        return {
          ...post.toObject(),
          id: post._id.toString(), // Send string ID to frontend
          user: authorMap.get(post.user_id) || { name: 'Unknown User' },
          // Use denormalized counts
          likes_count: post.likes_count,
          comments_count: post.comments_count,
          isLiked: likedPostIds.has(post._id.toString()),
        };
      });

    res.json(feed);
  } catch (err) {
    console.error('Get Feed Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { id: userId, name: userName } = req.user;

    const existingLike = await Like.findOne({ post_id: postId, user_id: userId });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Post.findByIdAndUpdate(postId, { $inc: { likes_count: -1 } });
      return res.json({ message: "Post unliked" });
    }

    await Like.create({ post_id: postId, user_id: userId });
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes_count: 1 } },
      { new: true }
    );
    await redis.del(`post:${postId}`);

    if (updatedPost.user_id !== userId) {
      const recipientUserId = updatedPost.user_id;
      console.log('Sending like notification to user', recipientUserId);

      const notificationId = await createNotification(
        recipientUserId,
        `${userName} liked your post.`,
        `/post/${postId}`,
        "NEW_LIKE",
        userId
      );

      const notification = await getNotificationById(notificationId);
      io.to(`user_${recipientUserId}`).emit("notification:new", notification);
    }

    res.status(201).json({ message: "Post liked" });
  } catch (err) {
    console.error("Like Post Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { id: userId, name: userName } = req.user;
    const { comment: commentText } = req.body;

    if (!commentText?.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const newComment = await Comment.create({
      comment: commentText,
      post_id: postId,
      user_id: userId,
    });

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { comments_count: 1 } },
      { new: true }
    );
    await redis.del(`post:${postId}`);

    if (updatedPost.user_id !== userId) {
      const recipientUserId = updatedPost.user_id;

      const notificationId = await createNotification(
        recipientUserId,
        `${userName} commented on your post.`,
        `/post/${postId}`,
        "NEW_COMMENT",
        userId
      );

      const notification = await getNotificationById(notificationId);
      io.to(`user_${recipientUserId}`).emit("notification:new", notification);
    }

    // Get enriched user for comment response
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, profile_photo: true },
    });

    res.status(201).json({
      message: "Comment added",
      comment: { ...newComment.toObject(), user },
    });
  } catch (err) {
    console.error("Comment Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const followUser = async (req, res) => {
  try {
    const userToFollowId = Number(req.params.id);
    const { id: followerId, name: followerName } = req.user;

    if (userToFollowId === followerId) {
      return res.status(400).json({
        message: "You cannot follow yourself.",
      });
    }

    const existingFollow = await Follow.findOne({
      follower_id: followerId,
      following_id: userToFollowId,
    });

    if (existingFollow) {
      return res.status(400).json({
        message: "You are already following this user.",
      });
    }

    await Follow.create({
      follower_id: followerId,
      following_id: userToFollowId,
    });

    const notificationId = await createNotification(
      userToFollowId,
      `${followerName} started following you.`,
      `/profile/${followerId}`,
      "NEW_FOLLOWER",
      followerId
    );

    const notification = await getNotificationById(notificationId);
    io.to(`user_${userToFollowId}`).emit("notification:new", notification);

    res.status(201).json({ message: "User followed" });
  } catch (err) {
    console.error("Follow User Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollowId = Number(req.params.id);
    const { id: followerId } = req.user;

    const existingFollow = await Follow.findOne({
      follower_id: followerId,
      following_id: userToUnfollowId,
    });

    if (!existingFollow) {
      return res.status(404).json({ message: 'You are not following this user.' });
    }

    await Follow.deleteOne({ _id: existingFollow._id });
    res.json({ message: 'User unfollowed' });
  } catch (err) {
    console.error('Unfollow User Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};