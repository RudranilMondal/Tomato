// PIN Code Auto-Detection Utility for Tomattto Rider Onboarding
// IMPORTANT: Detects State and District ONLY.
// NEVER auto-populates City/Town (kept completely independent and empty for manual entry/selection).

import { INDIA_STATES_AND_UTS, getDistricts, getStateNames } from '../data/indiaLocations';

export interface PincodeLookupResult {
  state: string;
  district?: string;
}

// State Name Normalization
const STATE_ALIAS_MAP: Record<string, string> = {
  'delhi': 'Delhi',
  'new delhi': 'Delhi',
  'national capital territory of delhi': 'Delhi',
  'nct of delhi': 'Delhi',
  'pondicherry': 'Puducherry',
  'orissa': 'Odisha',
  'jammu & kashmir': 'Jammu and Kashmir',
  'andaman & nicobar islands': 'Andaman and Nicobar Islands',
  'andaman & nicobar': 'Andaman and Nicobar Islands',
  'dadra & nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'uttaranchal': 'Uttarakhand',
  'chhatisgarh': 'Chhattisgarh',
  'telengana': 'Telangana'
};

// District Name Normalization & Common Postal Aliases
const DISTRICT_ALIAS_MAP: Record<string, string> = {
  // Karnataka
  'bangalore': 'Bengaluru Urban',
  'bangalore urban': 'Bengaluru Urban',
  'bengaluru': 'Bengaluru Urban',
  'bangalore rural': 'Bengaluru Rural',
  'bengaluru rural': 'Bengaluru Rural',
  'belgaum': 'Belagavi',
  'bellary': 'Ballari',
  'gulbarga': 'Kalaburagi',
  'bijapur': 'Vijayapura',
  'mysore': 'Mysuru',
  'shimoga': 'Shivamogga',
  'chikmagalur': 'Chikkamagaluru',
  'mangalore': 'Dakshina Kannada',
  'south canara': 'Dakshina Kannada',
  'north canara': 'Uttara Kannada',

  // Maharashtra
  'bombay': 'Mumbai City',
  'mumbai': 'Mumbai City',
  'greater bombay': 'Mumbai Suburban',
  'mumbai suburban': 'Mumbai Suburban',
  'ahmednagar': 'Ahilyanagar (Ahmednagar)',
  'ahilyanagar': 'Ahilyanagar (Ahmednagar)',
  'aurangabad': 'Chhatrapati Sambhajinagar (Aurangabad)',
  'chhatrapati sambhajinagar': 'Chhatrapati Sambhajinagar (Aurangabad)',
  'osmanabad': 'Dharashiv (Osmanabad)',
  'dharashiv': 'Dharashiv (Osmanabad)',

  // Uttar Pradesh
  'allahabad': 'Prayagraj',
  'faizabad': 'Ayodhya',
  'hoshangabad': 'Narmadapuram',
  'kashi': 'Varanasi',
  'kanpur': 'Kanpur Nagar',
  'noida': 'Gautam Buddha Nagar',
  'greater noida': 'Gautam Buddha Nagar',

  // Punjab & Haryana
  'mohali': 'Sahibzada Ajit Singh Nagar (Mohali)',
  'sas nagar': 'Sahibzada Ajit Singh Nagar (Mohali)',
  'sahibzada ajit singh nagar': 'Sahibzada Ajit Singh Nagar (Mohali)',
  'nawanshahr': 'Shahid Bhagat Singh Nagar',
  'nawashahr': 'Shahid Bhagat Singh Nagar',
  'muktsar': 'Sri Muktsar Sahib',
  'ferozepur': 'Firozpur',
  'ropar': 'Rupnagar',
  'gurgaon': 'Gurugram',

  // West Bengal
  'calcutta': 'Kolkata',
  'asansol': 'Paschim Bardhaman',
  'durgapur': 'Paschim Bardhaman',
  'siliguri': 'Darjeeling',

  // Tamil Nadu
  'madras': 'Chennai',
  'trichy': 'Tiruchirappalli',
  'tiruchirapalli': 'Tiruchirappalli',
  'kancheepuram': 'Kanchipuram',
  'ooty': 'Nilgiris',
  'tanjore': 'Thanjavur',
  'tuticorin': 'Thoothukudi',

  // Andhra Pradesh & Telangana
  'vijayawada': 'NTR',
  'vizag': 'Visakhapatnam',
  'kadapa': 'YSR Kadapa',
  'secunderabad': 'Hyderabad',

  // Kerala
  'trivandrum': 'Thiruvananthapuram',
  'cochin': 'Ernakulam',
  'calicut': 'Kozhikode',
  'alleppey': 'Alappuzha',
  'quilon': 'Kollam',
  'cannanore': 'Kannur',
  'palghat': 'Palakkad'
};

