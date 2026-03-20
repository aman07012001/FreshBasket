import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
  password: yup
    .string()
    .required('Password is required')
    .matches(
      /^(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/,
      'Minimum 6 characters, alphanumeric with one uppercase letter'
    ),
});

export const signupSchema = yup.object({
  name: yup.string().required('Full name is required'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
  password: yup
    .string()
    .required('Password is required')
    .matches(
      /^(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/,
      'Minimum 6 characters, alphanumeric with one uppercase letter'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
});

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .matches(
      /^(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/,
      'Minimum 6 characters, alphanumeric with one uppercase letter',
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

export const deliverySchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup
    .string()
    .email('Invalid email address'),
  phone: yup
    .string()
    .required('Phone number is required')
    .min(7, 'Phone number must be at least 7 characters'),
  address: yup.string().required('Address is required'),
  pincode: yup.string().required('Pincode is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
});

export const orderSchema = yup.object({
  items: yup
    .array()
    .of(
      yup.object({
        productId: yup.string().required('Product ID is required'),
        name: yup.string().required('Product name is required'),
        price: yup
          .number()
          .min(0, 'Price must be non-negative')
          .required('Price is required'),
        quantity: yup
          .number()
          .integer('Quantity must be an integer')
          .min(1, 'Quantity must be at least 1')
          .required('Quantity is required'),
        img: yup.string(),
      })
    )
    .min(1, 'Order must contain at least one item')
    .required('Items are required'),
  paymentMethod: yup
    .string()
    .oneOf(['COD', 'ONLINE'], 'Invalid payment method')
    .required('Payment method is required'),
  totalAmount: yup
    .number()
    .min(0, 'Total amount must be non-negative')
    .required('Total amount is required'),
  deliveryAddress: yup.object({
    name: yup.string().required('Name is required'),
    phone: yup
      .string()
      .required('Phone number is required')
      .min(7, 'Phone number must be at least 7 characters'),
    pincode: yup.string().required('Pincode is required'),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    email: yup.string().email('Invalid email address'),
  }),
});
