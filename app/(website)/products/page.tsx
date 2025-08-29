
import ProductHero from "./productHero";
import TestimonialsSection from "@/components/home/testimonial-section";
import ContactSection from "@/components/home/contactUs-section";
import ProductCategories from "@/components/home/product-categories";
import ProductSection from "@/components/home/product-section";

const AboutPage = () => {
    return (
        <main>

            <ProductHero />
            <ProductSection/>
            <ProductCategories/>
            <TestimonialsSection />
            <ContactSection />
        </main>
    );
};

export default AboutPage;
