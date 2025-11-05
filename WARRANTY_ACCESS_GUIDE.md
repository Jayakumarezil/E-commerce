# Warranty Management System - Frontend Access Guide

## How to Access Warranty Pages

### 1. **User Navigation Methods**

#### **Method A: Header Navigation Menu**
- **For Authenticated Users**: Warranty links appear in the main navigation bar
  - Click "Warranties" to go to `/warranties` (My Warranties page)
  - Click "Claims" to go to `/claims` (My Claims page)

#### **Method B: User Dropdown Menu**
- Click on your **Avatar** (user icon) in the top-right corner
- Select from the dropdown menu:
  - **"My Warranties"** → `/warranties`
  - **"My Claims"** → `/claims`

#### **Method C: Direct URL Access**
Type these URLs directly in your browser:
- `http://localhost:3000/warranties` - View all your warranties
- `http://localhost:3000/warranties/register` - Register a new warranty
- `http://localhost:3000/claims` - View all your claims
- `http://localhost:3000/claims/submit` - Submit a new claim

### 2. **Available Warranty Pages**

#### **User Pages:**
1. **My Warranties** (`/warranties`)
   - View all registered warranties
   - Filter by active/expired status
   - View warranty details
   - Submit claims for active warranties

2. **Warranty Registration** (`/warranties/register`)
   - Register warranties manually
   - Upload invoice documents
   - Enter serial numbers and purchase dates

3. **My Claims** (`/claims`)
   - View all submitted claims
   - Track claim status
   - View admin notes and updates

4. **Claim Submission** (`/claims/submit`)
   - Submit new warranty claims
   - Upload supporting images/videos
   - Describe the issue

#### **Admin Pages:**
5. **Admin Claims Dashboard** (`/admin/claims`)
   - View all claims from all users
   - Update claim status
   - Add admin notes
   - Approve/reject claims

### 3. **Quick Start Steps**

1. **Start the Application:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend  
   cd client
   npm run dev
   ```

2. **Login/Register:**
   - Go to `http://localhost:3000/login`
   - Or register at `http://localhost:3000/register`

3. **Access Warranties:**
   - After login, click "Warranties" in the header
   - Or click your avatar → "My Warranties"

4. **Register a Warranty:**
   - Go to `/warranties/register`
   - Fill out the warranty registration form
   - Upload invoice if available

5. **Submit a Claim:**
   - Go to `/claims/submit`
   - Select a warranty from your active warranties
   - Describe the issue and upload evidence

### 4. **Features Available**

#### **Warranty Management:**
- ✅ Manual warranty registration
- ✅ Auto-registration from orders
- ✅ Warranty expiry tracking
- ✅ Serial number validation
- ✅ Invoice upload support

#### **Claim Management:**
- ✅ Issue description with rich text
- ✅ Image/video upload (max 5 files)
- ✅ Status tracking (pending/approved/rejected/resolved)
- ✅ Admin notes and updates
- ✅ Email notifications

#### **Admin Features:**
- ✅ View all claims dashboard
- ✅ Update claim status
- ✅ Add admin notes
- ✅ Filter claims by status
- ✅ Bulk operations

### 5. **Authentication Required**

- **User Pages**: Require user authentication
- **Admin Pages**: Require admin role (`role: 'admin'`)
- **Public Pages**: Home, Products, Login, Register

### 6. **Troubleshooting**

#### **If warranty pages don't load:**
1. Check if you're logged in
2. Verify the backend server is running
3. Check browser console for errors
4. Ensure all dependencies are installed

#### **If you can't see warranty links:**
1. Make sure you're authenticated
2. Refresh the page
3. Check if the user has the correct role

#### **Backend API Endpoints:**
- `POST /api/warranties/register` - Register warranty
- `GET /api/warranties/user/:userId` - Get user warranties
- `POST /api/claims/create` - Submit claim
- `GET /api/claims/user/:userId` - Get user claims
- `PUT /api/claims/:id/update-status` - Update claim status (admin)

### 7. **Testing the System**

1. **Register a Test Warranty:**
   - Go to `/warranties/register`
   - Fill out the form with test data
   - Submit and verify it appears in `/warranties`

2. **Submit a Test Claim:**
   - Go to `/claims/submit`
   - Select the warranty you just created
   - Submit a claim and verify it appears in `/claims`

3. **Test Admin Functions** (if you have admin role):
   - Go to `/admin/claims`
   - Update claim status
   - Add admin notes

The warranty management system is now fully integrated into your frontend application! 🚀
