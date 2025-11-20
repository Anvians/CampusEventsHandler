import redis from '../db/redis.connection.js';
import Notification from '../models/Notification.model.js';
import Post from "../models/Post.model.js";
import prisma from '../db/prisma.connection.js';
import Follow from '../models/Follow.model.js'; 
import {
  getNotificationsForUser,
  markAllNotificationsAsRead,
  getNotificationById
} from '../utils/notifications.js';
import mongoose from 'mongoose';
// A helper function to safely select user data to return
const selectUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  department: true,
  year: true,
  profile_photo: true,
  bio: true,
  verified: true,
  created_at: true,
};


// ---------------- GET MY PROFILE ----------------
export const getMyProfile = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { /* ... keep your existing selects ... */ 
        id: true, name: true, email: true, department: true, 
        year: true, profile_photo: true, bio: true, 
        verified: true, created_at: true 
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user_id: userId }).sort({ created_at: -1 });
    
    const formattedPosts = posts.map(p => ({
        id: p._id.toString(),
        caption: p.caption,
        image_url: p.image_url,
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        created_at: p.created_at
    }));

    const clubs = await prisma.club_membership.findMany({
      where: { user_id: userId },
      select: { club: { select: { id: true, name: true, club_logo_url: true } } }
    });

    // Add Follow Counts
    const followersCount = await Follow.countDocuments({ following_id: userId });
    const followingCount = await Follow.countDocuments({ follower_id: userId });

    const result = {
      ...user,
      posts: formattedPosts,
      club_memberships: clubs,
      _count: {
        posts: formattedPosts.length,
        followers: followersCount,
        following: followingCount
      }
    };

    return res.json(result);
  } catch (err) {
    console.error("Get My Profile Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};



// ---------------- GET OTHER USER PROFILE ----------------
export const getUserProfile = async (req, res) => {
  try {
    const profileId = Number(req.params.id);
    const currentUserId = Number(req.user.id);

    // Get User Details (Postgres)
    const user = await prisma.user.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        year: true,
        profile_photo: true,
        bio: true,
        verified: true,
        created_at: true
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Get Posts (MongoDB)
    const posts = await Post.find({
      user_id: profileId,
      visibility: "PUBLIC"
    }).sort({ created_at: -1 });

    const formattedPosts = posts.map(p => ({
      id: p._id.toString(),
      caption: p.caption,
      image_url: p.image_url,
      likes_count: p.likes_count || 0,
      comments_count: p.comments_count || 0,
      created_at: p.created_at
    }));

    // Get Club Memberships (Postgres)
    const clubs = await prisma.club_membership.findMany({
      where: { user_id: profileId },
      select: {
        club: { select: { id: true, name: true, club_logo_url: true } }
      }
    });

    // Calculate Follow Stats (MongoDB) 
    const followersCount = await Follow.countDocuments({ following_id: profileId });
    const followingCount = await Follow.countDocuments({ follower_id: profileId });
    
    const isFollowing = await Follow.exists({ 
      follower_id: currentUserId, 
      following_id: profileId 
    });

    // Return Combined Data
    return res.json({
      ...user,
      isFollowing: !!isFollowing, // Convert null/obj to boolean
      posts: formattedPosts,
      club_memberships: clubs,
      _count: {
        posts: formattedPosts.length,
        followers: followersCount,
        following: followingCount
      }
    });

  } catch (err) {
    console.error("Get User Profile Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

//Get ALL notifications (Sorted, Populated)
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await getNotificationsForUser(userId);

    return res.status(200).json(notifications);
  } catch (err) {
    console.error('Get Notifications Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Mark ALL notifications as read
export const markNotificationsAsRead = async (req, res) => {
  try {
    await markAllNotificationsAsRead(req.user.id);
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark All Read Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Mark ONE notification as read
export const markOneNotificationAsRead = async (req, res) => {
    console.log('Request', req.params, req.user.id)
  try {
    const notifId = req.params.id;
    const userId = Number(req.user.id);

    console.log("Mark read:", notifId, "User:", userId);

    if (!mongoose.isValidObjectId(notifId)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notif = await Notification.findById(notifId);

    console.log('Notification fetched:', notif);

    if (!notif || Number(notif.receiver_id) !== userId) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await Notification.updateOne(
      { _id: notifId },
      { $set: { is_read: true } }
    );

    await redis.del(`notifications:${userId}`); // Flush cache

    return res.status(200).json({ message: "Notification marked as read" });

  } catch (err) {
    console.error("Mark One Read Error:", err.message);
    return res.status(500).json({ message: "Server Error" });
  }
};