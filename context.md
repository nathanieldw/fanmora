# FanMora Application Context

## Application Overview

FanMora is a social media platform designed for content creators and their fans, incorporating features similar to platforms like Instagram and OnlyFans. Key functionalities include:

- **User Profiles:** Customizable profiles with banners, avatars, bios, and user statistics.
- **Content Sharing:** Users can create posts containing text, images, and videos. Posts can be marked as premium (requiring a subscription).
- **Subscriptions:** Fans can subscribe to creators to access exclusive content.
- **Stories:** Ephemeral content (like Instagram Stories) that expires after a set time (e.g., 48 hours).
- **Feeds:** A main dashboard feed displaying content from followed users and an explore feed for discovering new content and users.
- **Direct Messaging:** Users can send direct messages to each other.
- **Engagement:** Users can like, comment on, and save posts.
- **Notifications:** Users receive notifications for relevant activities (likes, comments, follows, etc.).
- **Settings:** Users can manage their profile, password, and application appearance.

**Tech Stack:**

- **Backend:** Laravel (PHP Framework)
- **Frontend:** React with Inertia.js
- **UI:** Tailwind CSS with shadcn/ui components
- **Database:** (Likely MySQL or PostgreSQL, based on typical Laravel setups)

This document provides an overview of the key components of the FanMora application codebase.

## Controllers (`/app/Http/Controllers`)

These handle incoming HTTP requests and orchestrate responses, often interacting with Models and rendering Views/Pages.

- `Auth/AuthenticatedSessionController.php`: Manages user login sessions.
- `Auth/ConfirmablePasswordController.php`: Handles password confirmation for sensitive actions.
- `Auth/EmailVerificationNotificationController.php`: Sends email verification notifications.
- `Auth/EmailVerificationPromptController.php`: Displays the email verification prompt page.
- `Auth/NewPasswordController.php`: Handles setting a new password after a reset request.
- `Auth/OAuthController.php`: Manages OAuth (e.g., Google, Facebook) authentication.
- `Auth/PasswordResetLinkController.php`: Handles sending password reset links.
- `Auth/RegisteredUserController.php`: Manages new user registration.
- `Auth/VerifyEmailController.php`: Handles the email verification process.
- `CommentController.php`: Manages post comments (create, read, delete).
- `Controller.php`: Base controller class providing common functionality.
- `FollowController.php`: Manages user following relationships.
- `LikeController.php`: Manages post likes.
- `MediaController.php`: Handles media uploads and management (images, videos).
- `MessageController.php`: Manages direct messages between users.
- `NotificationController.php`: Manages user notifications.
- `PostController.php`: Manages posts (create, read, update, delete).
- `Settings/PasswordController.php`: Handles user password change settings.
- `Settings/ProfileController.php`: Handles user profile settings updates.
- `StoryController.php`: Manages user stories (creation, viewing, deletion).
- `SubscriptionController.php`: Manages user subscriptions to creators.
- `UserController.php`: Manages user profiles and related data retrieval.
- `WelcomeController.php`: Handles the application's welcome/landing page.

## Pages (`/resources/js/pages`)

These are the main frontend views/pages built with React and Inertia.js.

- `Messages/Chat.tsx`: Displays an individual chat conversation.
- `Messages/Index.tsx`: Displays the list of user conversations.
- `Subscription/Create.tsx`: Page for creating/managing subscription tiers (likely for creators).
- `auth/complete-profile.tsx`: Page for users to complete their profile after registration.
- `auth/confirm-password.tsx`: Page for password confirmation.
- `auth/forgot-password.tsx`: Page for requesting a password reset.
- `auth/login.tsx`: User login page.
- `auth/register.tsx`: User registration page.
- `auth/reset-password.tsx`: Page for resetting the password using a token.
- `auth/verify-email.tsx`: Page prompting users to verify their email.
- `dashboard.tsx`: The main dashboard/feed page after login.
- `explore.tsx`: Page for discovering posts and users (Explore/Discover feed).
- `messages.tsx`: Main container or layout for messaging features.
- `notifications.tsx`: Page displaying user notifications.
- `post/create.tsx`: Page or modal for creating a new post.
- `profile/show.tsx`: Displays a user's profile page.
- `settings/appearance.tsx`: User settings page for appearance/theme.
- `settings/password.tsx`: User settings page for changing password.
- `settings/profile.tsx`: User settings page for editing profile details.
- `welcome.tsx`: The public landing page for logged-out users.

## Models (`/app/Models`)

These represent the application's data structures and interact with the database (Eloquent Models).

- `Comment.php`: Represents a comment on a post.
- `Like.php`: Represents a like on a post.
- `Media.php`: Represents an uploaded media file (image, video).
- `Message.php`: Represents a direct message.
- `MessageAttachment.php`: Represents an attachment to a message.
- `Notification.php`: Represents a user notification.
- `Post.php`: Represents a user-created post.
- `Save.php`: Represents a saved/bookmarked post.
- `Story.php`: Represents a user's story.
- `StoryView.php`: Represents a view record for a story.
- `Subscription.php`: Represents a subscription between users.
- `User.php`: Represents an application user.

## Important Component Directories (`/resources/js/components`)

These directories contain reusable UI components.

- `PostCard/`: Components related to displaying a single post in feeds or grids.
- `modals/`: Reusable modal dialog components (e.g., login, post creation, subscription).
- `navigation/`: Components for site navigation (e.g., sidebar, topbar, mobile nav).
- `post/`: Components related to displaying or interacting with post details (beyond just the card).
- `profile/`: Components specifically for building the user profile page sections.
- `stories/`: Components for displaying and interacting with stories (e.g., story circles, viewer).
- `ui/`: General-purpose UI components based on shadcn/ui (Button, Avatar, Input, etc.).
- `welcome/`: Components used specifically on the public welcome page.
