# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-05-10

### Added
- **Initial Application Setup**: Created the foundational structure of the SafePlate shopping list application, including the main user interface and core components.
- **Firebase Firestore Integration**: Implemented Firebase Firestore to enable persistent storage of shopping list items, replacing local storage. This allows items to be saved, retrieved, updated, and deleted from a cloud database.
- **Firebase Authentication**: Integrated Firebase Authentication to enable user login and registration, restricting shopping list access to authenticated users.
- **User-Specific Shopping Lists**: Implemented user-specific shopping lists using Firestore subcollections, ensuring each user has their own private list.