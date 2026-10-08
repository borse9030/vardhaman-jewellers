export type Language = 'en' | 'mr' | 'hi';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    mr: string;
    hi: string;
  };
}

export const translations: TranslationDictionary = {
  // Brand & Taglines
  brandName: {
    en: 'Vardhaman Jewellers',
    mr: 'वर्धमान ज्वेलर्स',
    hi: 'वर्धमान ज्वेलर्स',
  },
  brandTagline: {
    en: 'Pure Gold. Pure Trust. Since 1984.',
    mr: 'अस्सल सोनं. अतूट विश्वास. १९८४ पासून.',
    hi: 'शुद्ध सोना। अटूट विश्वास। १९८४ से।',
  },

  // Navigation
  allJewellery: {
    en: 'All Jewellery',
    mr: 'सर्व दागिने',
    hi: 'सभी आभूषण',
  },
  gold: {
    en: 'Gold',
    mr: 'सोने (Gold)',
    hi: 'सोना (Gold)',
  },
  diamond: {
    en: 'Diamond',
    mr: 'हिरे (Diamond)',
    hi: 'हीरा (Diamond)',
  },
  silver: {
    en: 'Silver',
    mr: 'चांदी (Silver)',
    hi: 'चांदी (Silver)',
  },
  necklaces: {
    en: 'Necklaces',
    mr: 'गळ्यातील हार',
    hi: 'गले का हार',
  },
  earrings: {
    en: 'Earrings',
    mr: 'कानातले / झुमके',
    hi: 'झुमके / बालियां',
  },
  bangles: {
    en: 'Bangles & Kadas',
    mr: 'पाटल्या / बांगड्या',
    hi: 'कंगन / चूड़ियां',
  },
  rings: {
    en: 'Rings',
    mr: 'अंगठ्या',
    hi: 'अंगूठियां',
  },
  mangalsutra: {
    en: 'Mangalsutra',
    mr: 'मंगळसूत्र',
    hi: 'मंगलसूत्र',
  },
  pendants: {
    en: 'Pendants',
    mr: 'पेंडंट्स',
    hi: 'पेंडेंट',
  },
  chains: {
    en: 'Chains',
    mr: 'सोन्याची चेन',
    hi: 'सोने की चेन',
  },
  wedding: {
    en: 'Wedding Trousseau',
    mr: 'लग्नबस्ता विशेष',
    hi: 'विवाह संग्रह',
  },
  dailyWear: {
    en: 'Daily Wear',
    mr: 'नित्य वापराचे',
    hi: 'दैनिक उपयोग',
  },
  gifting: {
    en: 'Gifting',
    mr: 'भेटवस्तू',
    hi: 'उपहार संग्रह',
  },
  collections: {
    en: 'Collections',
    mr: 'विशेष संग्रह',
    hi: 'कलेक्शन',
  },
  goldRate: {
    en: 'Live Gold Rate',
    mr: 'थेट सोन्याचा भाव',
    hi: 'लाइव सोने का भाव',
  },
  sellGold: {
    en: 'Sell Your Gold',
    mr: 'जुने सोने बदला / विका',
    hi: 'पुराना सोना बेचें / बदलें',
  },
  stores: {
    en: 'Store Locator',
    mr: 'आमची दालने',
    hi: 'हमारे स्टोर्स',
  },
  bookAppointment: {
    en: 'Book Appointment',
    mr: 'भेट निश्चित करा',
    hi: 'अपॉइंटमेंट बुक करें',
  },

  // Header & Search
  searchPlaceholder: {
    en: 'Search for 22K Haar, Solitaires, Mangalsutra, Bangles...',
    mr: '२२ कॅरेट हार, मंगळसूत्र, पाटल्या किंवा हिरे शोधा...',
    hi: '२२ कैरेट हार, मंगलसूत्र, कंगन या हीरे खोजें...',
  },
  wishlist: {
    en: 'Wishlist',
    mr: 'आवडते दागिने',
    hi: 'पसंदीदा सूची',
  },
  cart: {
    en: 'Cart',
    mr: 'माझी पिशवी',
    hi: 'शॉपिंग बैग',
  },
  account: {
    en: 'Account',
    mr: 'माझे खाते',
    hi: 'मेरा खाता',
  },
  adminPortal: {
    en: 'Admin Portal',
    mr: 'प्रशासक पोर्टल',
    hi: 'व्यवस्थापक पोर्टल',
  },

  // Live Rate Strip
  rateUpdatedToday: {
    en: 'Official Bullion Rate • Updated today at',
    mr: 'अधिकृत सराफा भाव • आज अपडेट केले:',
    hi: 'आधिकारिक सराफा भाव • आज अपडेट हुआ:',
  },
  perGram: {
    en: '/gram',
    mr: '/ग्रॅम',
    hi: '/ग्राम',
  },

  // Product Cards & PLP
  addToCart: {
    en: 'Add to Cart',
    mr: 'पिशवीत टाका',
    hi: 'बैग में जोड़ें',
  },
  buyNow: {
    en: 'Buy Now',
    mr: 'आत्ताच खरेदी करा',
    hi: 'अभी खरीदें',
  },
  quickView: {
    en: 'Quick View',
    mr: 'झटपट पाहा',
    hi: 'जल्दी देखें',
  },
  enquireWhatsapp: {
    en: 'Enquire on WhatsApp',
    mr: 'व्हॉट्सअॅपवर विचारा',
    hi: 'व्हाट्सएप पर पूछें',
  },
  viewDetails: {
    en: 'View Details',
    mr: 'तपशील पाहा',
    hi: 'विवरण देखें',
  },
  inStock: {
    en: 'In Stock',
    mr: 'उपलब्ध आहे',
    hi: 'उपलब्ध है',
  },
  grossWeight: {
    en: 'Gross Weight',
    mr: 'एकूण वजन',
    hi: 'कुल वजन',
  },
  netWeight: {
    en: 'Net Gold Weight',
    mr: 'शुद्ध सोन्याचे वजन',
    hi: 'शुद्ध सोने का वजन',
  },
  purity: {
    en: 'Purity',
    mr: 'शुद्धता',
    hi: 'शुद्धता',
  },

  // Product Details Page
  priceBreakdown: {
    en: 'Transparent Price Breakdown',
    mr: 'पारदर्शक किंमत विश्लेषण',
    hi: 'पारदर्शी मूल्य विभाजन',
  },
  goldValue: {
    en: 'Gold Value',
    mr: 'सोन्याची किंमत',
    hi: 'सोने का मूल्य',
  },
  makingCharges: {
    en: 'Making Charges',
    mr: 'घडणावळ (Making)',
    hi: 'मेकिंग चार्ज',
  },
  wastage: {
    en: 'Wastage (Ghat)',
    mr: 'घट (Wastage)',
    hi: 'वेस्टेज (घाट)',
  },
  stoneCharges: {
    en: 'Stone & Diamond Charges',
    mr: 'खडे आणि हिऱ्यांची किंमत',
    hi: 'रत्न और हीरे का मूल्य',
  },
  gstTax: {
    en: 'GST (3% Indian Standard)',
    mr: 'जीएसटी (३% अधिकृत कर)',
    hi: 'जीएसटी (३% सरकारी कर)',
  },
  finalTotal: {
    en: 'Final Amount (Incl. All Taxes)',
    mr: 'एकूण अंतिम रक्कम (करांसहित)',
    hi: 'अंतिम राशि (सभी कर सहित)',
  },
  bisHallmarked: {
    en: '100% BIS Hallmarked (916 Pure Gold)',
    mr: '१००% बीआयएस हॉलमार्क प्रमाणित (९१६ सोनं)',
    hi: '१००% बीआईएस हॉलमार्क प्रमाणित (९१६ सोना)',
  },
  certifiedDiamonds: {
    en: 'IGI & SGL Certified Natural Diamonds',
    mr: 'आयजीआय आणि एसजीएल प्रमाणित अस्सल हिरे',
    hi: 'आईजीआई और एसजीएल प्रमाणित असली हीरे',
  },
  buybackGuarantee: {
    en: '100% Lifetime Exchange & Buyback Guarantee',
    mr: '१००% आजीवन बदल व परतफेड हमी',
    hi: '१००% आजीवन एक्सचेंज और बायबैक गारंटी',
  },
  insuredDelivery: {
    en: 'Tamper-Proof Insured Transit Delivery',
    mr: 'विमा उतरवलेली सुरक्षित व सीलबंद घरपोच सेवा',
    hi: 'बीमाकृत और सुरक्षित होम डिलीवरी',
  },

  // Checkout & Cart
  orderSummary: {
    en: 'Order Summary',
    mr: 'मागणीचा गोषवारा',
    hi: 'ऑर्डर सारांश',
  },
  applyCoupon: {
    en: 'Apply Coupon',
    mr: 'कूपन जोडा',
    hi: 'कूपन लागू करें',
  },
  proceedToCheckout: {
    en: 'Proceed to Secure Checkout',
    mr: 'खरेदी पूर्ण करण्यासाठी पुढे चला',
    hi: 'सुरक्षित चेकआउट पर जाएं',
  },
  homeDelivery: {
    en: 'Insured Home Delivery',
    mr: 'सुरक्षित घरपोच डिलिव्हरी',
    hi: 'बीमाकृत होम डिलीवरी',
  },
  storePickup: {
    en: 'Store Pickup',
    mr: 'दालनातून स्वतः घ्या',
    hi: 'स्टोर से पिकअप करें',
  },
  assistedPurchase: {
    en: 'Assisted High-Value Purchase (Speak to Specialist)',
    mr: 'तज्ज्ञांच्या मदतीने खरेदी (कॉल बॅक विनंती)',
    hi: 'विशेषज्ञ सहायता से खरीद (कॉल बैक अनुरोध)',
  },

  // Chatbot
  chatGreeting: {
    en: 'Welcome to Vardhaman Jewellers! How may I assist you with your jewellery selection today?',
    mr: 'नमस्कार! वर्धमान ज्वेलर्समध्ये आपले सहर्ष स्वागत आहे. आज मी आपल्याला दागिन्यांच्या निवडीत कशी मदत करू शकतो?',
    hi: 'नमस्ते! वर्धमान ज्वेलर्स में आपका स्वागत है। मैं आज आपके आभूषण चयन में किस प्रकार सहायता कर सकता हूँ?',
  },
};

export function getTranslation(key: string, lang: Language): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  if (translations[key] && translations[key].en) {
    return translations[key].en;
  }
  return key;
}
