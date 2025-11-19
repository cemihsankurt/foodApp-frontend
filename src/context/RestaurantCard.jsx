import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Ana sayfada listelenen tek bir restoran kartını temsil eder.
 * @param {object} restaurant - RestaurantCardDto'dan gelen veri
 */
function RestaurantCard({ restaurant }) {
    
    
    
    return (
        <Link 
            to={`/restaurants/${restaurant.id}`} 
            className="block h-full transition transform hover:scale-[1.02] hover:shadow-xl rounded-lg overflow-hidden border border-gray-200"
        >

            {/* İçerik */}
            <div className="p-4 bg-white">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{restaurant.name}</h3>
                <div className="flex items-center justify-between text-sm">
                </div>
            </div>
        </Link>
    );
}

export default RestaurantCard;