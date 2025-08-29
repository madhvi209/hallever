"use client";

import React from "react";

export const Hero = () => {

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Video */}
            <div className="absolute inset-0 z-0 bg-black">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-fit"
                >
                    <source
                        src="/videos/hallever1.mp4"
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                </video>
                {/* <div className="absolute inset-0 " /> */}
            </div>

            {/* Main Content */}
            {/* <div className="relative z-10 text-center text-white max-w-4xl px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                    {t("home.hero.h1")}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse">
                        Hallever India
                    </span>
                </h1>
                <p className="text-lg md:text-2xl mb-8 text-gray-200 animate-fade-in animation-delay-300">
                    {t("home.hero.subheading")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-600">
                    <Button
                        size="lg"
                        className="group bg-yellow-500 hover:bg-yellow-600 text-black transition-all duration-300 transform hover:scale-105"
                    >
                        {t("button.shopNow")}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="group bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
                    >
                        {t("button.knowMore")}
                    </Button>
                </div>
            </div> */}

            {/* Floating Shapes */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce opacity-70" />
            <div className="absolute bottom-32 right-20 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse opacity-60" />
            <div className="absolute top-1/3 right-10 w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-spin opacity-50" />
        </section>
    );
};

export default Hero;
