import { NextResponse } from 'next/server';
import { DEFAULT_GOLD_RATES } from '@/services/pricingEngine';

export async function POST(request: Request) {
  try {
    const { message, language = 'en', rates = DEFAULT_GOLD_RATES } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ reply: 'Please provide a question or inquiry.' }, { status: 400 });
    }

    const q = message.toLowerCase().trim();

    // Intelligence knowledge engine for Vardhaman Jewellers
    let reply = '';
    let quickActions: { label: string; url?: string; action?: string }[] = [];

    // Language detection or selection
    const isMarathi = language === 'mr' || /नमस्कार|सोनं|भाव|दुकान|पाटल्या|हार|लग्न|पवित्र|किंमत/i.test(q);
    const isHindi = language === 'hi' || /नमस्ते|सोना|भाव|दुकान|कंगन|हार|विवाह|शुद्धता|दाम/i.test(q);

    // 1. Live Gold Rate inquiries
    if (q.includes('rate') || q.includes('gold price') || q.includes('भाव') || q.includes('आजचा') || q.includes('rate today') || q.includes('22k') || q.includes('24k')) {
      if (isMarathi) {
        reply = `आजचा सराफा भाव (वर्धमान ज्वेलर्स - ${rates.effectiveTime}):
• २२ कॅरेट हॉलमार्क सोनं: ₹${rates.rate22K.toLocaleString('en-IN')}/ग्रॅम
• २४ कॅरेट शुद्ध सोनं: ₹${rates.rate24K.toLocaleString('en-IN')}/ग्रॅम
• १८ कॅरेट डायमंड ज्वेलरी: ₹${rates.rate18K.toLocaleString('en-IN')}/ग्रॅम
• शुद्ध चांदी: ₹${rates.rateSilver.toLocaleString('en-IN')}/ग्रॅम

आमचे सर्व दागिने १००% बीआयएस हॉलमार्क ९१६ प्रमाणित आहेत. आपल्याला दागिन्यांच्या खरेदीसाठी मदत हवी आहे का?`;
      } else if (isHindi) {
        reply = `आज का आधिकारिक सराफा भाव (वर्धमान ज्वेलर्स - ${rates.effectiveTime}):
• २२ कैरेट हॉलमार्क सोना: ₹${rates.rate22K.toLocaleString('en-IN')}/ग्राम
• २४ कैरेट शुद्ध सोना: ₹${rates.rate24K.toLocaleString('en-IN')}/ग्राम
• १८ कैरेट डायमंड आभूषण: ₹${rates.rate18K.toLocaleString('en-IN')}/ग्राम
• शुद्ध चांदी: ₹${rates.rateSilver.toLocaleString('en-IN')}/ग्राम

हमारे सभी आभूषण १००% बीआईएस हॉलमार्क प्रमाणित हैं।`;
      } else {
        reply = `Today's Official Bullion Benchmark Rates at Vardhaman Jewellers (${rates.effectiveTime}):
• 22K (916 BIS Hallmark): ₹${rates.rate22K.toLocaleString('en-IN')}/gram
• 24K (999 Pure Bullion): ₹${rates.rate24K.toLocaleString('en-IN')}/gram
• 18K (Diamond Jewellery): ₹${rates.rate18K.toLocaleString('en-IN')}/gram
• Sterling Silver: ₹${rates.rateSilver.toLocaleString('en-IN')}/gram

All gold jewellery at Vardhaman Jewellers carries Government BIS 916 hallmarking.`;
      }
      quickActions = [
        { label: 'View Full Rate Card', url: '/gold-rate' },
        { label: 'Calculate Exchange Value', url: '/sell-gold' },
      ];
    }
    // 2. Stores & Locations
    else if (q.includes('store') || q.includes('location') || q.includes('address') || q.includes('jalgaon') || q.includes('dhule') || q.includes('pune') || q.includes('mumbai') || q.includes('दुकान') || q.includes('पत्ता')) {
      if (isMarathi) {
        reply = `वर्धमान ज्वेलर्सची प्रमुख दालने:
१. जळगाव मुख्य दालन: एमजी रोड, गोलानी मार्केट जवळ, जळगाव (फोन: ०२५७-२२२४५८९)
२. धुळे दालन: आग्रा रोड, महानगरपालिकेसमोर, धुळे (फोन: ०२५६२-२३४११२)
३. पुणे दालन: स्वारगेट / लक्ष्मी रोड कॉर्नर, पुणे
४. मुंबई दालन: रानडे रोड, दादर (पश्चिम), मुंबई

सर्व दालनांमध्ये कॅरटमीटरने मोफत सोन्याची शुद्धता तपासणी व ब्रायडल लाउंज उपलब्ध आहे.`;
      } else if (isHindi) {
        reply = `वर्धमान ज्वेलर्स के प्रमुख स्टोर्स:
१. जलगांव मुख्य स्टोर: एमजी रोड, गोलानी मार्केट के पास, जलगांव
२. धुले स्टोर: आगरा रोड, नगर निगम के सामने, धुले
३. पुणे स्टोर: स्वारगेट / लक्ष्मी रोड, पुणे
४. मुंबई स्टोर: रानडे रोड, दादर पश्चिम, मुंबई

दुकान समय: सुबह १०:०० बजे से रात ८:३० बजे तक।`;
      } else {
        reply = `Vardhaman Jewellers Flagship Stores:
1. Jalgaon (Flagship): MG Road, near Golani Market (Ph: +91 257 222 4589)
2. Dhule: Agra Road, opp. Municipal Corporation (Ph: +91 2562 234 112)
3. Pune: Laxmi Road / Swargate Corner (Ph: +91 20 2445 8899)
4. Mumbai: Ranade Road, Dadar West (Ph: +91 22 2430 7744)

Store Timings: 10:00 AM to 8:30 PM (Open all 7 days with private bridal consultation lounges).`;
      }
      quickActions = [
        { label: 'Store Directions & Timings', url: '/stores' },
        { label: 'Book Store Appointment', url: '/book-appointment' },
      ];
    }
    // 3. Gold Exchange / Sell Gold
    else if (q.includes('exchange') || q.includes('sell') || q.includes('buyback') || q.includes('old gold') || q.includes('बदल') || q.includes('जुने') || q.includes('पुराना सोना')) {
      if (isMarathi) {
        reply = `वर्धमान ज्वेलर्सवर जुने सोने बदलून घेणे अत्यंत सोपे आणि १००% पारदर्शक आहे!
• आमच्याकडे अत्याधुनिक जर्मन कॅरटमीटर तंत्रज्ञानाने सोन्याची शुद्धता समोर तपासली जाते.
• आजच्या थेट सराफा दरानुसार त्वरित मूल्यांकनाचा अंदाज मिळतो.
• कोणत्याही दुकानाचे जुने सोने आपण नवीन हॉलमार्क दागिन्यांमध्ये बदलू शकता.`;
      } else {
        reply = `Vardhaman Jewellers offers an assured 100% transparent Gold Exchange & Buyback policy!
• Computerized Karatmeter testing in front of you.
• Evaluated against today's live bullion market rates.
• Exchange any ancestral or hallmarked jewellery with zero hidden deductions.`;
      }
      quickActions = [
        { label: 'Use Gold Valuation Calculator', url: '/sell-gold' },
        { label: 'Book Inspection Slot', url: '/book-appointment' },
      ];
    }
    // 4. Appointments & Bridal
    else if (q.includes('appointment') || q.includes('bridal') || q.includes('wedding') || q.includes('लग्न') || q.includes('भेट') || q.includes('विवाह')) {
      if (isMarathi) {
        reply = `लग्नबस्ता किंवा विशेष दागिन्यांसाठी आमच्या दालनात व्हीआयपी भेट निश्चित करा! आमचे डिझाईन तज्ज्ञ आपल्याला संपूर्ण ब्रायडल सेट, चोकर, पाटल्या आणि मंगळसूत्रांची खास निवड दाखवतील.`;
      } else {
        reply = `We would be honored to host you! You can book an exclusive VIP Bridal Consultation at any of our stores (Jalgaon, Dhule, Pune, Mumbai) to explore custom handcrafted trousseau collections with our senior jewellery master.`;
      }
      quickActions = [
        { label: 'Book Free Appointment', url: '/book-appointment' },
        { label: 'Explore Wedding Collection', url: '/wedding' },
      ];
    }
    // General fallback
    else {
      if (isMarathi) {
        reply = `वर्धमान ज्वेलर्सच्या साहाय्यक सेवेत आपले स्वागत आहे! मी आपल्याला सोन्याचा आजचा भाव, गळ्यातील हार, पाटल्या, मंगळसूत्र, दालनांची माहिती किंवा अपॉइंटमेंट बुकिंगमध्ये मदत करू शकतो. आपल्याला कोणत्या दागिन्यांविषयी जाणून घ्यायचे आहे?`;
      } else if (isHindi) {
        reply = `वर्धमान ज्वेलर्स सहायता सेवा में आपका स्वागत है! मैं आपको आज के सोने के भाव, हार, कंगन, मंगलसूत्र, स्टोर लोकेशन अथवा अपॉइंटमेंट बुकिंग में सहायता कर सकता हूँ।`;
      } else {
        reply = `Welcome to Vardhaman Jewellers Concierge! I can assist you with today's live gold rates, temple haars, certified diamond rings, store timings in Maharashtra, or booking an in-store appointment. How may I guide you today?`;
      }
      quickActions = [
        { label: 'Today’s Gold Rate', url: '/gold-rate' },
        { label: 'Wedding Collection', url: '/wedding' },
        { label: 'Talk on WhatsApp', url: 'https://wa.me/919822123456' },
      ];
    }

    return NextResponse.json({ reply, quickActions });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      {
        reply:
          'Welcome to Vardhaman Jewellers. For immediate concierge assistance, please connect with our jewellery specialist on WhatsApp at +91 98221 23456.',
      },
      { status: 500 }
    );
  }
}
