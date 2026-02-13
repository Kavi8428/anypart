"use client"

import React from "react"
import Link from "next/link"

export function BuyerFooter() {
    return (
        <footer className="bg-[#0b121f] text-gray-400 py-12 pb-32 sm:pb-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Logo & Description */}
                    <div className="col-span-1">
                        <Link href="/buyer" className="flex items-center mb-4">
                            <span className="text-2xl font-bold text-white tracking-tight">anypart</span>
                            <span className="text-2xl font-bold text-primary">.lk</span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs">
                            Your trusted marketplace for quality auto parts across Sri Lanka.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link href="/seller/" className="hover:text-primary transition-colors">Sell on anypart.lk</Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Support</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link>
                            </li>
                            <li>
                                <Link href="/returns" className="hover:text-primary transition-colors">Returns</Link>
                            </li>
                            <li>
                                <Link href="/warranty" className="hover:text-primary transition-colors">Warranty</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Contact</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <span className="block text-gray-500 mb-0.5">Email:</span>
                                <a href="mailto:support@anypart.lk" className="text-gray-300 hover:text-primary transition-colors">support@anypart.lk</a>
                            </li>
                            <li>
                                <span className="block text-gray-500 mb-0.5">Phone:</span>
                                <a href="tel:+94771234567" className="text-gray-300 hover:text-primary transition-colors">+94 77 123 4567</a>
                            </li>
                            <li>
                                <span className="block text-gray-500 mb-0.5">Address:</span>
                                <span className="text-gray-300">Colombo, Sri Lanka</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800 flex flex-col items-center justify-center">
                    <p className="text-xs text-gray-500">
                        © 2024 anypart.lk. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
