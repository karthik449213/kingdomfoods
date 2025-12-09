# ✅ Bulk Upload Checklist

## Pre-Upload Checklist

- [ ] Backend is running (`npm run dev`)
- [ ] CSV file path is correct and file exists
- [ ] CSV has `name` and `price` columns
- [ ] Image paths in CSV are absolute and accessible
- [ ] JWT token obtained and copied
- [ ] Backend dependencies installed (`npm install axios csv-parse`)

## Execution Steps

- [ ] Open terminal in `d:\kin\kingdomfoods\backend`
- [ ] Run: `node scripts/uploadCSV.js "d:\kin\kkk.csv.csv" "jwt-token"`
- [ ] Wait for upload to complete (don't close terminal)
- [ ] Check for success/failure summary

## Post-Upload Verification

- [ ] Check MongoDB for dishes count increased
- [ ] Verify images uploaded to Cloudinary
- [ ] Test API endpoint: `GET http://localhost:5000/menu`
- [ ] Check a few dishes have correct image URLs
- [ ] Verify prices and descriptions are correct

## Troubleshooting Checklist

If upload fails:
- [ ] Check JWT token is valid (try login again if unsure)
- [ ] Check backend is still running
- [ ] Check CSV file path is correct
- [ ] Check image paths in CSV are absolute and accessible
- [ ] Check database connection is working
- [ ] Check Cloudinary credentials are configured
- [ ] Try uploading just 5 dishes to test

## Data Quality Checklist

Before bulk upload:
- [ ] All dishes have names
- [ ] All dishes have prices (numbers, not text)
- [ ] Image files exist at specified paths
- [ ] No duplicate dish names (optional but recommended)
- [ ] Prices are reasonable numbers
- [ ] Descriptions are not too long (< 500 chars)

## Performance Checklist

- [ ] Internet connection is stable
- [ ] Computer has adequate storage
- [ ] No antivirus blocking Cloudinary uploads
- [ ] MongoDB connection is stable
- [ ] Backend is not using too much CPU

## Success Indicators

You should see:
- ✅ "✓ Successful: XXX"
- ✅ "📋 Sample Uploaded Dishes" with your dish names
- ✅ No major error messages
- ✅ API returns increased count

## Cleanup After Success

- [ ] Delete temporary CSV file if needed
- [ ] Update Cloudinary folder to organize images
- [ ] Document any failed dishes for manual entry
- [ ] Test frontend displays new dishes
- [ ] Backup database

---

## 🚨 Emergency Troubleshooting

If nothing works:

1. **Check backend logs**
   ```bash
   npm run dev  # Look at console output
   ```

2. **Test API manually**
   ```bash
   curl http://localhost:5000/menu
   ```

3. **Check MongoDB connection**
   ```bash
   # In MongoDB Compass or shell
   db.dishes.find().limit(1)
   ```

4. **Verify Cloudinary is working**
   - Check cloudinary.js config
   - Test image upload with existing endpoint

5. **Reset and retry**
   - Clear temp files
   - Restart backend
   - Re-authenticate
   - Try with smaller CSV (5 rows)

---

## 📞 Support Resources

- `QUICK_START.md` - Fastest way to get started
- `BULK_UPLOAD_GUIDE.md` - Comprehensive guide
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- Check API response for specific error messages

---

**Status:** Ready to upload! 🚀

**Last Updated:** 2025-12-08

**Version:** 1.0
