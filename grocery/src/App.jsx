import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import Layout from './Components/Layout/Layout';
import Home from './Components/Home/Home';
import Products from "./Components/Products/Products";
import AllCategories from "./Components/AllCategories/AllCategories";
import PageNotFound from "./Components/PageNotFound/PageNotFound";
import About from "./Components/About/About";
import Login from "./Components/Authantication/Login/Login";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import Cart from "./Components/Cart/Cart";
import InventoryDashboard from "./Components/Inventory/InventoryDashboard";
import Signup from './Components/Authantication/Signup/Signup';
import Checkout from './Components/Checkout/Checkout';
import Confirmation from './Components/Checkout/Confirmation';
import MyOrders from './Components/Orders/MyOrders';
import AdminOrders from './Components/Orders/AdminOrders';
import OrderDetails from './Components/Orders/OrderDetails';
import OrderTestDashboard from './Components/Orders/OrderTestDashboard';
import ForgotPassword from './Components/Authantication/ForgotPassword/ForgotPassword';
import ResetPassword from './Components/Authantication/ResetPassword/ResetPassword';
import VerifyEmail from './Components/Authantication/VerifyEmail/VerifyEmail';
import Sessions from './Components/Authantication/Sessions/Sessions';
import UserDetails from './Components/UserDetails';
import Diagnostics from './Components/Diagnostics/Diagnostics';
function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<AllCategories />} />
          <Route path="/about" element={<About />} />
          <Route path="/categories/:categoryName" element={
            <Products categoryProducts={true} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          {}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/inventory" element={<InventoryDashboard />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/test-orders" element={<OrderTestDashboard />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/user-details" element={<UserDetails />} />
          </Route>
          <Route path="/order-confirmation" element={<Confirmation />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
