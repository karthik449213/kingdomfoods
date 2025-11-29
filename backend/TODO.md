- [x] Fix add dish API endpoint by changing route from "/dish" to "/add-dish" in dishRoutes.js and mounting at "/api"
curl -X POST http://localhost:5000/api/add-dish \
  -F "name=Dish Name" \
  -F "price=10.99" \
  -F "image=@path/to/image.jpg"
