
import CareerHero from "./careerHero";
import TestimonialsSection from "@/components/home/testimonial-section";
import JobsCard from "./jobsCard";
import ContactSection from "@/components/home/contactUs-section";


const AboutPage = () => {
    return (
        <main>

            <CareerHero />
            <JobsCard/>
            <TestimonialsSection />
            <ContactSection />
        </main>
    );
};

export default AboutPage;
