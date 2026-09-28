export interface PresetDistrict {
  district_id: string;
  district_name: string;
}

export interface PresetState {
  state_id: string;
  state_name: string;
  districts: PresetDistrict[];
}

export const PRESET_STATES: PresetState[] = [
  {
    state_id: 'KA',
    state_name: 'Karnataka',
    districts: [
      { district_id: 'KA-BLRU', district_name: 'Bengaluru Urban' },
      { district_id: 'KA-BLRR', district_name: 'Bengaluru Rural' },
      { district_id: 'KA-MYS', district_name: 'Mysuru' },
      { district_id: 'KA-BLG', district_name: 'Belagavi' },
      { district_id: 'KA-MNG', district_name: 'Dakshina Kannada (Mangaluru)' },
      { district_id: 'KA-TMK', district_name: 'Tumakuru' },
      { district_id: 'KA-KLR', district_name: 'Kolar' },
      { district_id: 'KA-SHM', district_name: 'Shivamogga' },
      { district_id: 'KA-BLR', district_name: 'Ballari' },
      { district_id: 'KA-HBD', district_name: 'Dharwad (Hubballi)' },
      { district_id: 'KA-KLB', district_name: 'Kalaburagi' },
      { district_id: 'KA-UDP', district_name: 'Udupi' },
    ],
  },
  {
    state_id: 'MH',
    state_name: 'Maharashtra',
    districts: [
      { district_id: 'MH-MUM', district_name: 'Mumbai City' },
      { district_id: 'MH-MSU', district_name: 'Mumbai Suburban' },
      { district_id: 'MH-PUN', district_name: 'Pune' },
      { district_id: 'MH-NAG', district_name: 'Nagpur' },
      { district_id: 'MH-THA', district_name: 'Thane' },
      { district_id: 'MH-NSK', district_name: 'Nashik' },
      { district_id: 'MH-CSN', district_name: 'Chhatrapati Sambhajinagar' },
      { district_id: 'MH-SOL', district_name: 'Solapur' },
      { district_id: 'MH-KOL', district_name: 'Kolhapur' },
      { district_id: 'MH-RAI', district_name: 'Raigad' },
    ],
  },
  {
    state_id: 'DL',
    state_name: 'Delhi (NCT)',
    districts: [
      { district_id: 'DL-NDL', district_name: 'New Delhi' },
      { district_id: 'DL-CDL', district_name: 'Central Delhi' },
      { district_id: 'DL-SDL', district_name: 'South Delhi' },
      { district_id: 'DL-EDL', district_name: 'East Delhi' },
      { district_id: 'DL-WDL', district_name: 'West Delhi' },
      { district_id: 'DL-NDEL', district_name: 'North Delhi' },
      { district_id: 'DL-SWD', district_name: 'South West Delhi' },
    ],
  },
  {
    state_id: 'TN',
    state_name: 'Tamil Nadu',
    districts: [
      { district_id: 'TN-CHN', district_name: 'Chennai' },
      { district_id: 'TN-CBE', district_name: 'Coimbatore' },
      { district_id: 'TN-MDU', district_name: 'Madurai' },
      { district_id: 'TN-TRC', district_name: 'Tiruchirappalli' },
      { district_id: 'TN-SLM', district_name: 'Salem' },
      { district_id: 'TN-KCH', district_name: 'Kanchipuram' },
      { district_id: 'TN-TVL', district_name: 'Tiruvallur' },
      { district_id: 'TN-CGP', district_name: 'Chengalpattu' },
      { district_id: 'TN-VEL', district_name: 'Vellore' },
    ],
  },
  {
    state_id: 'GJ',
    state_name: 'Gujarat',
    districts: [
      { district_id: 'GJ-AMD', district_name: 'Ahmedabad' },
      { district_id: 'GJ-SRT', district_name: 'Surat' },
      { district_id: 'GJ-BRD', district_name: 'Vadodara' },
      { district_id: 'GJ-RJK', district_name: 'Rajkot' },
      { district_id: 'GJ-GND', district_name: 'Gandhinagar' },
      { district_id: 'GJ-BHV', district_name: 'Bhavnagar' },
      { district_id: 'GJ-BHR', district_name: 'Bharuch' },
      { district_id: 'GJ-KCH', district_name: 'Kutch' },
    ],
  },
  {
    state_id: 'UP',
    state_name: 'Uttar Pradesh',
    districts: [
      { district_id: 'UP-LKO', district_name: 'Lucknow' },
      { district_id: 'UP-GBN', district_name: 'Gautam Buddha Nagar (Noida)' },
      { district_id: 'UP-GZB', district_name: 'Ghaziabad' },
      { district_id: 'UP-KNP', district_name: 'Kanpur Nagar' },
      { district_id: 'UP-VNS', district_name: 'Varanasi' },
      { district_id: 'UP-PRY', district_name: 'Prayagraj' },
      { district_id: 'UP-AGR', district_name: 'Agra' },
      { district_id: 'UP-MRT', district_name: 'Meerut' },
      { district_id: 'UP-AYD', district_name: 'Ayodhya' },
      { district_id: 'UP-GKP', district_name: 'Gorakhpur' },
    ],
  },
  {
    state_id: 'TS',
    state_name: 'Telangana',
    districts: [
      { district_id: 'TS-HYD', district_name: 'Hyderabad' },
      { district_id: 'TS-MDM', district_name: 'Medchal-Malkajgiri' },
      { district_id: 'TS-RRD', district_name: 'Rangareddy' },
      { district_id: 'TS-SGR', district_name: 'Sangareddy' },
      { district_id: 'TS-WRG', district_name: 'Warangal' },
      { district_id: 'TS-KRM', district_name: 'Karimnagar' },
      { district_id: 'TS-NZB', district_name: 'Nizamabad' },
    ],
  },
  {
    state_id: 'AP',
    state_name: 'Andhra Pradesh',
    districts: [
      { district_id: 'AP-VSP', district_name: 'Visakhapatnam' },
      { district_id: 'AP-NTR', district_name: 'NTR (Vijayawada)' },
      { district_id: 'AP-GTR', district_name: 'Guntur' },
      { district_id: 'AP-TRP', district_name: 'Tirupati' },
      { district_id: 'AP-KRN', district_name: 'Kurnool' },
      { district_id: 'AP-EGD', district_name: 'East Godavari' },
    ],
  },
  {
    state_id: 'WB',
    state_name: 'West Bengal',
    districts: [
      { district_id: 'WB-KOL', district_name: 'Kolkata' },
      { district_id: 'WB-N24', district_name: 'North 24 Parganas' },
      { district_id: 'WB-S24', district_name: 'South 24 Parganas' },
      { district_id: 'WB-HWR', district_name: 'Howrah' },
      { district_id: 'WB-HGH', district_name: 'Hooghly' },
      { district_id: 'WB-DAR', district_name: 'Darjeeling' },
    ],
  },
  {
    state_id: 'RJ',
    state_name: 'Rajasthan',
    districts: [
      { district_id: 'RJ-JAI', district_name: 'Jaipur' },
      { district_id: 'RJ-JDH', district_name: 'Jodhpur' },
      { district_id: 'RJ-UDP', district_name: 'Udaipur' },
      { district_id: 'RJ-KTA', district_name: 'Kota' },
      { district_id: 'RJ-AJM', district_name: 'Ajmer' },
      { district_id: 'RJ-BKN', district_name: 'Bikaner' },
    ],
  },
  {
    state_id: 'KL',
    state_name: 'Kerala',
    districts: [
      { district_id: 'KL-TVM', district_name: 'Thiruvananthapuram' },
      { district_id: 'KL-EKM', district_name: 'Ernakulam (Kochi)' },
      { district_id: 'KL-KZH', district_name: 'Kozhikode' },
      { district_id: 'KL-TSR', district_name: 'Thrissur' },
      { district_id: 'KL-KLM', district_name: 'Kollam' },
    ],
  },
  {
    state_id: 'MP',
    state_name: 'Madhya Pradesh',
    districts: [
      { district_id: 'MP-BHP', district_name: 'Bhopal' },
      { district_id: 'MP-IND', district_name: 'Indore' },
      { district_id: 'MP-JBL', district_name: 'Jabalpur' },
      { district_id: 'MP-GWL', district_name: 'Gwalior' },
      { district_id: 'MP-UJN', district_name: 'Ujjain' },
    ],
  },
  {
    state_id: 'HR',
    state_name: 'Haryana',
    districts: [
      { district_id: 'HR-GGM', district_name: 'Gurugram' },
      { district_id: 'HR-FBD', district_name: 'Faridabad' },
      { district_id: 'HR-PNP', district_name: 'Panipat' },
      { district_id: 'HR-SNP', district_name: 'Sonipat' },
      { district_id: 'HR-PKL', district_name: 'Panchkula' },
      { district_id: 'HR-KRL', district_name: 'Karnal' },
    ],
  },
  {
    state_id: 'PB',
    state_name: 'Punjab',
    districts: [
      { district_id: 'PB-SAS', district_name: 'SAS Nagar (Mohali)' },
      { district_id: 'PB-LDH', district_name: 'Ludhiana' },
      { district_id: 'PB-ASR', district_name: 'Amritsar' },
      { district_id: 'PB-JAL', district_name: 'Jalandhar' },
      { district_id: 'PB-PTA', district_name: 'Patiala' },
    ],
  },
  {
    state_id: 'OR',
    state_name: 'Odisha',
    districts: [
      { district_id: 'OR-KRD', district_name: 'Khordha (Bhubaneswar)' },
      { district_id: 'OR-CTC', district_name: 'Cuttack' },
      { district_id: 'OR-SND', district_name: 'Sundargarh (Rourkela)' },
      { district_id: 'OR-PUR', district_name: 'Puri' },
      { district_id: 'OR-SBP', district_name: 'Sambalpur' },
    ],
  },
  {
    state_id: 'BR',
    state_name: 'Bihar',
    districts: [
      { district_id: 'BR-PAT', district_name: 'Patna' },
      { district_id: 'BR-GAY', district_name: 'Gaya' },
      { district_id: 'BR-MZP', district_name: 'Muzaffarpur' },
      { district_id: 'BR-BHP', district_name: 'Bhagalpur' },
      { district_id: 'BR-DBG', district_name: 'Darbhanga' },
    ],
  },
  {
    state_id: 'JH',
    state_name: 'Jharkhand',
    districts: [
      { district_id: 'JH-RNC', district_name: 'Ranchi' },
      { district_id: 'JH-ESB', district_name: 'East Singhbhum (Jamshedpur)' },
      { district_id: 'JH-DHN', district_name: 'Dhanbad' },
      { district_id: 'JH-BOK', district_name: 'Bokaro' },
    ],
  },
  {
    state_id: 'AS',
    state_name: 'Assam',
    districts: [
      { district_id: 'AS-KMM', district_name: 'Kamrup Metropolitan (Guwahati)' },
      { district_id: 'AS-DIB', district_name: 'Dibrugarh' },
      { district_id: 'AS-CCH', district_name: 'Cachar (Silchar)' },
      { district_id: 'AS-JHT', district_name: 'Jorhat' },
    ],
  },
  {
    state_id: 'NAT',
    state_name: 'National Jurisdiction (Central)',
    districts: [
      { district_id: 'NAT-HQ', district_name: 'Central MoRD / DoLR HQ, New Delhi' },
      { district_id: 'NAT-NHAI', district_name: 'NHAI Headquarters, New Delhi' },
      { district_id: 'NAT-RLY', district_name: 'Ministry of Railways HQ, New Delhi' },
    ],
  },
];

export const getDistrictsForState = (stateId: string): PresetDistrict[] => {
  const found = PRESET_STATES.find((s) => s.state_id.toUpperCase() === stateId.toUpperCase());
  return found ? found.districts : [];
};

export const getStateName = (stateId: string): string => {
  const found = PRESET_STATES.find((s) => s.state_id.toUpperCase() === stateId.toUpperCase());
  return found ? found.state_name : stateId;
};

export const getDistrictName = (districtId: string): string => {
  for (const s of PRESET_STATES) {
    const d = s.districts.find((dist) => dist.district_id.toUpperCase() === districtId.toUpperCase());
    if (d) return d.district_name;
  }
  return districtId;
};
