import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingCartIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  ChevronDownIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { logout } from '../store/authSlice';
import { selectCartCount } from '../store/cartSlice';
import { toggleDarkMode } from '../store/themeSlice';

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const darkMode = useSelector((s) => s.theme.darkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner' : '/dashboard';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [
    { to: '/restaurants', label: 'Restaurants' },
    { to: '/restaurants?featured=true', label: 'Offers' },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-md border-b border-gray-100/80 dark:border-gray-800/80'
            : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" aria-label="FoodExpress Home">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-orange transition-all duration-300">
                <span className="text-white font-black text-sm">F</span>
              </div>
              <span className="text-xl font-extrabold">
                <span className="text-orange-500">Food</span>
                <span className="text-gray-900 dark:text-white">Express</span>
              </span>
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-orange-500 bg-orange-50 dark:bg-orange-950 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900">
                <SparklesIcon className="w-3 h-3" /> AI
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    location.pathname === link.to.split('?')[0]
                      ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/50'
                      : 'text-gray-600 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Dark mode toggle */}
              <button
                onClick={() => dispatch(toggleDarkMode())}
                className="btn-icon"
                aria-label="Toggle dark mode"
                id="darkmode-toggle"
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>

              {/* Cart */}
              {user && (
                <Link
                  to="/cart"
                  className="relative btn-icon"
                  aria-label={`Cart with ${cartCount} items`}
                  id="cart-button"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black w-4.5 h-4.5 w-5 h-5 rounded-full flex items-center justify-center animate-bounce-in shadow-glow-sm">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    id="user-menu-button"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-[80px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDownIcon
                      className={`hidden sm:block w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 card-glass py-2 shadow-xl animate-slide-down">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                        <span className="badge-orange mt-1 capitalize">{user.role}</span>
                      </div>
                      <nav className="py-1">
                        <button
                          onClick={() => navigate(dashboardPath)}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors"
                        >
                          <UserCircleIcon className="w-4 h-4" />
                          My Dashboard
                        </button>
                        {user.role === 'customer' && (
                          <Link
                            to="/cart"
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors"
                          >
                            <ShoppingCartIcon className="w-4 h-4" />
                            My Cart
                            {cartCount > 0 && (
                              <span className="ml-auto badge-orange">{cartCount}</span>
                            )}
                          </Link>
                        )}
                      </nav>
                      <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => {
                            dispatch(logout());
                            navigate('/');
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          id="logout-button"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    id="login-link"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm py-2 px-4"
                    id="signup-link"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden btn-icon"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-slide-down shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-orange-500 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Login
                </Link>
              )}
              {user && (
                <button
                  onClick={() => { navigate(dashboardPath); setMobileOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  Dashboard
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
