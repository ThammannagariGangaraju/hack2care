/**
 * Translation helper and placeholder map for multilingual support.
 * In a production app, this would be replaced or augmented by an i18n library.
 */

export const translations: Record<string, Record<string, string>> = {
  en: {
    "app.title": "HACK2CARE",
    "home.welcome": "Emergency First Aid Assistant",
    "home.report_accident": "Report Accident",
    "home.detecting_language": "Detecting your language...",
    "decision.conscious": "Is the person conscious?",
    "decision.breathing": "Are they breathing normally?",
    "decision.bleeding": "Is there heavy bleeding?",
    "results.title": "First Aid Instructions",
    "common.yes": "Yes",
    "common.no": "No",
    "common.back": "Back",
    "common.restart": "Restart"
  },
  hi: {
    "app.title": "HACK2CARE",
    "home.welcome": "आपातकालीन प्राथमिक चिकित्सा सहायक",
    "home.report_accident": "दुर्घटना की रिपोर्ट करें",
    "home.detecting_language": "आपकी भाषा का पता लगाया जा रहा है...",
    "decision.conscious": "क्या व्यक्ति सचेत है?",
    "decision.breathing": "क्या वे सामान्य रूप से सांस ले रहे हैं?",
    "decision.bleeding": "क्या भारी रक्तस्राव हो रहा है?",
    "results.title": "प्राथमिक चिकित्सा निर्देश",
    "common.yes": "हाँ",
    "common.no": "नहीं",
    "common.back": "पीछे",
    "common.restart": "पुनः आरंभ करें"
  },
  te: {
    "app.title": "HACK2CARE",
    "home.welcome": "అవసరమైన ప్రథమ చికిత్స సహాయకుడు",
    "home.report_accident": "ప్రమాదాన్ని నివేదించండి",
    "home.detecting_language": "మీ భాషను గుర్తిస్తున్నాము...",
    "decision.conscious": "వ్యక్తి స్పృహలో ఉన్నారా?",
    "decision.breathing": "వారు సాధారణంగా శ్వాస తీసుకుంటున్నారా?",
    "decision.bleeding": "భారీ రక్తస్రావం జరుగుతోందా?",
    "results.title": "ప్రథమ చికిత్స సూచనలు",
    "common.yes": "అవును",
    "common.no": "కాదు",
    "common.back": "వెనుకకు",
    "common.restart": "మళ్ళీ ప్రారంభించండి"
  }
};

/**
 * Hook or function to get translated string based on current language.
 */
export function translate(key: string, lang: string): string {
  const langTranslations = translations[lang] || translations['en'];
  return langTranslations[key] || translations['en'][key] || key;
}
