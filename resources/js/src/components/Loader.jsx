import '../assets/styles/loader.css'; 

const Loader = (className) => {
    return (
        <div className="loader backdrop-blur-sm  flex justify-center items-center">
            <div className="spinner w-26 h-26">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

export default Loader;