// Comprehensive Offline Prefix-to-Location Directory (Fast fallback & offline support)
// Ambiguous 3-digit prefixes omit 'district' to prevent false guesses
const OFFLINE_PIN_PREFIX_MAP: Record<string, { state: string; district?: string }> = {
  // Delhi (110 spans all 11 Delhi revenue districts; individual PINs override)
  '110': { state: 'Delhi' },

  // Haryana
  '121': { state: 'Haryana', district: 'Faridabad' },
  '122': { state: 'Haryana', district: 'Gurugram' },
  '123': { state: 'Haryana', district: 'Rewari' },
  '124': { state: 'Haryana', district: 'Rohtak' },
  '125': { state: 'Haryana', district: 'Hisar' },
  '126': { state: 'Haryana', district: 'Jind' },
  '127': { state: 'Haryana', district: 'Bhiwani' },
  '131': { state: 'Haryana', district: 'Sonipat' },
  '132': { state: 'Haryana', district: 'Panipat' },
  '133': { state: 'Haryana', district: 'Ambala' },
  '134': { state: 'Haryana', district: 'Panchkula' },
  '135': { state: 'Haryana', district: 'Yamunanagar' },
  '136': { state: 'Haryana', district: 'Kurukshetra' },

  // Punjab & Chandigarh
  '140': { state: 'Punjab', district: 'Sahibzada Ajit Singh Nagar (Mohali)' },
  '141': { state: 'Punjab', district: 'Ludhiana' },
  '142': { state: 'Punjab', district: 'Moga' },
  '143': { state: 'Punjab', district: 'Amritsar' },
  '144': { state: 'Punjab', district: 'Jalandhar' },
  '145': { state: 'Punjab', district: 'Pathankot' },
  '146': { state: 'Punjab', district: 'Hoshiarpur' },
  '147': { state: 'Punjab', district: 'Patiala' },
  '148': { state: 'Punjab', district: 'Sangrur' },
  '151': { state: 'Punjab', district: 'Bathinda' },
  '152': { state: 'Punjab', district: 'Firozpur' },
  '160': { state: 'Chandigarh', district: 'Chandigarh' },

  // Himachal Pradesh
  '171': { state: 'Himachal Pradesh', district: 'Shimla' },
  '172': { state: 'Himachal Pradesh', district: 'Kinnaur' },
  '173': { state: 'Himachal Pradesh', district: 'Solan' },
  '174': { state: 'Himachal Pradesh', district: 'Bilaspur' },
  '175': { state: 'Himachal Pradesh', district: 'Mandi' },
  '176': { state: 'Himachal Pradesh', district: 'Kangra' },
  '177': { state: 'Himachal Pradesh', district: 'Hamirpur' },

  // Jammu & Kashmir and Ladakh
  '180': { state: 'Jammu and Kashmir', district: 'Jammu' },
  '181': { state: 'Jammu and Kashmir', district: 'Samba' },
  '182': { state: 'Jammu and Kashmir', district: 'Udhampur' },
  '184': { state: 'Jammu and Kashmir', district: 'Kathua' },
  '185': { state: 'Jammu and Kashmir', district: 'Rajouri' },
  '190': { state: 'Jammu and Kashmir', district: 'Srinagar' },
  '191': { state: 'Jammu and Kashmir', district: 'Ganderbal' },
  '192': { state: 'Jammu and Kashmir', district: 'Anantnag' },
  '193': { state: 'Jammu and Kashmir', district: 'Baramulla' },
  '194': { state: 'Ladakh', district: 'Leh' },

  // Uttar Pradesh & Uttarakhand
  '201': { state: 'Uttar Pradesh' }, // Spans Ghaziabad, Gautam Buddha Nagar, Hapur
  '202': { state: 'Uttar Pradesh', district: 'Aligarh' },
  '203': { state: 'Uttar Pradesh', district: 'Bulandshahr' },
  '204': { state: 'Uttar Pradesh', district: 'Hathras' },
  '205': { state: 'Uttar Pradesh', district: 'Mainpuri' },
  '206': { state: 'Uttar Pradesh', district: 'Etawah' },
  '208': { state: 'Uttar Pradesh', district: 'Kanpur Nagar' },
  '209': { state: 'Uttar Pradesh', district: 'Kanpur Dehat' },
  '211': { state: 'Uttar Pradesh', district: 'Prayagraj' },
  '221': { state: 'Uttar Pradesh', district: 'Varanasi' },
  '224': { state: 'Uttar Pradesh', district: 'Ayodhya' },
  '226': { state: 'Uttar Pradesh', district: 'Lucknow' },
  '243': { state: 'Uttar Pradesh', district: 'Bareilly' },
  '244': { state: 'Uttar Pradesh', district: 'Moradabad' },
  '247': { state: 'Uttar Pradesh', district: 'Saharanpur' },
  '248': { state: 'Uttarakhand', district: 'Dehradun' },
  '249': { state: 'Uttarakhand', district: 'Haridwar' },
  '263': { state: 'Uttarakhand', district: 'Nainital' },
  '282': { state: 'Uttar Pradesh', district: 'Agra' },

  // Rajasthan
  '301': { state: 'Rajasthan', district: 'Alwar' },
  '302': { state: 'Rajasthan', district: 'Jaipur' },
  '303': { state: 'Rajasthan', district: 'Jaipur Rural' },
  '305': { state: 'Rajasthan', district: 'Ajmer' },
  '311': { state: 'Rajasthan', district: 'Bhilwara' },
  '312': { state: 'Rajasthan', district: 'Chittorgarh' },
  '313': { state: 'Rajasthan', district: 'Udaipur' },
  '321': { state: 'Rajasthan', district: 'Bharatpur' },
  '324': { state: 'Rajasthan', district: 'Kota' },
  '331': { state: 'Rajasthan', district: 'Churu' },
  '332': { state: 'Rajasthan', district: 'Sikar' },
  '334': { state: 'Rajasthan', district: 'Bikaner' },
  '335': { state: 'Rajasthan', district: 'Sri Ganganagar' },
  '342': { state: 'Rajasthan', district: 'Jodhpur' },

  // Gujarat
  '360': { state: 'Gujarat', district: 'Rajkot' },
  '361': { state: 'Gujarat', district: 'Jamnagar' },
  '362': { state: 'Gujarat', district: 'Junagadh' },
  '364': { state: 'Gujarat', district: 'Bhavnagar' },
  '370': { state: 'Gujarat', district: 'Kutch' },
  '380': { state: 'Gujarat', district: 'Ahmedabad' },
  '382': { state: 'Gujarat', district: 'Gandhinagar' },
  '384': { state: 'Gujarat', district: 'Mehsana' },
  '388': { state: 'Gujarat', district: 'Anand' },
  '390': { state: 'Gujarat', district: 'Vadodara' },
  '392': { state: 'Gujarat', district: 'Bharuch' },
  '395': { state: 'Gujarat', district: 'Surat' },
  '396': { state: 'Gujarat', district: 'Valsad' },

  // Maharashtra & Goa
  '400': { state: 'Maharashtra', district: 'Mumbai City' },
  '401': { state: 'Maharashtra' }, // Spans Thane and Palghar
  '402': { state: 'Maharashtra', district: 'Raigad' },
  '403': { state: 'Goa', district: 'North Goa' },
  '411': { state: 'Maharashtra', district: 'Pune' },
  '412': { state: 'Maharashtra', district: 'Pune' },
  '413': { state: 'Maharashtra', district: 'Solapur' },
  '414': { state: 'Maharashtra', district: 'Ahilyanagar (Ahmednagar)' },
  '415': { state: 'Maharashtra', district: 'Satara' },
  '416': { state: 'Maharashtra', district: 'Kolhapur' },
  '421': { state: 'Maharashtra', district: 'Thane' },
  '422': { state: 'Maharashtra', district: 'Nashik' },
  '425': { state: 'Maharashtra', district: 'Jalgaon' },
  '431': { state: 'Maharashtra', district: 'Chhatrapati Sambhajinagar (Aurangabad)' },
  '440': { state: 'Maharashtra', district: 'Nagpur' },
  '444': { state: 'Maharashtra', district: 'Amravati' },

  // Madhya Pradesh & Chhattisgarh
  '452': { state: 'Madhya Pradesh', district: 'Indore' },
  '454': { state: 'Madhya Pradesh', district: 'Dhar' },
  '456': { state: 'Madhya Pradesh', district: 'Ujjain' },
  '462': { state: 'Madhya Pradesh', district: 'Bhopal' },
  '474': { state: 'Madhya Pradesh', district: 'Gwalior' },
  '482': { state: 'Madhya Pradesh', district: 'Jabalpur' },
  '485': { state: 'Madhya Pradesh', district: 'Satna' },
  '486': { state: 'Madhya Pradesh', district: 'Rewa' },
  '490': { state: 'Chhattisgarh', district: 'Durg' },
  '492': { state: 'Chhattisgarh', district: 'Raipur' },
  '495': { state: 'Chhattisgarh', district: 'Bilaspur' },

  // Telangana & Andhra Pradesh
  '500': { state: 'Telangana', district: 'Hyderabad' },
  '501': { state: 'Telangana', district: 'Rangareddy' },
  '502': { state: 'Telangana', district: 'Sangareddy' },
  '505': { state: 'Telangana', district: 'Karimnagar' },
  '506': { state: 'Telangana', district: 'Warangal' },
  '515': { state: 'Andhra Pradesh', district: 'Ananthapuramu' },
  '517': { state: 'Andhra Pradesh', district: 'Chittoor' },
  '518': { state: 'Andhra Pradesh', district: 'Kurnool' },
  '520': { state: 'Andhra Pradesh', district: 'NTR' },
  '522': { state: 'Andhra Pradesh', district: 'Guntur' },
  '524': { state: 'Andhra Pradesh', district: 'Sri Potti Sriramulu Nellore' },
  '530': { state: 'Andhra Pradesh', district: 'Visakhapatnam' },
  '533': { state: 'Andhra Pradesh', district: 'Kakinada' },

  // Karnataka
  '560': { state: 'Karnataka', district: 'Bengaluru Urban' },
  '561': { state: 'Karnataka', district: 'Bengaluru Rural' },
  '562': { state: 'Karnataka' }, // Spans Bengaluru Rural, Ramanagara, Chikkaballapura
  '563': { state: 'Karnataka', district: 'Kolar' },
  '570': { state: 'Karnataka', district: 'Mysuru' },
  '571': { state: 'Karnataka', district: 'Mandya' },
  '572': { state: 'Karnataka', district: 'Tumakuru' },
  '574': { state: 'Karnataka', district: 'Dakshina Kannada' },
  '575': { state: 'Karnataka', district: 'Dakshina Kannada' },
  '576': { state: 'Karnataka', district: 'Udupi' },
  '577': { state: 'Karnataka', district: 'Shivamogga' },
  '580': { state: 'Karnataka', district: 'Dharwad' },
  '583': { state: 'Karnataka', district: 'Ballari' },
  '585': { state: 'Karnataka', district: 'Kalaburagi' },
  '590': { state: 'Karnataka', district: 'Belagavi' },

  // Tamil Nadu & Puducherry
  '600': { state: 'Tamil Nadu', district: 'Chennai' },
  '602': { state: 'Tamil Nadu', district: 'Tiruvallur' },
  '603': { state: 'Tamil Nadu', district: 'Chengalpattu' },
  '605': { state: 'Puducherry', district: 'Puducherry' },
  '620': { state: 'Tamil Nadu', district: 'Tiruchirappalli' },
  '625': { state: 'Tamil Nadu', district: 'Madurai' },
  '628': { state: 'Tamil Nadu', district: 'Thoothukudi' },
  '629': { state: 'Tamil Nadu', district: 'Kanyakumari' },
  '632': { state: 'Tamil Nadu', district: 'Vellore' },
  '635': { state: 'Tamil Nadu', district: 'Krishnagiri' },
  '636': { state: 'Tamil Nadu', district: 'Salem' },
  '638': { state: 'Tamil Nadu', district: 'Erode' },
  '641': { state: 'Tamil Nadu', district: 'Coimbatore' },

  // Kerala & Lakshadweep
  '682': { state: 'Kerala', district: 'Ernakulam' },
  '683': { state: 'Kerala', district: 'Ernakulam' },
  '686': { state: 'Kerala', district: 'Kottayam' },
  '688': { state: 'Kerala', district: 'Alappuzha' },
  '691': { state: 'Kerala', district: 'Kollam' },
  '695': { state: 'Kerala', district: 'Thiruvananthapuram' },
  '673': { state: 'Kerala', district: 'Kozhikode' },
  '676': { state: 'Kerala', district: 'Malappuram' },
  '678': { state: 'Kerala', district: 'Palakkad' },
  '679': { state: 'Kerala', district: 'Palakkad' },
  '670': { state: 'Kerala', district: 'Kannur' },
  '671': { state: 'Kerala', district: 'Kasaragod' },

  // West Bengal & Andaman & Nicobar
  '700': { state: 'West Bengal', district: 'Kolkata' },
  '711': { state: 'West Bengal', district: 'Howrah' },
  '712': { state: 'West Bengal', district: 'Hooghly' },
  '713': { state: 'West Bengal' }, // Spans Purba Bardhaman and Paschim Bardhaman (ambiguous)
  '721': { state: 'West Bengal' }, // Spans Paschim Medinipur, Purba Medinipur, Jhargram (ambiguous)
  '734': { state: 'West Bengal' }, // Spans Darjeeling, Kalimpong, Jalpaiguri (ambiguous)
  '737': { state: 'Sikkim', district: 'Gangtok' },
  '741': { state: 'West Bengal', district: 'Nadia' },
  '742': { state: 'West Bengal', district: 'Murshidabad' },
  '743': { state: 'West Bengal' }, // Spans North 24 Parganas and South 24 Parganas
  '744': { state: 'Andaman and Nicobar Islands', district: 'South Andaman' },

  // Odisha & Assam & North-East States
  '751': { state: 'Odisha', district: 'Khordha' },
  '753': { state: 'Odisha', district: 'Cuttack' },
  '760': { state: 'Odisha', district: 'Ganjam' },
  '769': { state: 'Odisha', district: 'Sundargarh' },
  '781': { state: 'Assam', district: 'Kamrup Metropolitan' },
  '786': { state: 'Assam', district: 'Dibrugarh' },
  '790': { state: 'Arunachal Pradesh', district: 'Papum Pare' },
  '791': { state: 'Arunachal Pradesh', district: 'Papum Pare' },
  '792': { state: 'Arunachal Pradesh', district: 'Changlang' },
  '793': { state: 'Meghalaya', district: 'East Khasi Hills' },
  '794': { state: 'Meghalaya', district: 'West Garo Hills' },
  '795': { state: 'Manipur', district: 'Imphal West' },
  '796': { state: 'Mizoram', district: 'Aizawl' },
  '797': { state: 'Nagaland', district: 'Kohima' },
  '798': { state: 'Nagaland', district: 'Mokokchung' },
  '799': { state: 'Tripura', district: 'West Tripura' },

  // Bihar & Jharkhand
  '800': { state: 'Bihar', district: 'Patna' },
  '812': { state: 'Bihar', district: 'Bhagalpur' },
  '823': { state: 'Bihar', district: 'Gaya' },
  '826': { state: 'Jharkhand', district: 'Dhanbad' },
  '827': { state: 'Jharkhand', district: 'Bokaro' },
  '831': { state: 'Jharkhand', district: 'East Singhbhum' },
  '834': { state: 'Jharkhand', district: 'Ranchi' },
  '842': { state: 'Bihar', district: 'Muzaffarpur' },
  '846': { state: 'Bihar', district: 'Darbhanga' }
};

