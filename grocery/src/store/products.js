import chickenMeatImg from '../assets/products/meat/chicken_meat.jpg.jpg';
import crabMeatImg from '../assets/products/meat/crab_meat.jpg.jpg';
import lambMeatImg from '../assets/products/meat/lamb_meat.jpg.jpg';

export const products = [
  {
    "category": "Meat",
    "items": [
      {
        "name": "Chicken Meat",
        "img": chickenMeatImg,
        "id": 0,
        "price": 8.99,
        "total": 8.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.2,
        "reviewCount": 18
      },
      {
        "name": "Crab Meat",
        "img": crabMeatImg,
        "id": 1,
        "price": 14.99,
        "total": 14.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.6,
        "reviewCount": 20
      },
      {
        "name": "Lamb Meat",
        "img": lambMeatImg,
        "id": 2,
        "price": 12.99,
        "total": 12.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.8,
        "reviewCount": 32
      }
    ]
  },
  {
    "category": "Vegetables",
    "items": [
      {
        "name": "Tomato",
        "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOIlG7EJOjyTKK4UfXL7chM2y1cJsNIvHmdA&usqp=CAU",
        "id": 3,
        "price": 2.99,
        "total": 2.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.6,
        "reviewCount": 22
      },
      {
        "name": "Carrot",
        "img": "https://img.freepik.com/premium-photo/carrot-vegetable-with-leaves-isolated-white-background-cutout_272595-2793.jpg",
        "id": 4,
        "price": 1.99,
        "total": 1.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.3,
        "reviewCount": 17
      },
      {
        "name": "Spinach",
        "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2J_5U7c5kCxdXHFJV4JHhyRNtQ4TUrJdoNg&usqp=CAU",
        "id": 5,
        "price": 3.99,
        "total": 3.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.7,
        "reviewCount": 28
      },
      {
        "name": "Broccoli",
        "img": "https://thumbs.dreamstime.com/b/broccoli-isolated-white-shadow-113429341.jpg",
        "id": 6,
        "price": 2.49,
        "total": 2.49,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.4,
        "reviewCount": 20
      }
    ]
  },
  {
    "category": "Fruits",
    "items": [
      {
        "name": "Apple",
        "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa2PTfEc2Vw-5cnT8pAzy5jv-qEuxi5LUd0g&usqp=CAU",
        "id": 7,
        "price": 1.49,
        "total": 1.49,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.2,
        "reviewCount": 16
      },
      {
        "name": "Banana",
        "img": "https://upload.wikimedia.org/wikipedia/commons/4/44/Bananas_white_background_DS.jpg",
        "id": 8,
        "price": 0.99,
        "total": 0.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.1,
        "reviewCount": 14
      },
      {
        "name": "Orange",
        "img": "https://media.istockphoto.com/id/1194662606/photo/orange-isolated-on-white-background-clipping-path-full-depth-of-field.jpg?s=170667a&w=0&k=20&c=3wrFCrSos9Oi04090iEm-cUM8cUMBlJ4AqqvCS0EwM0=",
        "id": 9,
        "price": 1.79,
        "total": 1.79,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.3,
        "reviewCount": 18
      },
      {
        "name": "Grapes",
        "img": "https://img.freepik.com/premium-photo/grapes-white-background_181303-4423.jpg",
        "id": 10,
        "price": 3.99,
        "total": 3.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.5,
        "reviewCount": 24
      }
    ]
  },
  {
    "category": "Dairy",
    "items": [
      {
        "name": "Milk",
        "img": "https://media.istockphoto.com/id/1271035466/vector/illustration-of-the-milk-cold-drink.jpg?s=612x612&w=0&k=20&c=ntRLDVh2RaDt-BuWszDfNAG--YpqG1ReXuWMxtyHv3Q=",
        "id": 11,
        "price": 2.99,
        "total": 2.99,
        "quantity": 1,
        "unit": 'ltr',
        "reviews": 4.4,
        "reviewCount": 19
      },
      {
        "name": "Cheese",
        "img": "https://static.vecteezy.com/system/resources/previews/002/009/138/large_2x/three-wedges-of-yellow-cheese-with-holes-on-white-background-photo.jpg",
        "id": 12,
        "price": 4.99,
        "total": 4.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.8,
        "reviewCount": 32
      },
      {
        "name": "Yogurt",
        "img": "https://img.freepik.com/premium-photo/fresh-greek-yogurt-isolated-white-background_88281-4071.jpg",
        "id": 13,
        "price": 1.99,
        "total": 1.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.2,
        "reviewCount": 15
      },
      {
        "name": "Butter",
        "img": "https://img.freepik.com/premium-photo/butter-butterdish-isolated-white-background-with-clipping-path_625448-1364.jpg?w=2000",
        "id": 14,
        "price": 3.49,
        "total": 3.49,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.6,
        "reviewCount": 27
      }
    ]
  },
  {
    "category": "Grains",
    "items": [
      {
        "name": "Rice",
        "img": "https://media.istockphoto.com/id/1401261369/photo/white-raw-rice.webp?b=1&s=170667a&w=0&k=20&c=DjAwcuhRnSypv1nvsONghNKQnKfZ4ybiznzea-IKp_g=",
        "id": 15,
        "price": 4.99,
        "total": 4.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.7,
        "reviewCount": 23
      },
      {
        "name": "Wheat",
        "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjtmU1s_ffVdZgs1Slz1BI8-1-g-uN1jjtV9C-isIuch_zJ2_ledVjgG9ad6HobkHZzk4&usqp=CAU",
        "id": 16,
        "price": 3.99,
        "total": 3.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.5,
        "reviewCount": 21
      },
      {
        "name": "Oats",
        "img": "https://media.istockphoto.com/id/599793642/photo/pile-of-oatmeal.jpg?s=612x612&w=0&k=20&c=Lcb4GDaGj1TYSm842C47wn2eW9h27gBKZiDEtGwE4q0=",
        "id": 17,
        "price": 2.99,
        "total": 2.99,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.3,
        "reviewCount": 17
      },
      {
        "name": "Barley",
        "img": "https://thumbs.dreamstime.com/b/pearled-barley-white-background-16848134.jpg",
        "id": 18,
        "price": 3.49,
        "total": 3.49,
        "quantity": 1,
        "unit": 'kg',
        "reviews": 4.4,
        "reviewCount": 19
      }
    ]
  }
]