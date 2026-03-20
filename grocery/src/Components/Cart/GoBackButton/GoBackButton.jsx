import { Button, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { ArrowBack } from "@mui/icons-material";
import { checkoutContext } from '../Cart';
import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    let contextValue;
    try {
        contextValue = useContext(checkoutContext);
    } catch {
        contextValue = null;
    }

    const isSmallScreen = useMediaQuery('(min-width: 640px)');

    const handleGoBack = () => {
        if (contextValue) {

            const [isProceedToCheckout, setIsProceedToCheckout] = contextValue;
            setIsProceedToCheckout(!isProceedToCheckout);
        } else {

            if (location.pathname === '/checkout') {
                navigate('/cart');
            } else {
                navigate(-1);
            }
        }
    };

    return (
        <Button
            color='success'
            onClick={handleGoBack}
            size='small'
            sx={{textTransform: 'capitalize'}}
            variant='outlined'
            startIcon={<ArrowBack fontSize='inherit' />}>
            Go Back
        </Button>
    );
};

export default GoBackButton;