// Exact specific overrides for key districts
const SPECIFIC_PIN_OVERRIDE_MAP: Record<string, { state: string; district: string }> = {
  // Karnataka (Indiranagar / Bengaluru)
  '560038': { state: 'Karnataka', district: 'Bengaluru Urban' },
  '560103': { state: 'Karnataka', district: 'Bengaluru Urban' },
  '560001': { state: 'Karnataka', district: 'Bengaluru Urban' },
  // Delhi
  '110001': { state: 'Delhi', district: 'New Delhi' },
  '110085': { state: 'Delhi', district: 'North West Delhi' },
  // Punjab
  '141001': { state: 'Punjab', district: 'Ludhiana' },
  '143001': { state: 'Punjab', district: 'Amritsar' },
  '144001': { state: 'Punjab', district: 'Jalandhar' },
  '160071': { state: 'Punjab', district: 'Sahibzada Ajit Singh Nagar (Mohali)' },
  // West Bengal - Paschim Bardhaman (Verified exact mappings)
  '713304': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Raniganj (Authoritative LGD match)
  '713301': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Asansol
  '713302': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Asansol Bazar
  '713303': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Asansol R.S.
  '713305': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Burnpur
  '713321': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Andal
  '713324': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Ukhra
  '713325': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Pandaveswar
  '713331': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Chittaranjan
  '713334': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Kulti
  '713340': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Barakar
  '713343': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Neamatpur
  '713347': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Searsole Rajbari (Raniganj)
  '713357': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Jamuria
  '713358': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Raniganj
  '713201': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Durgapur 1
  '713202': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Durgapur 2
  '713203': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Durgapur 3
  '713204': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Durgapur 4
  '713205': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Durgapur 5
  '713216': { state: 'West Bengal', district: 'Paschim Bardhaman' }, // Durgapur 16

  // West Bengal - Purba Bardhaman (Verified exact mappings)
  '713101': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Bardhaman H.O.
  '713102': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Bardhaman Rajbari
  '713103': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Nutanganj
  '713104': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Alisha
  '713121': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Memari
  '713146': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Memari
  '713128': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Guskara
  '713130': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Katwa
  '713141': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Dainhat
  '713401': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Mankar
  '713409': { state: 'West Bengal', district: 'Purba Bardhaman' }, // Kalna

  // West Bengal - Other Districts (Verified exact mappings)
  '700001': { state: 'West Bengal', district: 'Kolkata' }, // Kolkata GPO
  '700027': { state: 'West Bengal', district: 'South 24 Parganas' }, // Alipore
  '743301': { state: 'West Bengal', district: 'South 24 Parganas' }, // Diamond Harbour
  '700124': { state: 'West Bengal', district: 'North 24 Parganas' }, // Barasat
  '711101': { state: 'West Bengal', district: 'Howrah' }, // Howrah
  '712101': { state: 'West Bengal', district: 'Hooghly' }, // Chinsurah
  '721101': { state: 'West Bengal', district: 'Paschim Medinipur' }, // Medinipur
  '721301': { state: 'West Bengal', district: 'Paschim Medinipur' }, // Kharagpur
  '721636': { state: 'West Bengal', district: 'Purba Medinipur' }, // Tamluk
  '721602': { state: 'West Bengal', district: 'Purba Medinipur' }, // Haldia
  '721401': { state: 'West Bengal', district: 'Purba Medinipur' }, // Contai
  '721507': { state: 'West Bengal', district: 'Jhargram' }, // Jhargram
  '722101': { state: 'West Bengal', district: 'Bankura' }, // Bankura
  '723101': { state: 'West Bengal', district: 'Purulia' }, // Purulia
  '731101': { state: 'West Bengal', district: 'Birbhum' }, // Suri
  '731204': { state: 'West Bengal', district: 'Birbhum' }, // Bolpur
  '732101': { state: 'West Bengal', district: 'Malda' }, // Malda
  '733101': { state: 'West Bengal', district: 'Dakshin Dinajpur' }, // Balurghat
  '733134': { state: 'West Bengal', district: 'Uttar Dinajpur' }, // Raiganj
  '734001': { state: 'West Bengal', district: 'Darjeeling' }, // Darjeeling
  '734004': { state: 'West Bengal', district: 'Darjeeling' }, // Siliguri
  '734301': { state: 'West Bengal', district: 'Kalimpong' }, // Kalimpong
  '735101': { state: 'West Bengal', district: 'Jalpaiguri' }, // Jalpaiguri
  '736101': { state: 'West Bengal', district: 'Cooch Behar' }, // Cooch Behar
  '736121': { state: 'West Bengal', district: 'Alipurduar' }, // Alipurduar
  '741101': { state: 'West Bengal', district: 'Nadia' }, // Krishnanagar
  '742101': { state: 'West Bengal', district: 'Murshidabad' }, // Berhampore
  // Maharashtra
  '400001': { state: 'Maharashtra', district: 'Mumbai City' },
  '400050': { state: 'Maharashtra', district: 'Mumbai Suburban' },
  '411001': { state: 'Maharashtra', district: 'Pune' },
  '411057': { state: 'Maharashtra', district: 'Pune' },
  '431001': { state: 'Maharashtra', district: 'Chhatrapati Sambhajinagar (Aurangabad)' },
  '414001': { state: 'Maharashtra', district: 'Ahilyanagar (Ahmednagar)' },
  // Union Territories
  '160017': { state: 'Chandigarh', district: 'Chandigarh' },
  '194101': { state: 'Ladakh', district: 'Leh' },
  '194103': { state: 'Ladakh', district: 'Kargil' },
  '605001': { state: 'Puducherry', district: 'Puducherry' },
  '609602': { state: 'Puducherry', district: 'Karaikal' },
  '673310': { state: 'Puducherry', district: 'Mahe' },
  '533464': { state: 'Puducherry', district: 'Yanam' },
  '682555': { state: 'Lakshadweep', district: 'Lakshadweep' },
  '396210': { state: 'Dadra and Nagar Haveli and Daman and Diu', district: 'Daman' },
  '396220': { state: 'Dadra and Nagar Haveli and Daman and Diu', district: 'Diu' },
  '396230': { state: 'Dadra and Nagar Haveli and Daman and Diu', district: 'Dadra and Nagar Haveli' },
  '744101': { state: 'Andaman and Nicobar Islands', district: 'South Andaman' },
  '795001': { state: 'Manipur', district: 'Imphal West' }
};

