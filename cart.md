# Cart Implementation Details

This document outlines how the cart's UI features are implemented (or intended to be implemented) across the application, specifically detailing the dynamic cart icon badge and the success alert shown upon adding an item.

## 1. Dynamic Cart Number on Icon (Badge)

To make the cart icon in the navigation bar display a number representing how many items are currently in the cart, the project utilizes the application's global state (`FreshBasketContext`) combined with Material-UI's `<Badge>` component.

### Implementation Steps

1. **Accessing Cart State**  
   In `Navbar.jsx`, fetch the global cart state from the `FreshBasketContext` which holds the current cart items.

   ```jsx
   import { useContext } from "react";
   import { FreshBasketContext } from "../../Layout/Layout";

   // Inside the component:
   const { cartItemsState } = useContext(FreshBasketContext);
   const [cartItems] = cartItemsState;
   ```

2. **Displaying the Count**  
   Instead of displaying a plain `ShoppingCartRounded` icon, wrap it using the `<Badge>` component from Material-UI. The `badgeContent` prop evaluates the length of the `cartItems` array (or calculates the exact quantity of items).
   

   ```jsx
   import Badge from "@mui/material/Badge";
   import { ShoppingCartRounded } from "@mui/icons-material";

   // Inside the component rendering:
   <Badge badgeContent={cartItems?.length || 0} color="error">
     <ShoppingCartRounded fontSize="inherit" />
   </Badge>
   ```

## 2. Green Popup Message (Toast) on `Add To Cart`

Whenever a user adds an item to their cart, the system gives them immediate feedback via a fast, green popup message. 

In this project, this notification is built via a custom `<SuccessAlert />` component (which works as a toast/snackbar wrapper).

### Implementation Steps

1. **State Management for the Popup**  
   In pages with an "Add to Cart" button (for instance `ProductCard.jsx`), a local boolean state handles whether the success popup is currently shown or hidden.

   ```jsx
   const [openAlert, setOpenAlert] = useState(false);
   ```

2. **Triggering the Alert**  
   Once the user clicks the "Add to Cart" button and the backend/session cart storage is successfully updated with the new item, the `handleAddToCartBtn` function toggles the `openAlert` state to trigger the popup:

   ```jsx
   const handleAddToCartBtn = () => {
       // ... cart update logic (setCartItems, etc) ...

       // Trigger the success message
       setOpenAlert(!openAlert);
   }
   ```

3. **Rendering the Feedback Component**  
   The `SuccessAlert` component is placed high in the JSX tree of the card/page, passing down the local `state` and the text message you wish to display.

   ```jsx
   import SuccessAlert from '../../SuccessAlert/SuccessAlert';

   // Inside the render function:
   <SuccessAlert 
       state={[openAlert, setOpenAlert]} 
       massage={'Item added successfully'} 
   />
   ```
   *(Note: The prop passed inside the project for the message text is occasionally named `massage` rather than `message` based on the internal property name established in the project).*
