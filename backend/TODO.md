- [x] Fix add dish API endpoint by changing route from "/dish" to "/add-dish" in dishRoutes.js and mounting at "/api"
curl -X POST http://localhost:5000/api/add-dish \
  -F "name=Dish Name" \
  -F "price=10.99" \
  -F "image=@path/to/image.jpg"
imageUrl eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MmMxNDJiNWM2ZTk3NzFiMmVjYWY0YiIsInVzZXJuYW1lIjoia2FydGhpa3BpaW5hc2lAZ21haWwuY29tIiwiaWF0IjoxNzY0NDk2NDgwLCJleHAiOjE3NjUxMDEyODB9.TkhFqVpaTon6IptRP8K5-cBWftNehLgVlr53eARqkzg