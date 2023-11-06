import React from "react";
import { useState } from 'react';
import Logo from "../../assets/woodsland-logo.svg";
import axios from "axios";

function Login() {

    var status = "";
    const [values, setValues] = useState({
        email: "",
        password: "",   
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .post("http://localhost:8000/api/login", {
                email: values.email,
                password: values.password
            })
            .then (res => console.log(res))
            .catch(err => console.error(err));
    };

    return (
        <section className="h-screen bg-gray-50 dark:bg-gray-900">
            <form>
                <div className="flex flex-col items-center justify-center px-6 py-4 md:pt-10 mx-auto md:h-screen lg:py-0">
                    <div href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white" >
                        <img className="w-20 h-20 mr-2" src={Logo} alt="logo" />
                    </div>
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Sign in to your account
                            </h1>
                            <form className="space-y-4 md:space-y-6" action="#">
                                <div>
                                    <label
                                        for="email"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        {" "}
                                        Your email{" "}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="name@company.com"
                                        required=""
                                        onChange={(e)=>setValues({...values,email:e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label
                                        for="password"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="••••••••"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        required=""
                                        onChange={(e)=>setValues({...values,password:e.target.value})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="remember"
                                                aria-describedby="remember"
                                                type="checkbox"
                                                class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                                                required=""
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label
                                                for="remember"
                                                className="text-gray-500 dark:text-gray-300"
                                            >
                                                Remember me
                                            </label>
                                        </div>
                                    </div>
                                    <a
                                        href="#"
                                        className="text-sm font-medium text-primary-600 hover:underline dark:text-[#2A779C]"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="w-full text-white bg-[#17506B] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-[] dark:hover:bg-primary-700 dark:focus:ring-blue-200"
                                >
                                    Sign in
                                </button>
                                <p className="text-center text-md font-medium text-gray-500 dark:text-gray-300">
                                    {status}
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}

export default Login;