export { getStateNames, getDistricts, getCities } from '../data/indiaLocations';

// Helper: Normalize state name against official 36 State/UT list
export function normalizeStateName(stateRaw: string): string | null {
  if (!stateRaw) return null;
  const trimmed = stateRaw.trim();
  const lower = trimmed.toLowerCase();

  if (STATE_ALIAS_MAP[lower]) {
    return STATE_ALIAS_MAP[lower];
  }

  const allStates = getStateNames();
  const match = allStates.find((s) => s.toLowerCase() === lower);
  if (match) return match;

  // Substring match
  const subMatch = allStates.find((s) => s.toLowerCase().includes(lower) || lower.includes(s.toLowerCase()));
  return subMatch || null;
}

// Helper: Normalize district name against official LGD districts of the state
export function normalizeDistrictName(districtRaw: string, stateName: string): string | null {
  if (!districtRaw || !stateName) return null;
  const trimmed = districtRaw.trim();
  const lower = trimmed.toLowerCase();

  const stateDistricts = getDistricts(stateName);
  if (!stateDistricts || stateDistricts.length === 0) return null;

  // 1. Direct alias lookup (for unambiguous historical aliases, e.g. "asansol" -> "Paschim Bardhaman")
  if (DISTRICT_ALIAS_MAP[lower]) {
    const aliasTarget = DISTRICT_ALIAS_MAP[lower];
    const directMatch = stateDistricts.find((d) => d.toLowerCase() === aliasTarget.toLowerCase());
    if (directMatch) return directMatch;
  }

  // 2. Exact case-insensitive match
  const exact = stateDistricts.find((d) => d.toLowerCase() === lower);
  if (exact) return exact;

  // 3. Parenthesis alias match (e.g. "Ahmednagar" inside "Ahilyanagar (Ahmednagar)")
  const parenMatches = stateDistricts.filter((d) => {
    const dLower = d.toLowerCase();
    return dLower.includes(`(${lower})`);
  });
  if (parenMatches.length === 1) return parenMatches[0];

  // 4. Whole-word / token match
  // CRITICAL: Must be UNAMBIGUOUS. If multiple districts contain this token
  // (e.g. "Bardhaman" matches both "Paschim Bardhaman" and "Purba Bardhaman";
  // "Medinipur" matches both "Paschim Medinipur" and "Purba Medinipur"),
  // it is AMBIGUOUS and must return null so we never guess!
  const wordMatches = stateDistricts.filter((d) => {
    const dLower = d.toLowerCase();
    const tokens = dLower.split(/[\s,()/-]+/);
    return tokens.includes(lower);
  });
  if (wordMatches.length === 1) {
    return wordMatches[0];
  }

  return null;
}

