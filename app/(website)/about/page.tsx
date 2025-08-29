// app/about/page.tsx
import AboutSection from "@/components/home/about-section";
import AboutHero from "./aboutHero";
import WhyChooseSection from "./whyChoose";
import TentSection from "./tentSection";
import TestimonialsSection from "@/components/home/testimonial-section";
import ContactSection from "@/components/home/contactUs-section";
import TeamMembers from "@/components/home/team-section";

const AboutPage = () => {
    return (
        <main>
            
            <AboutHero />
            <AboutSection/>
            <TeamMembers />
            <WhyChooseSection/>
            <TentSection/>
            <TestimonialsSection/>
            <ContactSection/>
        </main>
    );
};

export default AboutPage;
