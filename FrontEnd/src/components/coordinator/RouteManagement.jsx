// src/components/coordinator/RouteManagement.jsx
import React, { useEffect, useState } from 'react';
import { routeAPI } from '../../utils/api';

const CoordinatorRouteManagement = ({ language = 'hi' }) => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [error, setError] = useState('');

    const translations = {
        en: {
            addRoute: 'Add Route',
            editRoute: 'Edit Route',
            routeName: 'Route Name',
            startingPoint: 'Starting Point',
            routeDetails: 'Route Details (e.g., Point A → Point B → Point C)',
            save: 'Save',
            update: 'Update',
            cancel: 'Cancel',
            routes: 'Routes',
            loading: 'Loading…',
            edit: 'Edit',
            delete: 'Delete',
            noRoutes: 'No routes found.',
            deleteConfirm: 'Delete this route?',
            failedToLoad: 'Failed to load routes',
            failedToDelete: 'Failed to delete route',
            failedToSave: 'Failed to save route',
            startingPointLabel: 'Starting Point',
            routeDetailsLabel: 'Route Details'
        },
        hi: {
            addRoute: 'मार्ग जोड़ें',
            editRoute: 'मार्ग संपादित करें',
            routeName: 'मार्ग का नाम',
            startingPoint: 'शुरुआती बिंदु',
            routeDetails: 'मार्ग विवरण (जैसे, बिंदु अ → बिंदु आ → बिंदु इ)',
            save: 'सेव करें',
            update: 'अपडेट करें',
            cancel: 'रद्द करें',
            routes: 'मार्ग',
            loading: 'लोड हो रहा है…',
            edit: 'संपादित करें',
            delete: 'हटाएं',
            noRoutes: 'कोई मार्ग नहीं मिला।',
            deleteConfirm: 'इस मार्ग को हटाना है?',
            failedToLoad: 'मार्ग लोड करने में विफल',
            failedToDelete: 'मार्ग हटाने में विफल',
            failedToSave: 'मार्ग सेव करने में विफल',
            startingPointLabel: 'शुरुआती बिंदु',
            routeDetailsLabel: 'मार्ग विवरण'
        }
    };

    const t = translations[language];

    const emptyForm = {
        name: '',
        startingPoint: '',
        routeDetails: '',
    };
    const [form, setForm] = useState(emptyForm);

    const loadRoutes = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await routeAPI.getAllRoutes();
            if (res.data.success) {
                setRoutes(res.data.data);
            }
        } catch (err) {
            setError(t.failedToLoad);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to translate route names
    const translateRouteName = (routeName) => {
        if (language === 'hi') {
            const routeTranslations = {
                'Route A - City Center': 'मार्ग अ - शहर केंद्र',
                'Route B - Industrial Area': 'मार्ग ब - औद्योगिक क्षेत्र',
                'Route C - Residential': 'मार्ग स - आवासीय',
                'Route D - Highway': 'मार्ग द - राजमार्ग',
                'Route E - University': 'मार्ग ई - विश्वविद्यालय',
                'Route F - Hospital': 'मार्ग उ - अस्पताल',
                'City Center': 'शहर केंद्र',
                'Industrial Area': 'औद्योगिक क्षेत्र',
                'Residential': 'आवासीय',
                'Highway': 'राजमार्ग',
                'University': 'विश्वविद्यालय',
                'Hospital': 'अस्पताल',
                'Purana Kesla': 'पुराना केसला',
                'Tekari Bus Stand': 'टेकारी बस स्टैंड',
                'Main Campus': 'मुख्य कैंपस',
                'New Campus': 'नया कैंपस',
                'Medical College': 'मेडिकल कॉलेज',
                'Engineering College': 'इंजीनियरिंग कॉलेज',
                'Arts College': 'कला महाविद्यालय',
                'Commerce College': 'वाणिज्य महाविद्यालय',
                'Science College': 'विज्ञान महाविद्यालय',
                'Law College': 'विधि महाविद्यालय',
                'Management College': 'प्रबंधन महाविद्यालय',
                'Pharmacy College': 'फार्मेसी कॉलेज',
                'Nursing College': 'नर्सिंग कॉलेज',
                'Teacher Training College': 'शिक्षक प्रशिक्षण महाविद्यालय'
            };
            return routeTranslations[routeName] || routeName;
        }
        return routeName;
    };

    // Helper function to translate route details
    const translateRouteDetails = (routeDetails) => {
        if (language === 'hi' && routeDetails) {
            const detailTranslations = {
                'Railway Station': 'रेलवे स्टेशन',
                'Bus Stand': 'बस स्टैंड',
                'College Campus': 'कॉलेज कैंपस',
                'Main Gate': 'मुख्य गेट',
                'City Mall': 'सिटी मॉल',
                'Hospital': 'अस्पताल',
                'Tech Park': 'टेक पार्क',
                'Market': 'बाजार',
                'Green Valley': 'ग्रीन वैली',
                'Sunrise Apartments': 'सनराइज अपार्टमेंट्स',
                'School Junction': 'स्कूल जंक्शन',
                'Temple Road': 'मंदिर रोड',
                'Highway Toll Plaza': 'हाईवे टोल प्लाजा',
                'Petrol Pump': 'पेट्रोल पंप',
                'Village Turn': 'गांव मोड़',
                'Industrial Estate': 'औद्योगिक एस्टेट',
                'Kota Park': 'कोटा पार्क',
                'Point A': 'बिंदु अ',
                'Point B': 'बिंदु आ',
                'Point C': 'बिंदु इ',
                'Point D': 'बिंदु ई',
                'Point E': 'बिंदु उ',
                'Stop 1': 'स्टॉप १',
                'Stop 2': 'स्टॉप २',
                'Stop 3': 'स्टॉप ३',
                'Stop 4': 'स्टॉप ४',
                'Stop 5': 'स्टॉप ५',
                'Central Square': 'केंद्रीय चौक',
                'University': 'विश्वविद्यालय',
                'Shopping Complex': 'शॉपिंग कॉम्प्लेक्स',
                'Government Office': 'सरकारी कार्यालय',
                'Police Station': 'पुलिस स्टेशन',
                'Fire Station': 'अग्निशमन केंद्र',
                'Post Office': 'डाकघर',
                'Bank': 'बैंक',
                'ATM': 'एटीएम',
                'Pharmacy': 'दवाखाना',
                'Restaurant': 'रेस्टोरेंट',
                'Hotel': 'होटल',
                'Park': 'पार्क',
                'Stadium': 'स्टेडियम',
                'Library': 'पुस्तकालय',
                'Cinema Hall': 'सिनेमा हॉल',
                'Metro Station': 'मेट्रो स्टेशन',
                'Airport': 'हवाई अड्डा',
                'Bridge': 'पुल',
                'Flyover': 'फ्लाईओवर',
                'Underpass': 'अंडरपास',
                'Traffic Signal': 'ट्रैफिक सिग्नल',
                'Roundabout': 'गोल चक्कर',
                'Junction': 'जंक्शन',
                'Crossing': 'क्रॉसिंग',
                'Turn': 'मोड़',
                'Left': 'बाएं',
                'Right': 'दाएं',
                'Straight': 'सीधे',
                'North': 'उत्तर',
                'South': 'दक्षिण',
                'East': 'पूर्व',
                'West': 'पश्चिम'
            };
            
            let translatedDetails = routeDetails;
            Object.keys(detailTranslations).forEach(english => {
                const hindi = detailTranslations[english];
                translatedDetails = translatedDetails.replace(new RegExp(english, 'gi'), hindi);
            });
            
            // Replace arrow symbols and common route patterns
            translatedDetails = translatedDetails.replace(/→/g, ' → ');
            translatedDetails = translatedDetails.replace(/to/gi, 'से');
            translatedDetails = translatedDetails.replace(/from/gi, 'से');
            translatedDetails = translatedDetails.replace(/via/gi, 'होकर');
            translatedDetails = translatedDetails.replace(/through/gi, 'के माध्यम से');
            
            return translatedDetails;
        }
        return routeDetails;
    };

    useEffect(() => {
        loadRoutes();
    }, []);

    const handleEdit = (route) => {
        setEditingRoute(route);
        setForm({
            name: route.name || '',
            startingPoint: route.startingPoint || '',
            routeDetails: route.routeDetails || '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t.deleteConfirm)) return;
        try {
            await routeAPI.deleteRoute(id);
            loadRoutes();
        } catch (err) {
            setError(t.failedToDelete);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const payload = {
            name: form.name,
            startingPoint: form.startingPoint,
            routeDetails: form.routeDetails,
        };
        try {
            if (editingRoute) {
                await routeAPI.updateRoute(editingRoute._id, payload);
            } else {
                await routeAPI.createRoute(payload);
            }
            setEditingRoute(null);
            setForm(emptyForm);
            loadRoutes();
        } catch (err) {
            setError(err.response?.data?.message || t.failedToSave);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    {editingRoute ? t.editRoute : t.addRoute}
                </h2>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        className="w-full border rounded px-3 py-2"
                        placeholder={t.routeName}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <input
                        className="w-full border rounded px-3 py-2"
                        placeholder={t.startingPoint}
                        value={form.startingPoint}
                        onChange={(e) => setForm({ ...form, startingPoint: e.target.value })}
                        required
                    />
                    <textarea
                        className="w-full border rounded px-3 py-2"
                        placeholder={t.routeDetails}
                        value={form.routeDetails}
                        onChange={(e) => setForm({ ...form, routeDetails: e.target.value })}
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {editingRoute ? t.update : t.save}
                        </button>
                        {editingRoute && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingRoute(null);
                                    setForm(emptyForm);
                                }}
                                className="border px-4 py-2 rounded"
                            >
                                {t.cancel}
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold mb-4">
                    {t.routes} {loading && <span className="text-sm text-gray-500">{t.loading}</span>}
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {routes.map((route) => (
                        <div
                            key={route._id}
                            className="border rounded p-3 flex justify-between items-start"
                        >
                            <div>
                                <p className="font-semibold">{translateRouteName(route.name)}</p>
                                <p className="text-sm text-gray-600">
                                    {t.startingPointLabel}: {translateRouteDetails(route.startingPoint)}
                                </p>
                                {route.routeDetails && (
                                    <p className="text-xs text-gray-500">
                                        {t.routeDetailsLabel}: {translateRouteDetails(route.routeDetails)}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="text-blue-600 text-sm"
                                    onClick={() => handleEdit(route)}
                                >
                                    {t.edit}
                                </button>
                                <button
                                    className="text-red-600 text-sm"
                                    onClick={() => handleDelete(route._id)}
                                >
                                    {t.delete}
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && routes.length === 0 && (
                        <p className="text-gray-500 text-sm">{t.noRoutes}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoordinatorRouteManagement;
