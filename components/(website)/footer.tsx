'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    MapPin,
    Phone,
    Mail,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { t } = useLanguage();

    const quickLinks = [
        { name: t('footer.links.home'), href: '/' },
        { name: t('footer.links.services'), href: '/services' },
        { name: t('footer.links.about'), href: '/about' },
        { name: t('footer.links.careers'), href: '/careers' },
        { name: t('footer.links.contact'), href: '/contact' },
    ];

    const services = [
        t('footer.services.tents'),
        t('footer.services.light'),
        t('footer.services.fabrics'),
    ];

    const socialLinks = [
        { icon: Facebook, href: 'https://www.facebook.com/share/19fsS4g9M6/', name: 'Facebook' },
        { icon: Twitter, href: 'https://x.com/Parveen75582498?t=TlBHbDj5jrjhWbR3IptL0Q&s=09', name: 'Twitter' },
        { icon: Instagram, href: 'https://www.instagram.com/halleverindia_official', name: 'Instagram' },
        {
            icon: Linkedin, href: 'https://www.linkedin.com/in/hallever-india-4a23b2373', name: 'LinkedIn'
        },
        { icon: Youtube, href: 'https://www.youtube.com/@HALLEVERINDIA', name: 'Youtube' },
    ];

    return (
        <footer className="bg-[#f2f2f2] border-t border-border text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Content */}
                <div className="py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200">

                        {/* Company Info */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
                            <h2 className="text-2xl font-bold text-red-500">Hallever India Pvt. Ltd.</h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {t('footer.description')}
                            </p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <MapPin className="h-4 w-4 text-red-500" />
                                    <span>{t('footer.address')}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <Phone className="h-4 w-4 text-red-500" />
                                    <span>+91 9468909306</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <Mail className="h-4 w-4 text-red-500" />
                                    <span>info@hallever.com</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-4">
                            <h3 className="text-lg font-semibold">{t('footer.quickLinks')}</h3>
                            <ul className="space-y-2">
                                {quickLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-gray-600 hover:text-red-500 transition-all text-sm">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Services & Policies */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="space-y-4">
                            <h3 className="text-lg font-semibold">{t('footer.ourServices')}</h3>
                            <ul className="space-y-2">
                                {services.map((service) => (
                                    <li key={service} className="text-sm text-gray-600">
                                        {service}
                                    </li>
                                ))}
                            </ul>
                            {/* Policies Section */}
                            <div className="mt-6 space-y-2">
                                <h3 className="text-lg font-semibold">{t('footer.policies')}</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <Link href="/t&c" className="text-gray-600 hover:text-red-500 transition-all text-sm">
                                            {t('footer.terms')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/privacy" className="text-gray-600 hover:text-red-500 transition-all text-sm">
                                            {t('footer.privacy')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/return-policy" className="text-gray-600 hover:text-red-500 transition-all text-sm">
                                            {t('footer.return')}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>


                        {/* Social Links */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="space-y-4">
                            <div className="pt-4">
                                <p className="text-sm font-medium mb-3">{t('footer.followUs')}</p>
                                <div className="flex space-x-3">
                                    {socialLinks.map((social) => (
                                        <motion.a
                                            key={social.name}
                                            target="_blank"
                                            href={social.href}
                                            whileHover={{ scale: 1.1 }}
                                            className="p-2 bg-white rounded-md hover:bg-red-500 hover:text-white transition-all"
                                            aria-label={social.name}
                                        >
                                            <social.icon className="h-4 w-4" />
                                        </motion.a>
                                    ))}
                                </div>

                                {/* Office Addresses */}
                                <div className="space-y-2 text-xs text-gray-600 mt-4">
                                    <p>
                                        <strong>{t("footer.officeAddress.head")}:</strong> {t("footer.officeAddress.headValue")}
                                    </p>
                                    <p>
                                        <strong>{t("footer.officeAddress.agency1")}:</strong> {t("footer.officeAddress.agency1Value")}
                                    </p>
                                    <p>
                                        <strong>{t("footer.officeAddress.agency2")}:</strong> {t("footer.officeAddress.agency2Value")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Map */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="py-8 border-t border-border">
                    <div className="rounded-lg overflow-hidden shadow-md">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3532.3553427094566!2d76.21771987546735!3d27.706312876183084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDQyJzIyLjciTiA3NsKwMTMnMTMuMSJF!5e0!3m2!1sen!2sin!4v1753356035489!5m2!1sen!2sin"
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Hallever Location"
                        />
                    </div>
                </motion.div>

                {/* Copyright */}
                <div className="py-6 border-t border-border text-center">
                    <p className="text-sm text-gray-600">
                        © {currentYear} Hallever India Pvt. Ltd. {t('footer.rights')}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
