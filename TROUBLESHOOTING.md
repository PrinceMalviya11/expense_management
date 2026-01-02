# Troubleshooting Guide - Nothing Shows in Browser

If your browser shows nothing or a blank page, follow these steps:

## Step 1: Verify Both Servers Are Running

### Check Backend (Terminal 1)
You should see:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

❌ **If you see errors:**
- MongoDB connection error → Check your `.env` MONGODB_URI
- Port already in use → Change PORT in `.env` to 5001
- Module not found → Run `npm install` again

### Check Frontend (Terminal 2)
You should see:
```
  VITE v5.0.8  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

❌ **If you see errors:**
- Port 5173 already in use → Vite will automatically use next available port (5174, 5175, etc.)
- Module not found → Run `npm install` in frontend folder
- Compilation errors → Check the error message

---

## Step 2: Check What Port Frontend Is Actually Running On

**IMPORTANT:** Look at the terminal output!

The frontend might be running on a different port if 5173 is busy.

Example:
```
➜  Local:   http://localhost:5174/  ← Use THIS URL!
```

**Use the exact URL shown in your terminal!**

---

## Step 3: Check Browser Console for Errors

1. Open browser: `http://localhost:5173` (or the port shown in terminal)
2. Press `F12` to open Developer Tools
3. Click "Console" tab
4. Look for RED error messages

Common errors and solutions:

### Error: "Failed to fetch" or Network Error
**Problem:** Frontend can't connect to backend
**Solution:**
- Make sure backend is running (check Terminal 1)
- Check `frontend/.env` has: `VITE_API_URL=http://localhost:5000/api`
- Verify backend is on port 5000 (check Terminal 1 output)

### Error: "Module not found" or Import errors
**Problem:** Missing dependencies or compilation error
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Error: Blank white screen
**Problem:** React app crashed during render
**Solution:**
- Check Console tab for errors
- Check Network tab (F12 → Network) for failed requests
- Try hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

---

## Step 4: Verify Files Are Correct

### Check frontend/.env file exists and has:
```env
VITE_API_URL=http://localhost:5000/api
```

### Check backend/.env file exists and has:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

---

## Step 5: Test Backend API Directly

Open in browser: `http://localhost:5000/api/health`

**Should see:**
```json
{"status":"OK","message":"Server is running"}
```

**If you see this:** Backend is working ✅
**If you see error:** Backend has issues ❌

---

## Step 6: Common Issues and Fixes

### Issue 1: Blank White Page
**Possible causes:**
- JavaScript error in console
- Missing dependencies
- Build/compilation failed

**Fix:**
1. Check browser console (F12)
2. Look for error messages
3. Fix the error or restart servers

### Issue 2: "Cannot GET /"
**This means:** Frontend is not running or wrong URL

**Fix:**
- Make sure frontend terminal shows "ready"
- Use the exact URL from terminal (might be 5174, 5175, etc.)
- Try: `http://localhost:5173`, `http://localhost:5174`, etc.

### Issue 3: CORS Errors
**Error message:** "Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy"

**Fix:**
- Check `backend/server.js` has `app.use(cors())`
- Restart backend server
- Clear browser cache

### Issue 4: 404 Not Found on API Calls
**Error:** Network tab shows 404 for `/api/auth/login` etc.

**Fix:**
- Make sure backend is running
- Check `VITE_API_URL` in frontend/.env
- Verify backend routes are correct

---

## Step 7: Complete Reset (If Nothing Works)

### Reset Frontend:
```bash
cd frontend
# Stop server (Ctrl+C)
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Reset Backend:
```bash
cd backend
# Stop server (Ctrl+C)
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Step 8: Check File Structure

Make sure you have these files:
```
Expense Management/
├── backend/
│   ├── .env          ← Must exist!
│   ├── package.json
│   └── server.js
└── frontend/
    ├── .env          ← Must exist!
    ├── package.json
    └── src/
        ├── main.jsx
        └── App.jsx
```

---

## Quick Diagnostic Checklist

Answer these questions:

- [ ] Backend terminal shows "Server running on port 5000"?
- [ ] Frontend terminal shows "ready" and a Local URL?
- [ ] Both `.env` files exist and are filled correctly?
- [ ] `http://localhost:5000/api/health` works in browser?
- [ ] Browser console (F12) shows any errors?
- [ ] You're using the exact URL from frontend terminal?
- [ ] Both terminals are still running (not closed)?

---

## Still Not Working?

**Tell me:**
1. What do you see in backend terminal? (copy the last few lines)
2. What do you see in frontend terminal? (copy the last few lines)
3. What URL are you opening in browser?
4. What do you see in browser? (screenshot or describe)
5. Any errors in browser console? (F12 → Console tab)
6. Does `http://localhost:5000/api/health` work?

With this information, I can help you fix the specific issue!

