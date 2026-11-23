export interface ContinentData {
  name: string;
  bnName: string;
  countries: {
    name: string;
    bnName: string;
    code: string;
  }[];
}

export const CONTINENTS_AND_COUNTRIES: ContinentData[] = [
  {
    name: 'Asia',
    bnName: 'এশিয়া (Asia)',
    countries: [
      { name: 'Malaysia', bnName: 'মালয়েশিয়া (Malaysia)', code: 'MY' },
      { name: 'Saudi Arabia', bnName: 'সৌদি আরব (Saudi Arabia)', code: 'SA' },
      { name: 'United Arab Emirates (UAE)', bnName: 'সংযুক্ত আরব আমিরাত (UAE)', code: 'AE' },
      { name: 'Qatar', bnName: 'কাতার (Qatar)', code: 'QA' },
      { name: 'Kuwait', bnName: 'কুয়েত (Kuwait)', code: 'KW' },
      { name: 'Oman', bnName: 'ওমান (Oman)', code: 'OM' },
      { name: 'Singapore', bnName: 'সিঙ্গাপুর (Singapore)', code: 'SG' },
      { name: 'Japan', bnName: 'জাপান (Japan)', code: 'JP' },
      { name: 'South Korea', bnName: 'দক্ষিণ কোরিয়া (South Korea)', code: 'KR' },
      { name: 'Thailand', bnName: 'থাইল্যান্ড (Thailand)', code: 'TH' },
      { name: 'China', bnName: 'চীন (China)', code: 'CN' },
      { name: 'Turkey', bnName: 'তুরস্ক (Turkey)', code: 'TR' },
    ],
  },
  {
    name: 'Europe',
    bnName: 'ইউরোপ (Europe)',
    countries: [
      { name: 'Cyprus', bnName: 'সাইপ্রাস (Cyprus)', code: 'CY' },
      { name: 'Belarus', bnName: 'বেলারুশ (Belarus)', code: 'BY' },
      { name: 'United Kingdom (UK)', bnName: 'যুক্তরাজ্য (UK)', code: 'GB' },
      { name: 'Germany', bnName: 'জার্মানি (Germany)', code: 'DE' },
      { name: 'Italy', bnName: 'ইতালি (Italy)', code: 'IT' },
      { name: 'Portugal', bnName: 'পর্তুগাল (Portugal)', code: 'PT' },
      { name: 'Romania', bnName: 'রোমানিয়া (Romania)', code: 'RO' },
      { name: 'Poland', bnName: 'পোল্যান্ড (Poland)', code: 'PL' },
      { name: 'France', bnName: 'ফ্রান্স (France)', code: 'FR' },
      { name: 'Croatia', bnName: 'ক্রোয়েশিয়া (Croatia)', code: 'HR' },
      { name: 'Hungary', bnName: 'হাঙ্গেরি (Hungary)', code: 'HU' },
      { name: 'Malta', bnName: 'মাল্টা (Malta)', code: 'MT' },
      { name: 'Serbia', bnName: 'সার্বিয়া (Serbia)', code: 'RS' },
    ],
  },
  {
    name: 'North America',
    bnName: 'উত্তর আমেরিকা (North America)',
    countries: [
      { name: 'Canada', bnName: 'কানাডা (Canada)', code: 'CA' },
      { name: 'United States of America (USA)', bnName: 'যুক্তরাষ্ট্র (USA)', code: 'US' },
    ],
  },
  {
    name: 'Oceania',
    bnName: 'ওশেনিয়া (Oceania)',
    countries: [
      { name: 'Australia', bnName: 'অস্ট্রেলিয়া (Australia)', code: 'AU' },
      { name: 'New Zealand', bnName: 'নিউজিল্যান্ড (New Zealand)', code: 'NZ' },
    ],
  },
  {
    name: 'Other',
    bnName: 'অন্যান্য (Other Region)',
    countries: [
      { name: 'Other Country', bnName: 'অন্যান্য দেশ (Other)', code: 'OTHER' },
    ],
  },
];
