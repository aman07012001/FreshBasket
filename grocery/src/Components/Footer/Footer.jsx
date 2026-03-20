import { Container, useMediaQuery } from '@mui/material';
import React from 'react';
import Logo_black from '../../assets/Logo_black.png';
import Facebook from '../../assets/icons/social_icons/Facebook.png';
import Instagram from '../../assets/icons/social_icons/Instagram.png';
import Twitter from '../../assets/icons/social_icons/Twitter.png';
import Linkedin from '../../assets/icons/social_icons/Linkedin.png';
import { LocationOn, Mail, Phone } from "@mui/icons-material";

class Link {
    constructor(name, href) {
        this.name = name;
        this.href = href;
    }
}

const Footer = () => {

    const isLargeScreen = useMediaQuery('(min-width:1024px)')

    return (
        <footer id='footer' className='text-white' style={{ backgroundColor: '#123F1E' }}>
            <Container sx={{ py: isLargeScreen ? 6.8 : 5 }}>
                <div className='grid md:grid-cols-4 lg:grid-cols-5 sm:grid-cols-4 grid-cols-2 sm:gap-x-2 lg:gap-x-0 gap-x-1.5 sm:gap-y-9 lg:gap-y-0 gap-y-7 '>

                    {}
                    <div className='col sm:col-span-2  lg:col-span-2 xl:space-y-6 space-y-4'>
                        {}
                        <img className='sm:max-h-16 max-h-14 my-auto cursor-pointer' src={Logo_black} alt="FreshBasket" />

                        {}
                        <p className='sm:text-sm w-11/12 sm:w-10/12 text-xs tracking-wide'>
                            We provide fresh, top-notch meat, vegetables, and more. Enjoy quick delivery and savor the finest ingredients for a delicious dining experience.
                        </p>

                        {}
                        <div className='flex md:space-x-3.5 space-x-3'>
                            {}
                            <a href="#">
                                <img className='sm:max-h-none max-h-5' src={Facebook} alt="facebook" />
                            </a>

                            {}
                            <a href="#">
                                <img className='sm:max-h-none max-h-5' src={Instagram} alt="Instagram " />
                            </a>

                            {}
                            <a href="#">
                                <img className='sm:max-h-none max-h-5' src={Twitter} alt="Twitter" />
                            </a>

                            {}
                            <a href="#">
                                <img className='sm:max-h-none max-h-5' src={Linkedin} alt="Linkedin" />
                            </a>
                        </div>
                    </div>

                    <>
                        {}
                        <Links
                            title={'About Us'}
                            linksArray={[new Link('About Us'),
                            new Link('Why Us'), new Link('Security'), new Link('Testimonials')]} />

                        {}
                        <Links
                            title={'Help'}
                            linksArray={[new Link('Account'),
                            new Link('Support Center'), new Link('Privacy Policy'), new Link('Terms & Conditions')]} /></>

                    {}
                    <div className='lg:col-auto md:col sm:col-span-3 col xl:space-y-3.5 space-y-2'>
                        <h3 className='xl:text-xl sm:text-lg text-base font-semibold tracking-wider'>Contact Us</h3>
                        <div className='sm:space-y-2 space-y-1.5 xl:text-base text-sm'>
                            {}
                            <a className='block text-sm sm:text-base hover:underline flex items-center gap-2' href="tel:+1 (406) 555-0120">
                                <Phone fontSize='inherit' /> +917668776650
                            </a>

                            {}
                            <a className='block text-sm sm:text-base hover:underline flex items-center gap-2' href="mailto:hasan.dev1@gmail.com">
                                <Mail fontSize='inherit' /> gusainaman813@gmail.com
                            </a>

                            {}
                            <address className='flex items-center gap-2 not-italic'>
                                <LocationOn fontSize='inherit' /> dhalwala, Rishikesh (UTTRAKHAND, INDIA)
                            </address>
                        </div>
                    </div>
                </div>
            </Container>

            {}
            <div>
                <hr className='border-gray-600' />
                <div className='text-center flex items-center h-12'>
                    <span className='text-xs  w-full block text-gray-300 tracking-wider'>© 2025 Developed By <a className='hover:underline' href="https://github.com/ahmod001" target="_blank" rel="noopener noreferrer"> Aman Gusain </a></span>
                </div>
            </div>
        </footer>
    );
};

const Links = ({ title, linksArray }) => (
    < div className='col xl:space-y-3.5 space-y-2'>
        {}
        <h3 className='xl:text-xl sm:text-lg text-base font-semibold tracking-wider'>{title}</h3>

        {}
        <div className='sm:space-y-2 space-y-1.5'>
            {
                linksArray.map((link, i) => (
                    <a key={i}
                        className='block xl:text-base text-sm hover:underline'
                        href={link.href || '#'}>
                        {link.name}
                    </a>
                ))
            }
        </div>
    </div >
)

export default Footer;