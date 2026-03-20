const PageNotFound = () => {

    window.scroll({ top: 0 });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 text-gray-800 text-center">404</h1>
            <h1 className="text-lg md:text-xl font-normal text-gray-600 text-center">Page Not Found</h1>
            <p className="text-sm md:text-base text-gray-500 text-center mt-4 max-w-md">
                The page you're looking for doesn't exist or has been moved.
            </p>
        </div>
    );
};

export default PageNotFound;