// 2-Digit Postal Circle -> State Map (Reliable State identification; NEVER guesses a district)
const POSTAL_2DIGIT_STATE_MAP: Record<string, string> = {
  '11': 'Delhi',
  '12': 'Haryana',
  '13': 'Haryana',
  '14': 'Punjab',
  '15': 'Punjab',
  '16': 'Chandigarh',
  '17': 'Himachal Pradesh',
  '18': 'Jammu and Kashmir',
  '19': 'Jammu and Kashmir',
  '20': 'Uttar Pradesh',
  '21': 'Uttar Pradesh',
  '22': 'Uttar Pradesh',
  '23': 'Uttar Pradesh',
  '24': 'Uttar Pradesh',
  '25': 'Uttar Pradesh',
  '26': 'Uttarakhand',
  '27': 'Uttar Pradesh',
  '28': 'Uttar Pradesh',
  '30': 'Rajasthan',
  '31': 'Rajasthan',
  '32': 'Rajasthan',
  '33': 'Rajasthan',
  '34': 'Rajasthan',
  '36': 'Gujarat',
  '37': 'Gujarat',
  '38': 'Gujarat',
  '39': 'Gujarat',
  '40': 'Maharashtra',
  '41': 'Maharashtra',
  '42': 'Maharashtra',
  '43': 'Maharashtra',
  '44': 'Maharashtra',
  '45': 'Madhya Pradesh',
  '46': 'Madhya Pradesh',
  '47': 'Madhya Pradesh',
  '48': 'Madhya Pradesh',
  '49': 'Chhattisgarh',
  '50': 'Telangana',
  '51': 'Andhra Pradesh',
  '52': 'Andhra Pradesh',
  '53': 'Andhra Pradesh',
  '56': 'Karnataka',
  '57': 'Karnataka',
  '58': 'Karnataka',
  '59': 'Karnataka',
  '60': 'Tamil Nadu',
  '61': 'Tamil Nadu',
  '62': 'Tamil Nadu',
  '63': 'Tamil Nadu',
  '64': 'Tamil Nadu',
  '67': 'Kerala',
  '68': 'Kerala',
  '69': 'Kerala',
  '70': 'West Bengal',
  '71': 'West Bengal',
  '72': 'West Bengal',
  '73': 'West Bengal',
  '74': 'West Bengal',
  '75': 'Odisha',
  '76': 'Odisha',
  '77': 'Odisha',
  '78': 'Assam',
  '79': 'Assam',
  '80': 'Bihar',
  '81': 'Bihar',
  '82': 'Bihar',
  '83': 'Jharkhand',
  '84': 'Bihar',
  '85': 'Bihar'
};

// Synchronous fast lookup using local dataset
export function lookupPincodeSync(pincode: string): PincodeLookupResult | null {
  if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
    return null;
  }
  const pin = pincode.trim();

  // 1. Check exact 6-digit pin override table (unambiguous verified mapping)
  if (SPECIFIC_PIN_OVERRIDE_MAP[pin]) {
    const res = SPECIFIC_PIN_OVERRIDE_MAP[pin];
    return { state: res.state, district: res.district };
  }

  // 2. Check 3-digit prefix mapping
  const prefix3 = pin.slice(0, 3);
  if (OFFLINE_PIN_PREFIX_MAP[prefix3]) {
    const res = OFFLINE_PIN_PREFIX_MAP[prefix3];
    return {
      state: res.state,
      ...(res.district ? { district: res.district } : {})
    };
  }

  // 3. Check 2-digit fallback (State only! Never guesses a district)
  const prefix2 = pin.slice(0, 2);
  const matchedState = POSTAL_2DIGIT_STATE_MAP[prefix2];
  if (matchedState) {
    return { state: matchedState };
  }

  return null;
}

// Asynchronous lookup: Attempts live India Post API with timeout, falls back seamlessly to local database
// ALWAYS returns State and District ONLY (district optional if ambiguous).
// NEVER returns or populates City/Town!
export async function lookupPincode(pincode: string): Promise<PincodeLookupResult | null> {
  if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
    return null;
  }
  const cleanPin = pincode.trim();

  // ---------------------------------------------------------------------------
  // PRIORITY 1: Verified exact six-digit PIN mapping
  // An exact six-digit PIN mapping MUST take absolute precedence over API or broader prefix
  // ---------------------------------------------------------------------------
  if (SPECIFIC_PIN_OVERRIDE_MAP[cleanPin]) {
    const exact = SPECIFIC_PIN_OVERRIDE_MAP[cleanPin];
    return { state: exact.state, district: exact.district };
  }

  // Check offline 3-digit prefix mapping for priority 3 fallback
  const prefix3 = cleanPin.slice(0, 3);
  const offlinePrefix = OFFLINE_PIN_PREFIX_MAP[prefix3];

  // ---------------------------------------------------------------------------
  // PRIORITY 2: Reliable India Post API result
  // ---------------------------------------------------------------------------
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (
        Array.isArray(data) &&
        data[0]?.Status === 'Success' &&
        Array.isArray(data[0]?.PostOffice) &&
        data[0].PostOffice.length > 0
      ) {
        const postOffices = data[0].PostOffice;
        const apiState = postOffices[0]?.State;
        const normalizedState = normalizeStateName(apiState);

        if (normalizedState) {
          // Normalize districts across all returned post offices
          // Check po.District first; if unmapped/ambiguous, check po.Division or po.Block
          const resolvedDistricts = postOffices
            .map((po: any) => {
              const d = normalizeDistrictName(po.District, normalizedState);
              if (d) return d;
              if (po.Division) {
                const div = normalizeDistrictName(po.Division, normalizedState);
                if (div) return div;
              }
              if (po.Block) {
                const blk = normalizeDistrictName(po.Block, normalizedState);
                if (blk) return blk;
              }
              return null;
            })
            .filter((d: string | null): d is string => Boolean(d));

          const uniqueDistricts: string[] = Array.from(new Set(resolvedDistricts));

          if (uniqueDistricts.length === 1) {
            // Check if offline mapping has an opinion that CONFLICTS with the API:
            // "If sources conflict, do not silently select an incorrect district. Show a manual selection prompt."
            if (offlinePrefix?.district && offlinePrefix.district !== uniqueDistricts[0]) {
              return { state: normalizedState };
            }

            // Unambiguous: All post offices map to the same official district
            return {
              state: normalizedState,
              district: uniqueDistricts[0]
            };
          }

          if (uniqueDistricts.length > 1) {
            // Ambiguous: Multiple post offices under this PIN belong to different districts
            // Do NOT guess! Populate State only and let applicant select District
            return {
              state: normalizedState
            };
          }

          // If district normalization returned 0 from API:
          // Fall through to Priority 3: check if unambiguous offline prefix exists
          if (offlinePrefix && offlinePrefix.state === normalizedState && offlinePrefix.district) {
            return {
              state: normalizedState,
              district: offlinePrefix.district
            };
          }

          // District ambiguous or unmapped: never guess!
          return {
            state: normalizedState
          };
        }
      }
    }
  } catch {
    // Network failure, offline mode, timeout or sandbox environment
  }

  // ---------------------------------------------------------------------------
  // PRIORITY 3: Reliable, unambiguous offline mapping
  // ---------------------------------------------------------------------------
  if (offlinePrefix && offlinePrefix.district) {
    return {
      state: offlinePrefix.state,
      district: offlinePrefix.district
    };
  }

  // ---------------------------------------------------------------------------
  // PRIORITY 4: State-only detection or manual selection
  // ---------------------------------------------------------------------------
  return lookupPincodeSync(cleanPin);
}
