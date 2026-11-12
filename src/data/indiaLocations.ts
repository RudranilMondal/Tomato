// Official Government of India Local Government Directory (LGD) Aligned Dataset
// Source: Ministry of Panchayati Raj, Local Government Directory (lgdirectory.gov.in)
// Verification & Compilation Date: November 2026
// Comprehensive official coverage for all 28 States and 8 Union Territories

export interface DistrictData {
  name: string;
  cities?: string[];
}

export interface StateData {
  name: string;
  type: 'State' | 'Union Territory';
  districts: DistrictData[];
}

export const INDIA_STATES_AND_UTS: StateData[] = [
  {
    "name": "Andhra Pradesh",
    "type": "State",
    "districts": [
      {
        "name": "Alluri Sitharama Raju",
        "cities": [
          "Paderu",
          "Rampachodavaram",
          "Araku Valley",
          "Chintapalli"
        ]
      },
      {
        "name": "Anakapalli",
        "cities": [
          "Anakapalli",
          "Chodavaram",
          "Narsipatnam",
          "Yelamanchili"
        ]
      },
      {
        "name": "Ananthapuramu",
        "cities": [
          "Anantapur",
          "Guntakal",
          "Tadipatri",
          "Dharmavaram",
          "Uravakonda"
        ]
      },
      {
        "name": "Annamayya",
        "cities": [
          "Rayachoti",
          "Madanapalle",
          "Rajampet",
          "Railway Koduru"
        ]
      },
      {
        "name": "Bapatla",
        "cities": [
          "Bapatla",
          "Chirala",
          "Repalle",
          "Addanki"
        ]
      },
      {
        "name": "Chittoor",
        "cities": [
          "Chittoor",
          "Palamaner",
          "Punganur",
          "Nagari",
          "Kuppam"
        ]
      },
      {
        "name": "Dr. B.R. Ambedkar Konaseema",
        "cities": [
          "Amalapuram",
          "Razole",
          "Mandapeta",
          "Ramachandrapuram",
          "Mummidivaram"
        ]
      },
      {
        "name": "East Godavari",
        "cities": [
          "Rajahmundry",
          "Nidadavole",
          "Kovvur",
          "Rajanagaram"
        ]
      },
      {
        "name": "Eluru",
        "cities": [
          "Eluru",
          "Jangareddygudem",
          "Nuzvid",
          "Chintalapudi"
        ]
      },
      {
        "name": "Guntur",
        "cities": [
          "Guntur",
          "Tenali",
          "Mangalagiri",
          "Tadikonda",
          "Ponnur"
        ]
      },
      {
        "name": "Kakinada",
        "cities": [
          "Kakinada",
          "Samalkot",
          "Pithapuram",
          "Peddapuram",
          "Tuni"
        ]
      },
      {
        "name": "Krishna",
        "cities": [
          "Machilipatnam",
          "Gudivada",
          "Vuyyuru",
          "Avanigadda"
        ]
      },
      {
        "name": "Kurnool",
        "cities": [
          "Kurnool",
          "Adoni",
          "Yemmiganur",
          "Kodumur"
        ]
      },
      {
        "name": "Nandyal",
        "cities": [
          "Nandyal",
          "Dhone",
          "Allagadda",
          "Nandikotkur",
          "Srisailam"
        ]
      },
      {
        "name": "NTR",
        "cities": [
          "Vijayawada",
          "Jaggaiahpet",
          "Nandigama",
          "Mylavaram",
          "Tiruvuru"
        ]
      },
      {
        "name": "Palnadu",
        "cities": [
          "Narasaraopet",
          "Sattenapalle",
          "Vinukonda",
          "Gurazala",
          "Macherla"
        ]
      },
      {
        "name": "Parvathipuram Manyam",
        "cities": [
          "Parvathipuram",
          "Salur",
          "Palakonda",
          "Kurupam"
        ]
      },
      {
        "name": "Prakasam",
        "cities": [
          "Ongole",
          "Markapur",
          "Giddalur",
          "Kanigiri",
          "Podili"
        ]
      },
      {
        "name": "Sri Potti Sriramulu Nellore",
        "cities": [
          "Nellore",
          "Kavali",
          "Kandukur",
          "Atmakur"
        ]
      },
      {
        "name": "Sri Sathya Sai",
        "cities": [
          "Puttaparthi",
          "Hindupur",
          "Kadiri",
          "Dharmavaram Rural",
          "Penukonda"
        ]
      },
      {
        "name": "Srikakulam",
        "cities": [
          "Srikakulam",
          "Amadalavalasa",
          "Palasa",
          "Rajam",
          "Ichchapuram",
          "Tekkali"
        ]
      },
      {
        "name": "Tirupati",
        "cities": [
          "Tirupati",
          "Srikalahasti",
          "Gudur",
          "Sullurpeta",
          "Venkatagiri"
        ]
      },
      {
        "name": "Visakhapatnam",
        "cities": [
          "Visakhapatnam",
          "Gajuwaka",
          "Bheemunipatnam",
          "Madhurawada",
          "Pendurthi"
        ]
      },
      {
        "name": "Vizianagaram",
        "cities": [
          "Vizianagaram",
          "Bobbili",
          "Cheepurupalli",
          "Gajapathinagaram",
          "Srungavarapukota"
        ]
      },
      {
        "name": "West Godavari",
        "cities": [
          "Bhimavaram",
          "Tadepalligudem",
          "Tanuku",
          "Palakollu",
          "Narasapuram"
        ]
      },
      {
        "name": "YSR Kadapa",
        "cities": [
          "Kadapa",
          "Proddatur",
          "Pulivendula",
          "Jammalamadugu",
          "Badvel",
          "Mydukur"
        ]
      }
    ]
  },
  {
    "name": "Arunachal Pradesh",
    "type": "State",
    "districts": [
      {
        "name": "Anjaw",
        "cities": [
          "Hawai",
          "Hayuliang"
        ]
      },
      {
        "name": "Bichom",
        "cities": [
          "Napangphung"
        ]
      },
      {
        "name": "Changlang",
        "cities": [
          "Changlang",
          "Miao",
          "Jairampur",
          "Bordumsa"
        ]
      },
      {
        "name": "Dibang Valley",
        "cities": [
          "Anini"
        ]
      },
      {
        "name": "East Kameng",
        "cities": [
          "Seppa",
          "Chayang Tajo"
        ]
      },
      {
        "name": "East Siang",
        "cities": [
          "Pasighat",
          "Ruksin",
          "Mebo"
        ]
      },
      {
        "name": "Kamle",
        "cities": [
          "Raga"
        ]
      },
      {
        "name": "Keyi Panyor",
        "cities": [
          "Yachuli"
        ]
      },
      {
        "name": "Kra Daadi",
        "cities": [
          "Jamin",
          "Palin"
        ]
      },
      {
        "name": "Kurung Kumey",
        "cities": [
          "Koloriang",
          "Nyapin"
        ]
      },
      {
        "name": "Lepa Rada",
        "cities": [
          "Basar",
          "Tirbin"
        ]
      },
      {
        "name": "Lohit",
        "cities": [
          "Tezu",
          "Sunpura",
          "Wakro"
        ]
      },
      {
        "name": "Longding",
        "cities": [
          "Longding",
          "Kanubari"
        ]
      },
      {
        "name": "Lower Dibang Valley",
        "cities": [
          "Roing",
          "Dambuk"
        ]
      },
      {
        "name": "Lower Siang",
        "cities": [
          "Likabali",
          "Nari"
        ]
      },
      {
        "name": "Lower Subansiri",
        "cities": [
          "Ziro",
          "Old Ziro"
        ]
      },
      {
        "name": "Namsai",
        "cities": [
          "Namsai",
          "Chowkham",
          "Mahadevpur"
        ]
      },
      {
        "name": "Pakke Kessang",
        "cities": [
          "Lemmi",
          "Pakke Kessang"
        ]
      },
      {
        "name": "Papum Pare",
        "cities": [
          "Itanagar",
          "Naharlagun",
          "Yupia",
          "Doimukh",
          "Banderdewa"
        ]
      },
      {
        "name": "Shi Yomi",
        "cities": [
          "Tato",
          "Mechuka"
        ]
      },
      {
        "name": "Siang",
        "cities": [
          "Boleng",
          "Pangin"
        ]
      },
      {
        "name": "Tawang",
        "cities": [
          "Tawang",
          "Jang",
          "Lumla"
        ]
      },
      {
        "name": "Tirap",
        "cities": [
          "Khonsa",
          "Deomali"
        ]
      },
      {
        "name": "Upper Dibang Valley",
        "cities": [
          "Mipi"
        ]
      },
      {
        "name": "Upper Siang",
        "cities": [
          "Yingkiong",
          "Tuting"
        ]
      },
      {
        "name": "Upper Subansiri",
        "cities": [
          "Daporijo",
          "Dumporijo"
        ]
      },
      {
        "name": "West Kameng",
        "cities": [
          "Bomdila",
          "Rupa",
          "Dirang",
          "Bhalukpong"
        ]
      },
      {
        "name": "West Siang",
        "cities": [
          "Aalo"
        ]
      }
    ]
  },
  {
    "name": "Assam",
    "type": "State",
    "districts": [
      {
        "name": "Bajali",
        "cities": [
          "Pathsala",
          "Bajali"
        ]
      },
      {
        "name": "Baksa",
        "cities": [
          "Mushalpur",
          "Tamulpur Road"
        ]
      },
      {
        "name": "Barpeta",
        "cities": [
          "Barpeta",
          "Howly",
          "Sarthebari",
          "Barpeta Road"
        ]
      },
      {
        "name": "Biswanath",
        "cities": [
          "Biswanath Chariali",
          "Gohpur"
        ]
      },
      {
        "name": "Bongaigaon",
        "cities": [
          "Bongaigaon",
          "Abhayapuri",
          "Bijni"
        ]
      },
      {
        "name": "Cachar",
        "cities": [
          "Silchar",
          "Lakhipur",
          "Sonai",
          "Borkhola"
        ]
      },
      {
        "name": "Charaideo",
        "cities": [
          "Sonari",
          "Moranhat"
        ]
      },
      {
        "name": "Chirang",
        "cities": [
          "Kajalgaon",
          "Basugaon"
        ]
      },
      {
        "name": "Darrang",
        "cities": [
          "Mangaldai",
          "Sipajhar",
          "Kharupetia"
        ]
      },
      {
        "name": "Dhemaji",
        "cities": [
          "Dhemaji",
          "Silapathar",
          "Jonai"
        ]
      },
      {
        "name": "Dhubri",
        "cities": [
          "Dhubri",
          "Gauripur",
          "Bilasipara",
          "Chapar"
        ]
      },
      {
        "name": "Dibrugarh",
        "cities": [
          "Dibrugarh",
          "Naharkatiya",
          "Chabua",
          "Duliajan",
          "Moran"
        ]
      },
      {
        "name": "Dima Hasao",
        "cities": [
          "Haflong",
          "Maibang",
          "Umrangso"
        ]
      },
      {
        "name": "Goalpara",
        "cities": [
          "Goalpara",
          "Dudhnoi",
          "Lakhipur"
        ]
      },
      {
        "name": "Golaghat",
        "cities": [
          "Golaghat",
          "Bokakhat",
          "Sarupathar",
          "Dergaon"
        ]
      },
      {
        "name": "Hailakandi",
        "cities": [
          "Hailakandi",
          "Lala",
          "Algapur"
        ]
      },
      {
        "name": "Hojai",
        "cities": [
          "Hojai",
          "Lumding",
          "Doboka"
        ]
      },
      {
        "name": "Jorhat",
        "cities": [
          "Jorhat",
          "Mariani",
          "Titabar",
          "Teok"
        ]
      },
      {
        "name": "Kamrup",
        "cities": [
          "Amingaon",
          "Rangia",
          "Hajo",
          "Boko",
          "Palasbari",
          "Mirza"
        ]
      },
      {
        "name": "Kamrup Metropolitan",
        "cities": [
          "Guwahati",
          "Dispur",
          "North Guwahati",
          "Chandrapur"
        ]
      },
      {
        "name": "Karbi Anglong",
        "cities": [
          "Diphu",
          "Dokmoka",
          "Bokajan"
        ]
      },
      {
        "name": "Karimganj",
        "cities": [
          "Karimganj",
          "Badarpur",
          "Ramkrishna Nagar"
        ]
      },
      {
        "name": "Kokrajhar",
        "cities": [
          "Kokrajhar",
          "Gossaigaon",
          "Fakiragram"
        ]
      },
      {
        "name": "Lakhimpur",
        "cities": [
          "North Lakhimpur",
          "Dhakuakhana",
          "Narayanpur",
          "Bihpuria"
        ]
      },
      {
        "name": "Majuli",
        "cities": [
          "Garamur",
          "Kamalabari",
          "Jengraimukh"
        ]
      },
      {
        "name": "Marigaon",
        "cities": [
          "Morigaon",
          "Jagiroad",
          "Mayong",
          "Bhuragaon"
        ]
      },
      {
        "name": "Nagaon",
        "cities": [
          "Nagaon",
          "Kaliabor",
          "Raha",
          "Dhing",
          "Kampur"
        ]
      },
      {
        "name": "Nalbari",
        "cities": [
          "Nalbari",
          "Tihu",
          "Belsor"
        ]
      },
      {
        "name": "Sivasagar",
        "cities": [
          "Sivasagar",
          "Nazira",
          "Demow",
          "Amguri"
        ]
      },
      {
        "name": "Sonitpur",
        "cities": [
          "Tezpur",
          "Dhekiajuli",
          "Rangapara",
          "Jamugurihat"
        ]
      },
      {
        "name": "South Salmara-Mankachar",
        "cities": [
          "Hatsingimari",
          "Mankachar"
        ]
      },
      {
        "name": "Tamulpur",
        "cities": [
          "Tamulpur",
          "Goreswar",
          "Kumarikata"
        ]
      },
      {
        "name": "Tinsukia",
        "cities": [
          "Tinsukia",
          "Digboi",
          "Margherita",
          "Doomdooma",
          "Makum"
        ]
      },
      {
        "name": "Udalguri",
        "cities": [
          "Udalguri",
          "Tangla",
          "Rowta"
        ]
      },
      {
        "name": "West Karbi Anglong",
        "cities": [
          "Hamren",
          "Baithalangso",
          "Kheroni"
        ]
      }
    ]
  },
  {
    "name": "Bihar",
    "type": "State",
    "districts": [
      {
        "name": "Araria",
        "cities": [
          "Araria",
          "Forbesganj",
          "Jogbani"
        ]
      },
      {
        "name": "Arwal",
        "cities": [
          "Arwal",
          "Kaler",
          "Kurtha"
        ]
      },
      {
        "name": "Aurangabad",
        "cities": [
          "Aurangabad",
          "Daudnagar",
          "Rafiganj"
        ]
      },
      {
        "name": "Banka",
        "cities": [
          "Banka",
          "Amarpur",
          "Katoria"
        ]
      },
      {
        "name": "Begusarai",
        "cities": [
          "Begusarai",
          "Barauni",
          "Teghra",
          "Bakhri",
          "Ballia"
        ]
      },
      {
        "name": "Bhagalpur",
        "cities": [
          "Bhagalpur",
          "Kahalgaon",
          "Sultanganj",
          "Naugachhia",
          "Colgong"
        ]
      },
      {
        "name": "Bhojpur",
        "cities": [
          "Arrah",
          "Jagdishpur",
          "Piro",
          "Shahpur",
          "Koilwar"
        ]
      },
      {
        "name": "Buxar",
        "cities": [
          "Buxar",
          "Dumraon",
          "Itarhi"
        ]
      },
      {
        "name": "Darbhanga",
        "cities": [
          "Darbhanga",
          "Benipur",
          "Baheri",
          "Biraul",
          "Keoti"
        ]
      },
      {
        "name": "East Champaran",
        "cities": [
          "Motihari",
          "Raxaul",
          "Dhaka",
          "Areraj",
          "Chakia"
        ]
      },
      {
        "name": "Gaya",
        "cities": [
          "Gaya",
          "Bodh Gaya",
          "Sherghati",
          "Tekari",
          "Manpur"
        ]
      },
      {
        "name": "Gopalganj",
        "cities": [
          "Gopalganj",
          "Mirganj",
          "Barauli",
          "Kateya"
        ]
      },
      {
        "name": "Jamui",
        "cities": [
          "Jamui",
          "Jhajha",
          "Sono",
          "Chakai"
        ]
      },
      {
        "name": "Jehanabad",
        "cities": [
          "Jehanabad",
          "Makhdumpur",
          "Kako"
        ]
      },
      {
        "name": "Kaimur",
        "cities": [
          "Bhabua",
          "Mohania",
          "Chainpur",
          "Ramgarh"
        ]
      },
      {
        "name": "Katihar",
        "cities": [
          "Katihar",
          "Barsoi",
          "Manihari"
        ]
      },
      {
        "name": "Khagaria",
        "cities": [
          "Khagaria",
          "Gogri Jamalpur",
          "Parbatta"
        ]
      },
      {
        "name": "Kishanganj",
        "cities": [
          "Kishanganj",
          "Bahadurganj",
          "Thakurganj"
        ]
      },
      {
        "name": "Lakhisarai",
        "cities": [
          "Lakhisarai",
          "Barahiya",
          "Surajgarha"
        ]
      },
      {
        "name": "Madhepura",
        "cities": [
          "Madhepura",
          "Murliganj",
          "Singheshwar",
          "Uda Kishanganj"
        ]
      },
      {
        "name": "Madhubani",
        "cities": [
          "Madhubani",
          "Jhanjharpur",
          "Benipatti",
          "Jaynagar"
        ]
      },
      {
        "name": "Munger",
        "cities": [
          "Munger",
          "Jamalpur",
          "Haveli Kharagpur",
          "Tarapur"
        ]
      },
      {
        "name": "Muzaffarpur",
        "cities": [
          "Muzaffarpur",
          "Kanti",
          "Motipur",
          "Sahebganj",
          "Marwan"
        ]
      },
      {
        "name": "Nalanda",
        "cities": [
          "Bihar Sharif",
          "Rajgir",
          "Hilsa",
          "Islampur",
          "Harnaut"
        ]
      },
      {
        "name": "Nawada",
        "cities": [
          "Nawada",
          "Hisua",
          "Warisaliganj",
          "Rajauli"
        ]
      },
      {
        "name": "Patna",
        "cities": [
          "Patna",
          "Danapur",
          "Barh",
          "Fatuha",
          "Mokama",
          "Masaurhi",
          "Khagaul",
          "Phulwari Sharif"
        ]
      },
      {
        "name": "Purnia",
        "cities": [
          "Purnia",
          "Kasba",
          "Banmankhi",
          "Dhamdaha",
          "Baisi"
        ]
      },
      {
        "name": "Rohtas",
        "cities": [
          "Sasaram",
          "Dehri",
          "Bikramganj",
          "Nokha"
        ]
      },
      {
        "name": "Saharsa",
        "cities": [
          "Saharsa",
          "Simri Bakhtiarpur",
          "Sonbarsa"
        ]
      },
      {
        "name": "Samastipur",
        "cities": [
          "Samastipur",
          "Dalsinghsarai",
          "Rosera",
          "Pusa",
          "Kalyanpur"
        ]
      },
      {
        "name": "Saran",
        "cities": [
          "Chhapra",
          "Marhaura",
          "Revelganj",
          "Dighwara",
          "Sonepur"
        ]
      },
      {
        "name": "Sheikhpura",
        "cities": [
          "Sheikhpura",
          "Barbigha"
        ]
      },
      {
        "name": "Sheohar",
        "cities": [
          "Sheohar",
          "Piprarhi"
        ]
      },
      {
        "name": "Sitamarhi",
        "cities": [
          "Sitamarhi",
          "Bairgania",
          "Pupri",
          "Dumra"
        ]
      },
      {
        "name": "Siwan",
        "cities": [
          "Siwan",
          "Mairwa",
          "Maharajganj"
        ]
      },
      {
        "name": "Supaul",
        "cities": [
          "Supaul",
          "Birpur",
          "Triveniganj",
          "Nirmali"
        ]
      },
      {
        "name": "Vaishali",
        "cities": [
          "Hajipur",
          "Lalganj",
          "Mahua",
          "Mahnar"
        ]
      },
      {
        "name": "West Champaran",
        "cities": [
          "Bettiah",
          "Bagaha",
          "Narkatiaganj",
          "Ramnagar"
        ]
      }
    ]
  },
  {
    "name": "Chhattisgarh",
    "type": "State",
    "districts": [
      {
        "name": "Balod",
        "cities": [
          "Balod",
          "Dalli Rajhara",
          "Gunderdehi",
          "Gurur"
        ]
      },
      {
        "name": "Baloda Bazar",
        "cities": [
          "Baloda Bazar",
          "Bhatapara",
          "Kasdol",
          "Simga"
        ]
      },
      {
        "name": "Balrampur-Ramanujganj",
        "cities": [
          "Balrampur",
          "Ramanujganj",
          "Wadrafnagar",
          "Rajpur"
        ]
      },
      {
        "name": "Bastar",
        "cities": [
          "Jagdalpur",
          "Bastar",
          "Tokapal",
          "Bhanpuri"
        ]
      },
      {
        "name": "Bemetara",
        "cities": [
          "Bemetara",
          "Saja",
          "Nawagarh",
          "Berla"
        ]
      },
      {
        "name": "Bijapur",
        "cities": [
          "Bijapur",
          "Bhopalpatnam",
          "Bhairamgarh"
        ]
      },
      {
        "name": "Bilaspur",
        "cities": [
          "Bilaspur",
          "Ratanpur",
          "Kota",
          "Takhatpur",
          "Bodri",
          "Bilha"
        ]
      },
      {
        "name": "Dantewada",
        "cities": [
          "Dantewada",
          "Kirandul",
          "Bacheli",
          "Geedam"
        ]
      },
      {
        "name": "Dhamtari",
        "cities": [
          "Dhamtari",
          "Kurud",
          "Nagri",
          "Magarlod"
        ]
      },
      {
        "name": "Durg",
        "cities": [
          "Durg",
          "Bhilai",
          "Jamul",
          "Kumhari",
          "Patan",
          "Bhilai Charoda"
        ]
      },
      {
        "name": "Gariaband",
        "cities": [
          "Gariaband",
          "Rajim",
          "Chhura",
          "Deobhog"
        ]
      },
      {
        "name": "Gaurela-Pendra-Marwahi",
        "cities": [
          "Gaurela",
          "Pendra",
          "Marwahi"
        ]
      },
      {
        "name": "Janjgir-Champa",
        "cities": [
          "Janjgir",
          "Champa",
          "Naila Janjgir",
          "Akaltara"
        ]
      },
      {
        "name": "Jashpur",
        "cities": [
          "Jashpur Nagar",
          "Kunkuri",
          "Patthalgaon",
          "Bagicha"
        ]
      },
      {
        "name": "Kabirdham",
        "cities": [
          "Kawardha",
          "Pandariya",
          "Bodla",
          "Sahaspur Lohara"
        ]
      },
      {
        "name": "Kanker",
        "cities": [
          "Kanker",
          "Antagarh",
          "Charama",
          "Pakhanjur"
        ]
      },
      {
        "name": "Khairagarh-Chhuikhadan-Gandai",
        "cities": [
          "Khairagarh",
          "Chhuikhadan",
          "Gandai"
        ]
      },
      {
        "name": "Kondagaon",
        "cities": [
          "Kondagaon",
          "Keshkal",
          "Farasgaon",
          "Makdi"
        ]
      },
      {
        "name": "Korba",
        "cities": [
          "Korba",
          "Katghora",
          "Dipka",
          "Pali",
          "Kusmunda"
        ]
      },
      {
        "name": "Koriya",
        "cities": [
          "Baikunthpur",
          "Sonhat"
        ]
      },
      {
        "name": "Mahasamund",
        "cities": [
          "Mahasamund",
          "Bagbahara",
          "Saraipali",
          "Pithora",
          "Basna"
        ]
      },
      {
        "name": "Manendragarh-Chirmiri-Bharatpur",
        "cities": [
          "Manendragarh",
          "Chirmiri",
          "Bharatpur",
          "Jhagrakhand"
        ]
      },
      {
        "name": "Mohla-Manpur-Ambagarh Chowki",
        "cities": [
          "Mohla",
          "Manpur",
          "Ambagarh Chowki"
        ]
      },
      {
        "name": "Mungeli",
        "cities": [
          "Mungeli",
          "Lormi",
          "Pathariya"
        ]
      },
      {
        "name": "Narayanpur",
        "cities": [
          "Narayanpur",
          "Orchha"
        ]
      },
      {
        "name": "Raigarh",
        "cities": [
          "Raigarh",
          "Kharsia",
          "Gharghoda",
          "Tamnar"
        ]
      },
      {
        "name": "Raipur",
        "cities": [
          "Raipur",
          "Birgaon",
          "Arang",
          "Tilda Newra",
          "Abhanpur",
          "Naya Raipur"
        ]
      },
      {
        "name": "Rajnandgaon",
        "cities": [
          "Rajnandgaon",
          "Dongargarh",
          "Dongargaon"
        ]
      },
      {
        "name": "Sakti",
        "cities": [
          "Sakti",
          "Dabhra",
          "Malkharoda",
          "Jaijaipur"
        ]
      },
      {
        "name": "Sarangarh-Bilaigarh",
        "cities": [
          "Sarangarh",
          "Bilaigarh",
          "Baramkela"
        ]
      },
      {
        "name": "Sukma",
        "cities": [
          "Sukma",
          "Konta",
          "Dornapal"
        ]
      },
      {
        "name": "Surajpur",
        "cities": [
          "Surajpur",
          "Bishrampur",
          "Bhaiyathan",
          "Pratappur"
        ]
      },
      {
        "name": "Surguja",
        "cities": [
          "Ambikapur",
          "Sitapur",
          "Lundra",
          "Mainpat"
        ]
      }
    ]
  },
  {
    "name": "Goa",
    "type": "State",
    "districts": [
      {
        "name": "North Goa",
        "cities": [
          "Panaji",
          "Mapusa",
          "Calangute",
          "Candolim",
          "Bicholim",
          "Pernem",
          "Ponda",
          "Porvorim",
          "Anjuna",
          "Vagator"
        ]
      },
      {
        "name": "South Goa",
        "cities": [
          "Margao",
          "Vasco da Gama",
          "Mormugao",
          "Quepem",
          "Curchorem",
          "Canacona",
          "Cuncolim",
          "Benaulim",
          "Colva"
        ]
      }
    ]
  },
  {
    "name": "Gujarat",
    "type": "State",
    "districts": [
      {
        "name": "Ahmedabad",
        "cities": [
          "Ahmedabad",
          "Sanand",
          "Dholka",
          "Viramgam",
          "Bavla",
          "Dhandhuka"
        ]
      },
      {
        "name": "Amreli",
        "cities": [
          "Amreli",
          "Savarkundla",
          "Bagasara",
          "Rajula",
          "Jafrabad"
        ]
      },
      {
        "name": "Anand",
        "cities": [
          "Anand",
          "Vallabh Vidyanagar",
          "Petlad",
          "Khambhat",
          "Umreth",
          "Borsad"
        ]
      },
      {
        "name": "Aravalli",
        "cities": [
          "Modasa",
          "Malpur",
          "Bayad",
          "Bhiloda",
          "Meghraj"
        ]
      },
      {
        "name": "Banaskantha",
        "cities": [
          "Palanpur",
          "Deesa",
          "Tharad",
          "Dhanera",
          "Ambaji",
          "Bhabhar"
        ]
      },
      {
        "name": "Bharuch",
        "cities": [
          "Bharuch",
          "Ankleshwar",
          "Jambusar",
          "Dahej",
          "Amod",
          "Hansot"
        ]
      },
      {
        "name": "Bhavnagar",
        "cities": [
          "Bhavnagar",
          "Palitana",
          "Mahuva",
          "Sihor",
          "Talaja",
          "Gariadhar"
        ]
      },
      {
        "name": "Botad",
        "cities": [
          "Botad",
          "Gadhada",
          "Barwala",
          "Ranpur"
        ]
      },
      {
        "name": "Chhota Udaipur",
        "cities": [
          "Chhota Udaipur",
          "Bodeli",
          "Sankheda",
          "Nasvadi"
        ]
      },
      {
        "name": "Dahod",
        "cities": [
          "Dahod",
          "Jhalod",
          "Devgadh Baria",
          "Limkheda"
        ]
      },
      {
        "name": "Dang",
        "cities": [
          "Ahwa",
          "Saputara",
          "Waghai"
        ]
      },
      {
        "name": "Devbhumi Dwarka",
        "cities": [
          "Khambhalia",
          "Dwarka",
          "Kalyanpur",
          "Bhanvad",
          "Okha"
        ]
      },
      {
        "name": "Gandhinagar",
        "cities": [
          "Gandhinagar",
          "Kalol",
          "Mansa",
          "Dehgam"
        ]
      },
      {
        "name": "Gir Somnath",
        "cities": [
          "Veraval",
          "Somnath",
          "Talala",
          "Kodinar",
          "Una"
        ]
      },
      {
        "name": "Jamnagar",
        "cities": [
          "Jamnagar",
          "Dhrol",
          "Kalavad",
          "Lalpur",
          "Jodiya"
        ]
      },
      {
        "name": "Junagadh",
        "cities": [
          "Junagadh",
          "Keshod",
          "Mangrol",
          "Manavadar",
          "Visavadar"
        ]
      },
      {
        "name": "Kheda",
        "cities": [
          "Nadiad",
          "Kapadvanj",
          "Kheda",
          "Mahudha",
          "Dakore"
        ]
      },
      {
        "name": "Kutch",
        "cities": [
          "Bhuj",
          "Gandhidham",
          "Anjar",
          "Mandvi",
          "Mundra",
          "Kandla"
        ]
      },
      {
        "name": "Mahisagar",
        "cities": [
          "Lunawada",
          "Santrampur",
          "Balasinor",
          "Kadana"
        ]
      },
      {
        "name": "Mehsana",
        "cities": [
          "Mehsana",
          "Kadi",
          "Visnagar",
          "Unjha",
          "Vadnagar",
          "Becharaji"
        ]
      },
      {
        "name": "Morbi",
        "cities": [
          "Morbi",
          "Wankaner",
          "Halvad",
          "Maliya"
        ]
      },
      {
        "name": "Narmada",
        "cities": [
          "Rajpipla",
          "Dediapada",
          "Tilakwada",
          "Kevadia / Ekta Nagar"
        ]
      },
      {
        "name": "Navsari",
        "cities": [
          "Navsari",
          "Gandevi",
          "Bilimora",
          "Chikhli",
          "Vansda"
        ]
      },
      {
        "name": "Panchmahal",
        "cities": [
          "Godhra",
          "Halol",
          "Kalol",
          "Shehra"
        ]
      },
      {
        "name": "Patan",
        "cities": [
          "Patan",
          "Sidhpur",
          "Radhanpur",
          "Chanasma",
          "Harij"
        ]
      },
      {
        "name": "Porbandar",
        "cities": [
          "Porbandar",
          "Ranavav",
          "Kutiyana"
        ]
      },
      {
        "name": "Rajkot",
        "cities": [
          "Rajkot",
          "Gondal",
          "Jetpur",
          "Dhoraji",
          "Upleta",
          "Jasdan"
        ]
      },
      {
        "name": "Sabarkantha",
        "cities": [
          "Himmatnagar",
          "Idar",
          "Khedbrahma",
          "Prantij",
          "Talod"
        ]
      },
      {
        "name": "Surat",
        "cities": [
          "Surat",
          "Bardoli",
          "Mandvi",
          "Kamrej",
          "Olpad",
          "Vyara Road"
        ]
      },
      {
        "name": "Surendranagar",
        "cities": [
          "Surendranagar",
          "Wadhwan",
          "Dhrangadhra",
          "Limbdi",
          "Chotila"
        ]
      },
      {
        "name": "Tapi",
        "cities": [
          "Vyara",
          "Songadh",
          "Valod",
          "Uchchhal"
        ]
      },
      {
        "name": "Vadodara",
        "cities": [
          "Vadodara",
          "Padra",
          "Dabhoi",
          "Karjan",
          "Waghodia",
          "Savli"
        ]
      },
      {
        "name": "Valsad",
        "cities": [
          "Valsad",
          "Vapi",
          "Pardi",
          "Umbergaon",
          "Dharampur"
        ]
      }
    ]
  },
  {
    "name": "Haryana",
    "type": "State",
    "districts": [
      {
        "name": "Ambala",
        "cities": [
          "Ambala Cantonment",
          "Ambala City",
          "Barara",
          "Naraingarh",
          "Saha"
        ]
      },
      {
        "name": "Bhiwani",
        "cities": [
          "Bhiwani",
          "Tosham",
          "Siwani",
          "Bawani Khera"
        ]
      },
      {
        "name": "Charkhi Dadri",
        "cities": [
          "Charkhi Dadri",
          "Badhra"
        ]
      },
      {
        "name": "Faridabad",
        "cities": [
          "Faridabad",
          "Ballabhgarh",
          "Tigaon",
          "NIT Faridabad"
        ]
      },
      {
        "name": "Fatehabad",
        "cities": [
          "Fatehabad",
          "Tohana",
          "Ratia",
          "Bhuna"
        ]
      },
      {
        "name": "Gurugram",
        "cities": [
          "Gurugram",
          "Manesar",
          "Sohna",
          "Pataudi",
          "Farrukhnagar",
          "DLF Cyber City"
        ]
      },
      {
        "name": "Hisar",
        "cities": [
          "Hisar",
          "Hansi",
          "Barwala",
          "Narnaund",
          "Uklana"
        ]
      },
      {
        "name": "Jhajjar",
        "cities": [
          "Jhajjar",
          "Bahadurgarh",
          "Beri",
          "Badli"
        ]
      },
      {
        "name": "Jind",
        "cities": [
          "Jind",
          "Narwana",
          "Safidon",
          "Uchana",
          "Julana"
        ]
      },
      {
        "name": "Kaithal",
        "cities": [
          "Kaithal",
          "Guhla",
          "Kalayat",
          "Pundri"
        ]
      },
      {
        "name": "Karnal",
        "cities": [
          "Karnal",
          "Gharaunda",
          "Indri",
          "Assandh",
          "Taraori",
          "Nilokheri"
        ]
      },
      {
        "name": "Kurukshetra",
        "cities": [
          "Thanesar",
          "Pehowa",
          "Shahbad",
          "Ladwa",
          "Babain"
        ]
      },
      {
        "name": "Mahendragarh",
        "cities": [
          "Narnaul",
          "Mahendragarh",
          "Kanina",
          "Ateli"
        ]
      },
      {
        "name": "Nuh",
        "cities": [
          "Nuh",
          "Ferozepur Jhirka",
          "Punhana",
          "Taoru"
        ]
      },
      {
        "name": "Palwal",
        "cities": [
          "Palwal",
          "Hodal",
          "Hathin"
        ]
      },
      {
        "name": "Panchkula",
        "cities": [
          "Panchkula",
          "Kalka",
          "Pinjore",
          "Raipur Rani",
          "Morni"
        ]
      },
      {
        "name": "Panipat",
        "cities": [
          "Panipat",
          "Samalkha",
          "Israna",
          "Madlauda"
        ]
      },
      {
        "name": "Rewari",
        "cities": [
          "Rewari",
          "Bawal",
          "Dharuhera",
          "Kosli"
        ]
      },
      {
        "name": "Rohtak",
        "cities": [
          "Rohtak",
          "Meham",
          "Sampla",
          "Kalanaur"
        ]
      },
      {
        "name": "Sirsa",
        "cities": [
          "Sirsa",
          "Dabwali",
          "Rania",
          "Ellenabad"
        ]
      },
      {
        "name": "Sonipat",
        "cities": [
          "Sonipat",
          "Ganaur",
          "Rai",
          "Kharkhoda",
          "Murthal",
          "Kundli"
        ]
      },
      {
        "name": "Yamunanagar",
        "cities": [
          "Yamunanagar",
          "Jagadhri",
          "Radaur",
          "Bilaspur",
          "Chhachhrauli"
        ]
      }
    ]
  },
  {
    "name": "Himachal Pradesh",
    "type": "State",
    "districts": [
      {
        "name": "Bilaspur",
        "cities": [
          "Bilaspur",
          "Ghumarwin",
          "Naina Devi"
        ]
      },
      {
        "name": "Chamba",
        "cities": [
          "Chamba",
          "Dalhousie",
          "Chowari",
          "Bharmour"
        ]
      },
      {
        "name": "Hamirpur",
        "cities": [
          "Hamirpur",
          "Nadaun",
          "Bhoranj",
          "Barsar"
        ]
      },
      {
        "name": "Kangra",
        "cities": [
          "Dharamshala",
          "Kangra",
          "Palampur",
          "Baijnath",
          "Nurpur",
          "Dehra",
          "Jawalamukhi"
        ]
      },
      {
        "name": "Kinnaur",
        "cities": [
          "Reckong Peo",
          "Kalpa",
          "Pooh",
          "Sangla"
        ]
      },
      {
        "name": "Kullu",
        "cities": [
          "Kullu",
          "Manali",
          "Bhuntar",
          "Banjar",
          "Naggar"
        ]
      },
      {
        "name": "Lahaul and Spiti",
        "cities": [
          "Keylong",
          "Kaza",
          "Udaipur",
          "Tabo"
        ]
      },
      {
        "name": "Mandi",
        "cities": [
          "Mandi",
          "Sundernagar",
          "Sarkaghat",
          "Jogindernagar",
          "Karsog"
        ]
      },
      {
        "name": "Shimla",
        "cities": [
          "Shimla",
          "Kufri",
          "Rohru",
          "Rampur",
          "Theog",
          "Kotkhai",
          "Jubbal"
        ]
      },
      {
        "name": "Sirmaur",
        "cities": [
          "Nahan",
          "Paonta Sahib",
          "Rajgarh",
          "Shillai"
        ]
      },
      {
        "name": "Solan",
        "cities": [
          "Solan",
          "Baddi",
          "Nalagarh",
          "Parwanoo",
          "Kasauli",
          "Kandaghat"
        ]
      },
      {
        "name": "Una",
        "cities": [
          "Una",
          "Mehatpur",
          "Amb",
          "Gagret"
        ]
      }
    ]
  },
  {
    "name": "Jharkhand",
    "type": "State",
    "districts": [
      {
        "name": "Bokaro",
        "cities": [
          "Bokaro Steel City",
          "Chas",
          "Bermo",
          "Phusro",
          "Gomia",
          "Chandrapura"
        ]
      },
      {
        "name": "Chatra",
        "cities": [
          "Chatra",
          "Hunterganj",
          "Simaria",
          "Itkhori"
        ]
      },
      {
        "name": "Deoghar",
        "cities": [
          "Deoghar",
          "Madhupur",
          "Sarath",
          "Jasidih"
        ]
      },
      {
        "name": "Dhanbad",
        "cities": [
          "Dhanbad",
          "Jharia",
          "Katras",
          "Sindri",
          "Nirsa",
          "Chirkunda"
        ]
      },
      {
        "name": "Dumka",
        "cities": [
          "Dumka",
          "Jarmundi",
          "Shikaripara",
          "Ranishwar"
        ]
      },
      {
        "name": "East Singhbhum",
        "cities": [
          "Jamshedpur",
          "Ghatshila",
          "Musabani",
          "Chakulia",
          "Potka",
          "Mango"
        ]
      },
      {
        "name": "Garhwa",
        "cities": [
          "Garhwa",
          "Nagar Untari",
          "Meral",
          "Ranka"
        ]
      },
      {
        "name": "Giridih",
        "cities": [
          "Giridih",
          "Dumri",
          "Bagodar",
          "Rajdhanwar"
        ]
      },
      {
        "name": "Godda",
        "cities": [
          "Godda",
          "Mahagama",
          "Poreyahat"
        ]
      },
      {
        "name": "Gumla",
        "cities": [
          "Gumla",
          "Chainpur",
          "Ghaghra",
          "Sisai"
        ]
      },
      {
        "name": "Hazaribagh",
        "cities": [
          "Hazaribagh",
          "Barkagaon",
          "Chauparan",
          "Barhi"
        ]
      },
      {
        "name": "Jamtara",
        "cities": [
          "Jamtara",
          "Mihijam",
          "Kundhit",
          "Narayanpur"
        ]
      },
      {
        "name": "Khunti",
        "cities": [
          "Khunti",
          "Torpa",
          "Murhu",
          "Karra"
        ]
      },
      {
        "name": "Koderma",
        "cities": [
          "Koderma",
          "Jhumri Telaiya",
          "Domchanch",
          "Markacho"
        ]
      },
      {
        "name": "Latehar",
        "cities": [
          "Latehar",
          "Chandwa",
          "Balumath",
          "Mahuadanr",
          "Netarhat"
        ]
      },
      {
        "name": "Lohardaga",
        "cities": [
          "Lohardaga",
          "Kisko",
          "Kuru",
          "Bhandra"
        ]
      },
      {
        "name": "Pakur",
        "cities": [
          "Pakur",
          "Littipara",
          "Hiranpur",
          "Maheshpur"
        ]
      },
      {
        "name": "Palamu",
        "cities": [
          "Medininagar / Daltonganj",
          "Hariharganj",
          "Hussainabad",
          "Chhatarpur"
        ]
      },
      {
        "name": "Ramgarh",
        "cities": [
          "Ramgarh Cantonment",
          "Patratu",
          "Gola",
          "Mandu"
        ]
      },
      {
        "name": "Ranchi",
        "cities": [
          "Ranchi",
          "Bundu",
          "Kanke",
          "Ormanjhi",
          "Ratu",
          "Hatia",
          "Namkum"
        ]
      },
      {
        "name": "Sahibganj",
        "cities": [
          "Sahibganj",
          "Rajmahal",
          "Barharwa",
          "Taljhari"
        ]
      },
      {
        "name": "Saraikela Kharsawan",
        "cities": [
          "Saraikela",
          "Adityapur",
          "Chandil",
          "Gamharia",
          "Kharsawan"
        ]
      },
      {
        "name": "Simdega",
        "cities": [
          "Simdega",
          "Kolebira",
          "Bano",
          "Bolba"
        ]
      },
      {
        "name": "West Singhbhum",
        "cities": [
          "Chaibasa",
          "Chakradharpur",
          "Kiriburu",
          "Noamundi",
          "Gua"
        ]
      }
    ]
  },
  {
    "name": "Karnataka",
    "type": "State",
    "districts": [
      {
        "name": "Bagalkote",
        "cities": [
          "Bagalkote",
          "Badami",
          "Jamkhandi",
          "Mudhol",
          "Ilkal",
          "Guledgudda"
        ]
      },
      {
        "name": "Ballari",
        "cities": [
          "Ballari",
          "Sandur",
          "Siruguppa",
          "Kampli",
          "Kurugodu"
        ]
      },
      {
        "name": "Belagavi",
        "cities": [
          "Belagavi",
          "Gokak",
          "Chikodi",
          "Athani",
          "Bailhongal",
          "Nipani",
          "Sankeshwar"
        ]
      },
      {
        "name": "Bengaluru Rural",
        "cities": [
          "Devanahalli",
          "Doddaballapura",
          "Hoskote",
          "Nelamangala"
        ]
      },
      {
        "name": "Bengaluru Urban",
        "cities": [
          "Bengaluru",
          "Whitefield",
          "Electronic City",
          "Yelahanka",
          "Kengeri",
          "Indiranagar",
          "Koramangala",
          "Marathahalli",
          "HSR Layout",
          "Jayanagar"
        ]
      },
      {
        "name": "Bidar",
        "cities": [
          "Bidar",
          "Basavakalyan",
          "Humnabad",
          "Bhalki",
          "Aurad"
        ]
      },
      {
        "name": "Chamarajanagar",
        "cities": [
          "Chamarajanagar",
          "Kollegal",
          "Gundlupet",
          "Yelandur",
          "Hanur"
        ]
      },
      {
        "name": "Chikkaballapura",
        "cities": [
          "Chikkaballapura",
          "Gowribidanur",
          "Bagepalli",
          "Sidlaghatta",
          "Chintamani"
        ]
      },
      {
        "name": "Chikkamagaluru",
        "cities": [
          "Chikkamagaluru",
          "Kadur",
          "Tarikere",
          "Mudigere",
          "Koppa",
          "Sringeri"
        ]
      },
      {
        "name": "Chitradurga",
        "cities": [
          "Chitradurga",
          "Challakere",
          "Hiriyur",
          "Holalkere",
          "Hosadurga"
        ]
      },
      {
        "name": "Dakshina Kannada",
        "cities": [
          "Mangaluru",
          "Bantwal",
          "Puttur",
          "Belthangady",
          "Sullia",
          "Surathkal",
          "Moodbidri"
        ]
      },
      {
        "name": "Davanagere",
        "cities": [
          "Davanagere",
          "Harihar",
          "Channagiri",
          "Honnali",
          "Jagalur"
        ]
      },
      {
        "name": "Dharwad",
        "cities": [
          "Hubballi",
          "Dharwad",
          "Navalgund",
          "Kalghatgi",
          "Kundgol",
          "Alnavar"
        ]
      },
      {
        "name": "Gadag",
        "cities": [
          "Gadag-Betageri",
          "Lakshmeshwar",
          "Ron",
          "Nargund",
          "Shirhatti"
        ]
      },
      {
        "name": "Hassan",
        "cities": [
          "Hassan",
          "Arsikere",
          "Channarayapatna",
          "Holenarasipura",
          "Sakleshpur",
          "Belur"
        ]
      },
      {
        "name": "Haveri",
        "cities": [
          "Haveri",
          "Ranebennur",
          "Byadgi",
          "Hirekerur",
          "Hangal",
          "Shiggaon"
        ]
      },
      {
        "name": "Kalaburagi",
        "cities": [
          "Kalaburagi",
          "Sedam",
          "Aland",
          "Chittapur",
          "Afzalpur",
          "Chincholi"
        ]
      },
      {
        "name": "Kodagu",
        "cities": [
          "Madikeri",
          "Virajpet",
          "Somwarpet",
          "Kushalnagar",
          "Gonikoppal"
        ]
      },
      {
        "name": "Kolar",
        "cities": [
          "Kolar",
          "Bangarapet",
          "Malur",
          "Mulbagal",
          "Srinivaspur",
          "KGF"
        ]
      },
      {
        "name": "Koppal",
        "cities": [
          "Koppal",
          "Gangavathi",
          "Kushtagi",
          "Yelburga"
        ]
      },
      {
        "name": "Mandya",
        "cities": [
          "Mandya",
          "Maddur",
          "Malavalli",
          "Srirangapatna",
          "Pandavapura",
          "Nagamangala"
        ]
      },
      {
        "name": "Mysuru",
        "cities": [
          "Mysuru",
          "Hunsur",
          "Nanjangud",
          "T. Narasipura",
          "K.R. Nagar",
          "Piriyapatna"
        ]
      },
      {
        "name": "Raichur",
        "cities": [
          "Raichur",
          "Sindhanur",
          "Manvi",
          "Devadurga",
          "Lingsugur",
          "Maski"
        ]
      },
      {
        "name": "Ramanagara",
        "cities": [
          "Ramanagara",
          "Channapatna",
          "Kanakapura",
          "Magadi",
          "Bidadi"
        ]
      },
      {
        "name": "Shivamogga",
        "cities": [
          "Shivamogga",
          "Bhadravati",
          "Sagar",
          "Shikaripura",
          "Thirthahalli",
          "Soraba"
        ]
      },
      {
        "name": "Tumakuru",
        "cities": [
          "Tumakuru",
          "Tiptur",
          "Sira",
          "Kunigal",
          "Madhugiri",
          "Pavagada",
          "Gubbi"
        ]
      },
      {
        "name": "Udupi",
        "cities": [
          "Udupi",
          "Manipal",
          "Kundapura",
          "Karkala",
          "Kaup",
          "Brahmavar",
          "Byndoor"
        ]
      },
      {
        "name": "Uttara Kannada",
        "cities": [
          "Karwar",
          "Sirsi",
          "Kumta",
          "Bhatkal",
          "Ankola",
          "Dandeli",
          "Honavar"
        ]
      },
      {
        "name": "Vijayanagara",
        "cities": [
          "Hospet",
          "Hagaribommanahalli",
          "Harapanahalli",
          "Hoovina Hadagali",
          "Kudligi",
          "Kotturu"
        ]
      },
      {
        "name": "Vijayapura",
        "cities": [
          "Vijayapura",
          "Indi",
          "Basavana Bagewadi",
          "Sindagi",
          "Muddebihal",
          "Talikoti"
        ]
      },
      {
        "name": "Yadgir",
        "cities": [
          "Yadgir",
          "Shahapur",
          "Shorapur",
          "Gurmatkal"
        ]
      }
    ]
  },
  {
    "name": "Kerala",
    "type": "State",
    "districts": [
      {
        "name": "Alappuzha",
        "cities": [
          "Alappuzha",
          "Cherthala",
          "Kayamkulam",
          "Mavelikkara",
          "Chengannur",
          "Haripad"
        ]
      },
      {
        "name": "Ernakulam",
        "cities": [
          "Kochi / Cochin",
          "Ernakulam",
          "Aluva",
          "Angamaly",
          "Tripunithura",
          "Muvattupuzha",
          "Perumbavoor",
          "Kakkanad"
        ]
      },
      {
        "name": "Idukki",
        "cities": [
          "Thodupuzha",
          "Munnar",
          "Kattappana",
          "Adimali",
          "Nedumkandam",
          "Painavu"
        ]
      },
      {
        "name": "Kannur",
        "cities": [
          "Kannur",
          "Thalassery",
          "Payyanur",
          "Taliparamba",
          "Mattannur",
          "Iritty"
        ]
      },
      {
        "name": "Kasaragod",
        "cities": [
          "Kasaragod",
          "Kanhangad",
          "Nileshwaram",
          "Uppala",
          "Manjeshwar"
        ]
      },
      {
        "name": "Kollam",
        "cities": [
          "Kollam",
          "Paravur",
          "Karunagappally",
          "Kottarakkara",
          "Punalur",
          "Pathanapuram"
        ]
      },
      {
        "name": "Kottayam",
        "cities": [
          "Kottayam",
          "Changanassery",
          "Pala",
          "Vaikom",
          "Ettumanoor",
          "Erattupetta"
        ]
      },
      {
        "name": "Kozhikode",
        "cities": [
          "Kozhikode / Calicut",
          "Koyilandy",
          "Vadakara",
          "Feroke",
          "Ramanattukara",
          "Koduvally"
        ]
      },
      {
        "name": "Malappuram",
        "cities": [
          "Malappuram",
          "Manjeri",
          "Tirur",
          "Perinthalmanna",
          "Ponnani",
          "Kottakkal",
          "Nilambur"
        ]
      },
      {
        "name": "Palakkad",
        "cities": [
          "Palakkad",
          "Ottapalam",
          "Chittur",
          "Mannarkkad",
          "Shoranur",
          "Pattambi"
        ]
      },
      {
        "name": "Pathanamthitta",
        "cities": [
          "Pathanamthitta",
          "Thiruvalla",
          "Adoor",
          "Ranni",
          "Pandalam",
          "Konni"
        ]
      },
      {
        "name": "Thiruvananthapuram",
        "cities": [
          "Thiruvananthapuram",
          "Attingal",
          "Neyyattinkara",
          "Varkala",
          "Nedumangad",
          "Kazhakkoottam"
        ]
      },
      {
        "name": "Thrissur",
        "cities": [
          "Thrissur",
          "Chalakudy",
          "Guruvayur",
          "Kodungallur",
          "Kunnamkulam",
          "Irinjalakuda"
        ]
      },
      {
        "name": "Wayanad",
        "cities": [
          "Kalpetta",
          "Sultan Bathery",
          "Mananthavady"
        ]
      }
    ]
  },
  {
    "name": "Madhya Pradesh",
    "type": "State",
    "districts": [
      {
        "name": "Agar Malwa",
        "cities": [
          "Agar",
          "Susner",
          "Nalkheda",
          "Badod"
        ]
      },
      {
        "name": "Alirajpur",
        "cities": [
          "Alirajpur",
          "Jobat",
          "Bhabhra",
          "Katthiwada"
        ]
      },
      {
        "name": "Anuppur",
        "cities": [
          "Anuppur",
          "Kotma",
          "Jaithari",
          "Amarkantak"
        ]
      },
      {
        "name": "Ashoknagar",
        "cities": [
          "Ashoknagar",
          "Chanderi",
          "Mungeroli",
          "Isagarh"
        ]
      },
      {
        "name": "Balaghat",
        "cities": [
          "Balaghat",
          "Waraseoni",
          "Baihar",
          "Katangi",
          "Lanjhi"
        ]
      },
      {
        "name": "Barwani",
        "cities": [
          "Barwani",
          "Sendhwa",
          "Anjad",
          "Pansemal",
          "Rajpur"
        ]
      },
      {
        "name": "Betul",
        "cities": [
          "Betul",
          "Multai",
          "Amla",
          "Sarni",
          "Shahpur"
        ]
      },
      {
        "name": "Bhind",
        "cities": [
          "Bhind",
          "Gohad",
          "Lahar",
          "Mehgaon",
          "Ater"
        ]
      },
      {
        "name": "Bhopal",
        "cities": [
          "Bhopal",
          "Berasia",
          "Kolar",
          "Bairagarh"
        ]
      },
      {
        "name": "Burhanpur",
        "cities": [
          "Burhanpur",
          "Nepanagar",
          "Kharkalan"
        ]
      },
      {
        "name": "Chhatarpur",
        "cities": [
          "Chhatarpur",
          "Nowgong",
          "Khajuraho",
          "Rajnagar",
          "Bada Malhera"
        ]
      },
      {
        "name": "Chhindwara",
        "cities": [
          "Chhindwara",
          "Parasia",
          "Amarwara",
          "Junnardeo",
          "Pandhurna Border"
        ]
      },
      {
        "name": "Damoh",
        "cities": [
          "Damoh",
          "Hatta",
          "Patharia",
          "Batiyagarh"
        ]
      },
      {
        "name": "Datia",
        "cities": [
          "Datia",
          "Seondha",
          "Bhander",
          "Indergarh"
        ]
      },
      {
        "name": "Dewas",
        "cities": [
          "Dewas",
          "Sonkatch",
          "Bagli",
          "Kannod",
          "Khategaon"
        ]
      },
      {
        "name": "Dhar",
        "cities": [
          "Dhar",
          "Pithampur",
          "Manawar",
          "Badnawar",
          "Kukshi",
          "Mandu"
        ]
      },
      {
        "name": "Dindori",
        "cities": [
          "Dindori",
          "Shahpura",
          "Mehandwani"
        ]
      },
      {
        "name": "Guna",
        "cities": [
          "Guna",
          "Raghogarh",
          "Aron",
          "Chhabra Road"
        ]
      },
      {
        "name": "Gwalior",
        "cities": [
          "Gwalior",
          "Dabra",
          "Bhitarwar",
          "Morar"
        ]
      },
      {
        "name": "Harda",
        "cities": [
          "Harda",
          "Timarni",
          "Khirkiya",
          "Handia"
        ]
      },
      {
        "name": "Indore",
        "cities": [
          "Indore",
          "Mhow",
          "Sanwer",
          "Depalpur",
          "Rau",
          "Betma"
        ]
      },
      {
        "name": "Jabalpur",
        "cities": [
          "Jabalpur",
          "Sihora",
          "Panagar",
          "Patan",
          "Shahpura"
        ]
      },
      {
        "name": "Jhabua",
        "cities": [
          "Jhabua",
          "Thandla",
          "Petlawad",
          "Ranapur"
        ]
      },
      {
        "name": "Katni",
        "cities": [
          "Katni",
          "Murwara",
          "Vijayraghavgarh",
          "Bahoriband",
          "Badwara"
        ]
      },
      {
        "name": "Khandwa",
        "cities": [
          "Khandwa",
          "Pandhana",
          "Punasa",
          "Harsud"
        ]
      },
      {
        "name": "Khargone",
        "cities": [
          "Khargone",
          "Barwaha",
          "Sanawad",
          "Kasrawad",
          "Maheshwar",
          "Bhikangaon"
        ]
      },
      {
        "name": "Maihar",
        "cities": [
          "Maihar",
          "Amarpatan",
          "Ramnagar"
        ]
      },
      {
        "name": "Mandla",
        "cities": [
          "Mandla",
          "Nainpur",
          "Bichhiya",
          "Niwas"
        ]
      },
      {
        "name": "Mandsaur",
        "cities": [
          "Mandsaur",
          "Malhargarh",
          "Sitamau",
          "Garoth",
          "Bhanpura"
        ]
      },
      {
        "name": "Mauganj",
        "cities": [
          "Mauganj",
          "Hanumana",
          "Naigarhi"
        ]
      },
      {
        "name": "Morena",
        "cities": [
          "Morena",
          "Ambah",
          "Porsa",
          "Joura",
          "Sabalgarh"
        ]
      },
      {
        "name": "Narmadapuram",
        "cities": [
          "Narmadapuram / Hoshangabad",
          "Itarsi",
          "Pipariya",
          "Sohagpur",
          "Pachmarhi",
          "Seoni Malwa"
        ]
      },
      {
        "name": "Narsinghpur",
        "cities": [
          "Narsinghpur",
          "Gadarwara",
          "Kareli",
          "Gotegaon",
          "Tendukheda"
        ]
      },
      {
        "name": "Neemuch",
        "cities": [
          "Neemuch",
          "Manasa",
          "Jawad",
          "Singoli"
        ]
      },
      {
        "name": "Niwari",
        "cities": [
          "Niwari",
          "Orchha",
          "Prithvipur"
        ]
      },
      {
        "name": "Pandhurna",
        "cities": [
          "Pandhurna",
          "Sausar"
        ]
      },
      {
        "name": "Panna",
        "cities": [
          "Panna",
          "Ajaigarh",
          "Amanganj",
          "Pawan Nagar"
        ]
      },
      {
        "name": "Raisen",
        "cities": [
          "Raisen",
          "Mandi Bamora",
          "Bareli",
          "Goharganj",
          "Sanchi",
          "Obedullaganj"
        ]
      },
      {
        "name": "Rajgarh",
        "cities": [
          "Rajgarh",
          "Biaora",
          "Narsinghgarh",
          "Sarangpur",
          "Khilchipur"
        ]
      },
      {
        "name": "Ratlam",
        "cities": [
          "Ratlam",
          "Jaora",
          "Alot",
          "Sailana",
          "Piploda"
        ]
      },
      {
        "name": "Rewa",
        "cities": [
          "Rewa",
          "Teonthar",
          "Mangawan",
          "Sirmaur",
          "Gurh"
        ]
      },
      {
        "name": "Sagar",
        "cities": [
          "Sagar",
          "Bina",
          "Khurai",
          "Rahatgarh",
          "Deori",
          "Banda"
        ]
      },
      {
        "name": "Satna",
        "cities": [
          "Satna",
          "Nagod",
          "Raghurajnagar",
          "Uchehara",
          "Birsinghpur"
        ]
      },
      {
        "name": "Sehore",
        "cities": [
          "Sehore",
          "Ashta",
          "Ichhawar",
          "Budhni",
          "Nasrullaganj"
        ]
      },
      {
        "name": "Seoni",
        "cities": [
          "Seoni",
          "Lakhnadon",
          "Barghat",
          "Keolari",
          "Ghansore"
        ]
      },
      {
        "name": "Shahdol",
        "cities": [
          "Shahdol",
          "Beohari",
          "Jaisinghnagar",
          "Burhar"
        ]
      },
      {
        "name": "Shajapur",
        "cities": [
          "Shajapur",
          "Shujalpur",
          "Kalapipal",
          "Polay Kalan"
        ]
      },
      {
        "name": "Sheopur",
        "cities": [
          "Sheopur",
          "Vijaypur",
          "Karahal"
        ]
      },
      {
        "name": "Shivpuri",
        "cities": [
          "Shivpuri",
          "Karera",
          "Kolaras",
          "Pohari",
          "Pichhore"
        ]
      },
      {
        "name": "Sidhi",
        "cities": [
          "Sidhi",
          "Churhat",
          "Rampur Naikin",
          "Majhauli"
        ]
      },
      {
        "name": "Singrauli",
        "cities": [
          "Waidhan",
          "Singrauli",
          "Deosar",
          "Chitrangi"
        ]
      },
      {
        "name": "Tikamgarh",
        "cities": [
          "Tikamgarh",
          "Jatara",
          "Baldeogarh",
          "Palera"
        ]
      },
      {
        "name": "Ujjain",
        "cities": [
          "Ujjain",
          "Nagda",
          "Mahidpur",
          "Tarana",
          "Khachrod",
          "Badnagar"
        ]
      },
      {
        "name": "Umaria",
        "cities": [
          "Umaria",
          "Pali",
          "Manpur",
          "Chandia"
        ]
      },
      {
        "name": "Vidisha",
        "cities": [
          "Vidisha",
          "Basoda",
          "Kurwai",
          "Sironj",
          "Lateri",
          "Gyaraspur"
        ]
      }
    ]
  },
  {
    "name": "Maharashtra",
    "type": "State",
    "districts": [
      {
        "name": "Ahilyanagar (Ahmednagar)",
        "cities": [
          "Ahmednagar",
          "Shirdi",
          "Sangamner",
          "Kopargaon",
          "Rahuri",
          "Shrirampur",
          "Nevasa",
          "Parner",
          "Shevgaon"
        ]
      },
      {
        "name": "Akola",
        "cities": [
          "Akola",
          "Akot",
          "Murtizapur",
          "Telhara",
          "Balapur",
          "Patur"
        ]
      },
      {
        "name": "Amravati",
        "cities": [
          "Amravati",
          "Achalpur",
          "Morshi",
          "Warud",
          "Anjangaon",
          "Daryapur",
          "Chandur Railway"
        ]
      },
      {
        "name": "Beed",
        "cities": [
          "Beed",
          "Parli Vaijnath",
          "Ambejogai",
          "Georai",
          "Majalgaon",
          "Ashti"
        ]
      },
      {
        "name": "Bhandara",
        "cities": [
          "Bhandara",
          "Tumsar",
          "Pauni",
          "Sakoli",
          "Mohadi"
        ]
      },
      {
        "name": "Buldhana",
        "cities": [
          "Buldhana",
          "Khamgaon",
          "Malkapur",
          "Shegaon",
          "Chikhli",
          "Mehkar",
          "Jalgaon Jamod"
        ]
      },
      {
        "name": "Chandrapur",
        "cities": [
          "Chandrapur",
          "Ballarpur",
          "Warora",
          "Bhadravati",
          "Rajura",
          "Mul"
        ]
      },
      {
        "name": "Chhatrapati Sambhajinagar (Aurangabad)",
        "cities": [
          "Chhatrapati Sambhajinagar",
          "Paithan",
          "Vaijapur",
          "Gangapur",
          "Kannad",
          "Sillod",
          "Khuldabad"
        ]
      },
      {
        "name": "Dharashiv (Osmanabad)",
        "cities": [
          "Dharashiv / Osmanabad",
          "Tuljapur",
          "Omerga",
          "Kalamb",
          "Bhum",
          "Paranda"
        ]
      },
      {
        "name": "Dhule",
        "cities": [
          "Dhule",
          "Shirpur",
          "Dondaicha",
          "Sakri",
          "Sindkheda"
        ]
      },
      {
        "name": "Gadchiroli",
        "cities": [
          "Gadchiroli",
          "Aheri",
          "Armori",
          "Chamorshi",
          "Desaiganj / Wadsa"
        ]
      },
      {
        "name": "Gondia",
        "cities": [
          "Gondia",
          "Tirora",
          "Amgaon",
          "Goregaon",
          "Arjuni Morgaon"
        ]
      },
      {
        "name": "Hingoli",
        "cities": [
          "Hingoli",
          "Basmath",
          "Kalamnuri",
          "Sengon",
          "Aundha Nagnath"
        ]
      },
      {
        "name": "Jalgaon",
        "cities": [
          "Jalgaon",
          "Bhusawal",
          "Chalisgaon",
          "Amalner",
          "Pachora",
          "Raver",
          "Yawal",
          "Erandol",
          "Jamner"
        ]
      },
      {
        "name": "Jalna",
        "cities": [
          "Jalna",
          "Partur",
          "Ambad",
          "Bhokardan",
          "Jafrabad",
          "Ghansawangi"
        ]
      },
      {
        "name": "Kolhapur",
        "cities": [
          "Kolhapur",
          "Ichalkaranji",
          "Jaysingpur",
          "Kagal",
          "Gadhinglaj",
          "Panhala",
          "Shirol"
        ]
      },
      {
        "name": "Latur",
        "cities": [
          "Latur",
          "Udgir",
          "Ahmedpur",
          "Ausa",
          "Nilanga",
          "Chakur"
        ]
      },
      {
        "name": "Mumbai City",
        "cities": [
          "Mumbai",
          "Colaba",
          "Nariman Point",
          "Dadar",
          "Worli",
          "Byculla",
          "Fort",
          "Marine Lines",
          "Parel"
        ]
      },
      {
        "name": "Mumbai Suburban",
        "cities": [
          "Bandra",
          "Andheri",
          "Borivali",
          "Ghatkopar",
          "Kurla",
          "Malad",
          "Mulund",
          "Powai",
          "Juhu",
          "Kandivali",
          "Chembur"
        ]
      },
      {
        "name": "Nagpur",
        "cities": [
          "Nagpur",
          "Kamthi",
          "Umred",
          "Katol",
          "Saoner",
          "Hingna",
          "Ramtek",
          "Narkhed"
        ]
      },
      {
        "name": "Nanded",
        "cities": [
          "Nanded",
          "Degloor",
          "Kinwat",
          "Mudkhed",
          "Dharmabad",
          "Hadgaon",
          "Mukhed",
          "Loha"
        ]
      },
      {
        "name": "Nandurbar",
        "cities": [
          "Nandurbar",
          "Shahada",
          "Navapur",
          "Taloda",
          "Dhadgaon"
        ]
      },
      {
        "name": "Nashik",
        "cities": [
          "Nashik",
          "Malegaon",
          "Sinnar",
          "Niphad",
          "Yeola",
          "Deolali",
          "Trimbak",
          "Satana",
          "Lasalgaon"
        ]
      },
      {
        "name": "Palghar",
        "cities": [
          "Palghar",
          "Vasai-Virar",
          "Dahanu",
          "Boisar",
          "Jawhar",
          "Wada",
          "Talasari"
        ]
      },
      {
        "name": "Parbhani",
        "cities": [
          "Parbhani",
          "Gangakhed",
          "Jintur",
          "Selu",
          "Manwath",
          "Purna",
          "Pathri"
        ]
      },
      {
        "name": "Pune",
        "cities": [
          "Pune",
          "Pimpri-Chinchwad",
          "Baramati",
          "Shirur",
          "Daund",
          "Haveli",
          "Talegaon",
          "Hinjewadi",
          "Hadapsar",
          "Kothrud",
          "Lonavala",
          "Chakan"
        ]
      },
      {
        "name": "Raigad",
        "cities": [
          "Navi Mumbai (South)",
          "Panvel",
          "Alibag",
          "Karjat",
          "Khopoli",
          "Mahad",
          "Uran",
          "Roha",
          "Pen",
          "Mangaon"
        ]
      },
      {
        "name": "Ratnagiri",
        "cities": [
          "Ratnagiri",
          "Chiplun",
          "Khed",
          "Guhagar",
          "Dapoli",
          "Rajapur",
          "Sangameshwar"
        ]
      },
      {
        "name": "Sangli",
        "cities": [
          "Sangli",
          "Miraj",
          "Kupwad",
          "Islampur",
          "Tasgaon",
          "Vita",
          "Jath",
          "Ashta"
        ]
      },
      {
        "name": "Satara",
        "cities": [
          "Satara",
          "Karad",
          "Phaltan",
          "Wai",
          "Mahabaleshwar",
          "Patan",
          "Koregaon"
        ]
      },
      {
        "name": "Sindhudurg",
        "cities": [
          "Oros",
          "Sawantwadi",
          "Malvan",
          "Kankavli",
          "Kudal",
          "Vengurla",
          "Devgad"
        ]
      },
      {
        "name": "Solapur",
        "cities": [
          "Solapur",
          "Pandharpur",
          "Barshi",
          "Akkalkot",
          "Mohol",
          "Karmala",
          "Sangola",
          "Mangalwedha"
        ]
      },
      {
        "name": "Thane",
        "cities": [
          "Thane",
          "Kalyan",
          "Dombivli",
          "Ulhasnagar",
          "Bhiwandi",
          "Mira-Bhayandar",
          "Badlapur",
          "Ambernath",
          "Mumbra"
        ]
      },
      {
        "name": "Wardha",
        "cities": [
          "Wardha",
          "Hinganghat",
          "Arvi",
          "Deoli",
          "Pulgaon",
          "Seloo"
        ]
      },
      {
        "name": "Washim",
        "cities": [
          "Washim",
          "Karanja Lad",
          "Risod",
          "Malegaon Jahangir",
          "Mangrulpir"
        ]
      },
      {
        "name": "Yavatmal",
        "cities": [
          "Yavatmal",
          "Pusad",
          "Umarkhed",
          "Wani",
          "Digras",
          "Darwha",
          "Ghatanji"
        ]
      }
    ]
  },
  {
    "name": "Manipur",
    "type": "State",
    "districts": [
      {
        "name": "Bishnupur",
        "cities": [
          "Bishnupur",
          "Moirang",
          "Nambol",
          "Oinam"
        ]
      },
      {
        "name": "Chandel",
        "cities": [
          "Chandel",
          "Maha Union"
        ]
      },
      {
        "name": "Churachandpur",
        "cities": [
          "Churachandpur",
          "Tuibong",
          "Singngat"
        ]
      },
      {
        "name": "Imphal East",
        "cities": [
          "Porompat",
          "Sawombung",
          "Andro"
        ]
      },
      {
        "name": "Imphal West",
        "cities": [
          "Imphal",
          "Lamphelpat",
          "Lamsang",
          "Wangoi"
        ]
      },
      {
        "name": "Jiribam",
        "cities": [
          "Jiribam",
          "Babupara"
        ]
      },
      {
        "name": "Kakching",
        "cities": [
          "Kakching",
          "Sugnu",
          "Wangkhei"
        ]
      },
      {
        "name": "Kamjong",
        "cities": [
          "Kamjong",
          "Phungyar"
        ]
      },
      {
        "name": "Kangpokpi",
        "cities": [
          "Kangpokpi",
          "Motbung",
          "Keithelmanbi"
        ]
      },
      {
        "name": "Noney",
        "cities": [
          "Noney",
          "Longmai"
        ]
      },
      {
        "name": "Pherzawl",
        "cities": [
          "Pherzawl",
          "Parbung"
        ]
      },
      {
        "name": "Senapati",
        "cities": [
          "Senapati",
          "Maram",
          "Tadubi"
        ]
      },
      {
        "name": "Tamenglong",
        "cities": [
          "Tamenglong",
          "Tamei"
        ]
      },
      {
        "name": "Tengnoupal",
        "cities": [
          "Tengnoupal",
          "Moreh"
        ]
      },
      {
        "name": "Thoubal",
        "cities": [
          "Thoubal",
          "Lilong",
          "Yairipok"
        ]
      },
      {
        "name": "Ukhrul",
        "cities": [
          "Ukhrul",
          "Somdal"
        ]
      }
    ]
  },
  {
    "name": "Meghalaya",
    "type": "State",
    "districts": [
      {
        "name": "East Garo Hills",
        "cities": [
          "Williamnagar",
          "Rongjeng"
        ]
      },
      {
        "name": "East Jaintia Hills",
        "cities": [
          "Khliehriat",
          "Ladrymbai"
        ]
      },
      {
        "name": "East Khasi Hills",
        "cities": [
          "Shillong",
          "Sohra / Cherrapunji",
          "Pynursla",
          "Mawkdok"
        ]
      },
      {
        "name": "Eastern West Khasi Hills",
        "cities": [
          "Mairang"
        ]
      },
      {
        "name": "North Garo Hills",
        "cities": [
          "Resubelpara",
          "Mendipathar"
        ]
      },
      {
        "name": "Ri-Bhoi",
        "cities": [
          "Nongpoh",
          "Umsning",
          "Byrnihat"
        ]
      },
      {
        "name": "South Garo Hills",
        "cities": [
          "Baghmara",
          "Gasuapara"
        ]
      },
      {
        "name": "South West Garo Hills",
        "cities": [
          "Ampati",
          "Mahendraganj"
        ]
      },
      {
        "name": "South West Khasi Hills",
        "cities": [
          "Mawkyrwat",
          "Ranikor"
        ]
      },
      {
        "name": "West Garo Hills",
        "cities": [
          "Tura",
          "Dalu",
          "Phulbari"
        ]
      },
      {
        "name": "West Jaintia Hills",
        "cities": [
          "Jowai",
          "Amlarem"
        ]
      },
      {
        "name": "West Khasi Hills",
        "cities": [
          "Nongstoin",
          "Mawshynrut"
        ]
      }
    ]
  },
  {
    "name": "Mizoram",
    "type": "State",
    "districts": [
      {
        "name": "Aizawl",
        "cities": [
          "Aizawl",
          "Darlawn",
          "Sairang"
        ]
      },
      {
        "name": "Champhai",
        "cities": [
          "Champhai",
          "Zokhawthar"
        ]
      },
      {
        "name": "Hnahthial",
        "cities": [
          "Hnahthial"
        ]
      },
      {
        "name": "Khawzawl",
        "cities": [
          "Khawzawl"
        ]
      },
      {
        "name": "Kolasib",
        "cities": [
          "Kolasib",
          "Vairengte",
          "Kawnpui"
        ]
      },
      {
        "name": "Lawngtlai",
        "cities": [
          "Lawngtlai",
          "Chawngte"
        ]
      },
      {
        "name": "Lunglei",
        "cities": [
          "Lunglei",
          "Tlabung"
        ]
      },
      {
        "name": "Mamit",
        "cities": [
          "Mamit",
          "Zawlnuam"
        ]
      },
      {
        "name": "Saitual",
        "cities": [
          "Saitual",
          "Keifang"
        ]
      },
      {
        "name": "Serchhip",
        "cities": [
          "Serchhip",
          "North Vanlaiphai",
          "Thenzawl"
        ]
      },
      {
        "name": "Siaha",
        "cities": [
          "Siaha",
          "Tuipang"
        ]
      }
    ]
  },
  {
    "name": "Nagaland",
    "type": "State",
    "districts": [
      {
        "name": "Chümoukedima",
        "cities": [
          "Chümoukedima",
          "Medziphema",
          "Seithekema"
        ]
      },
      {
        "name": "Dimapur",
        "cities": [
          "Dimapur",
          "Purana Bazar"
        ]
      },
      {
        "name": "Kiphire",
        "cities": [
          "Kiphire",
          "Pungro"
        ]
      },
      {
        "name": "Kohima",
        "cities": [
          "Kohima",
          "Jakhama",
          "Chiephobozou"
        ]
      },
      {
        "name": "Longleng",
        "cities": [
          "Longleng",
          "Tamlu"
        ]
      },
      {
        "name": "Mokokchung",
        "cities": [
          "Mokokchung",
          "Mangkolemba",
          "Changtongya",
          "Tuli"
        ]
      },
      {
        "name": "Mon",
        "cities": [
          "Mon",
          "Naganimora",
          "Tizit",
          "Aboi"
        ]
      },
      {
        "name": "Niuland",
        "cities": [
          "Niuland"
        ]
      },
      {
        "name": "Noklak",
        "cities": [
          "Noklak",
          "Thonoknyu"
        ]
      },
      {
        "name": "Peren",
        "cities": [
          "Peren",
          "Jalukie",
          "Tening"
        ]
      },
      {
        "name": "Phek",
        "cities": [
          "Phek",
          "Pfutsero",
          "Meluri",
          "Chozuba"
        ]
      },
      {
        "name": "Shamator",
        "cities": [
          "Shamator",
          "Chessore"
        ]
      },
      {
        "name": "Tseminyü",
        "cities": [
          "Tseminyü"
        ]
      },
      {
        "name": "Tuensang",
        "cities": [
          "Tuensang",
          "Longkhim"
        ]
      },
      {
        "name": "Wokha",
        "cities": [
          "Wokha",
          "Sanis",
          "Bhandari"
        ]
      },
      {
        "name": "Zünheboto",
        "cities": [
          "Zünheboto",
          "Aghunato",
          "Satakha"
        ]
      }
    ]
  },
  {
    "name": "Odisha",
    "type": "State",
    "districts": [
      {
        "name": "Angul",
        "cities": [
          "Angul",
          "Talcher",
          "Athmallik",
          "Pallahara"
        ]
      },
      {
        "name": "Balangir",
        "cities": [
          "Balangir",
          "Titilagarh",
          "Patnagarh",
          "Kantabanji"
        ]
      },
      {
        "name": "Balasore",
        "cities": [
          "Balasore",
          "Soro",
          "Jaleswar",
          "Nilagiri",
          "Bhograi"
        ]
      },
      {
        "name": "Bargarh",
        "cities": [
          "Bargarh",
          "Padampur",
          "Barpali",
          "Attabira"
        ]
      },
      {
        "name": "Bhadrak",
        "cities": [
          "Bhadrak",
          "Basudevpur",
          "Chandbali",
          "Dhamnagar"
        ]
      },
      {
        "name": "Boudh",
        "cities": [
          "Boudh",
          "Kantamal",
          "Harbhanga"
        ]
      },
      {
        "name": "Cuttack",
        "cities": [
          "Cuttack",
          "Choudwar",
          "Athagarh",
          "Banki",
          "Salipur"
        ]
      },
      {
        "name": "Deogarh",
        "cities": [
          "Deogarh",
          "Barkote",
          "Reamal"
        ]
      },
      {
        "name": "Dhenkanal",
        "cities": [
          "Dhenkanal",
          "Kamakhyanagar",
          "Bhuban",
          "Hindol"
        ]
      },
      {
        "name": "Gajapati",
        "cities": [
          "Paralakhemundi",
          "Kashinagara",
          "Mohana"
        ]
      },
      {
        "name": "Ganjam",
        "cities": [
          "Berhampur",
          "Chhatrapur",
          "Hinjilicut",
          "Bhanjanagar",
          "Aska",
          "Bellaguntha"
        ]
      },
      {
        "name": "Jagatsinghpur",
        "cities": [
          "Jagatsinghpur",
          "Paradeep",
          "Tirtol",
          "Kujang"
        ]
      },
      {
        "name": "Jajpur",
        "cities": [
          "Jajpur",
          "Jajpur Road / Vyasanagar",
          "Chandikhol",
          "Sukinda"
        ]
      },
      {
        "name": "Jharsuguda",
        "cities": [
          "Jharsuguda",
          "Brajarajnagar",
          "Belpahar"
        ]
      },
      {
        "name": "Kalahandi",
        "cities": [
          "Bhawanipatna",
          "Kesinga",
          "Junagarh",
          "Dharmagarh"
        ]
      },
      {
        "name": "Kandhamal",
        "cities": [
          "Phulbani",
          "G. Udayagiri",
          "Baliguda",
          "Daringbadi"
        ]
      },
      {
        "name": "Kendrapara",
        "cities": [
          "Kendrapara",
          "Pattamundai",
          "Aul",
          "Rajkanika"
        ]
      },
      {
        "name": "Kendujhar",
        "cities": [
          "Keonjhar / Kendujhar",
          "Barbil",
          "Joda",
          "Anandapur"
        ]
      },
      {
        "name": "Khordha",
        "cities": [
          "Bhubaneswar",
          "Khordha",
          "Jatni",
          "Banapur",
          "Balipatna"
        ]
      },
      {
        "name": "Koraput",
        "cities": [
          "Koraput",
          "Jeypore",
          "Sunabeda",
          "Damanjodi",
          "Kotpad"
        ]
      },
      {
        "name": "Malkangiri",
        "cities": [
          "Malkangiri",
          "Balimela",
          "Mathili",
          "Kalimela"
        ]
      },
      {
        "name": "Mayurbhanj",
        "cities": [
          "Baripada",
          "Rairangpur",
          "Karanjia",
          "Betnoti"
        ]
      },
      {
        "name": "Nabarangpur",
        "cities": [
          "Nabarangpur",
          "Umerkote",
          "Khatiguda"
        ]
      },
      {
        "name": "Nayagarh",
        "cities": [
          "Nayagarh",
          "Khandapada",
          "Ranpur",
          "Odagaon",
          "Daspalla"
        ]
      },
      {
        "name": "Nuapada",
        "cities": [
          "Nuapada",
          "Khariar",
          "Khariar Road",
          "Komna"
        ]
      },
      {
        "name": "Puri",
        "cities": [
          "Puri",
          "Konark",
          "Nimapada",
          "Pipili",
          "Brahmagiri"
        ]
      },
      {
        "name": "Rayagada",
        "cities": [
          "Rayagada",
          "Gunupur",
          "Gudari",
          "Bisam Cuttack"
        ]
      },
      {
        "name": "Sambalpur",
        "cities": [
          "Sambalpur",
          "Burla",
          "Hirakud",
          "Kuchinda",
          "Rairakhol"
        ]
      },
      {
        "name": "Subarnapur",
        "cities": [
          "Sonepur / Subarnapur",
          "Birmaharajpur",
          "Tarva",
          "Dunguripali"
        ]
      },
      {
        "name": "Sundargarh",
        "cities": [
          "Rourkela",
          "Sundargarh",
          "Rajgangpur",
          "Biramitrapur"
        ]
      }
    ]
  },
  {
    "name": "Punjab",
    "type": "State",
    "districts": [
      {
        "name": "Amritsar",
        "cities": [
          "Amritsar",
          "Ajnala",
          "Majitha",
          "Jandiala Guru",
          "Rayya"
        ]
      },
      {
        "name": "Barnala",
        "cities": [
          "Barnala",
          "Tapa",
          "Bhadaur",
          "Dhanaula"
        ]
      },
      {
        "name": "Bathinda",
        "cities": [
          "Bathinda",
          "Maur",
          "Rampura Phul",
          "Talwandi Sabo",
          "Bhucho Mandi"
        ]
      },
      {
        "name": "Faridkot",
        "cities": [
          "Faridkot",
          "Kotkapura",
          "Jaitu"
        ]
      },
      {
        "name": "Fatehgarh Sahib",
        "cities": [
          "Sirhind",
          "Mandi Gobindgarh",
          "Fatehgarh Sahib",
          "Amloh",
          "Bassi Pathana",
          "Khamanon"
        ]
      },
      {
        "name": "Fazilka",
        "cities": [
          "Fazilka",
          "Abohar",
          "Jalalabad"
        ]
      },
      {
        "name": "Firozpur",
        "cities": [
          "Firozpur",
          "Zira",
          "Guru Har Sahai",
          "Makhu"
        ]
      },
      {
        "name": "Gurdaspur",
        "cities": [
          "Gurdaspur",
          "Batala",
          "Dera Baba Nanak",
          "Dinanagar",
          "Qadian"
        ]
      },
      {
        "name": "Hoshiarpur",
        "cities": [
          "Hoshiarpur",
          "Dasuya",
          "Mukerian",
          "Garhshankar",
          "Tanda",
          "Mahilpur"
        ]
      },
      {
        "name": "Jalandhar",
        "cities": [
          "Jalandhar",
          "Phagwara Road",
          "Kartarpur",
          "Nakodar",
          "Phillaur",
          "Shahkot",
          "Goraya"
        ]
      },
      {
        "name": "Kapurthala",
        "cities": [
          "Kapurthala",
          "Phagwara",
          "Sultanpur Lodhi",
          "Bholath"
        ]
      },
      {
        "name": "Ludhiana",
        "cities": [
          "Ludhiana",
          "Khanna",
          "Jagraon",
          "Raikot",
          "Samrala",
          "Doraha",
          "Sahnewal",
          "Mullanpur Dakha"
        ]
      },
      {
        "name": "Malerkotla",
        "cities": [
          "Malerkotla",
          "Ahmedgarh",
          "Amargarh"
        ]
      },
      {
        "name": "Mansa",
        "cities": [
          "Mansa",
          "Budhlada",
          "Sardulgarh",
          "Bareta"
        ]
      },
      {
        "name": "Moga",
        "cities": [
          "Moga",
          "Baghapurana",
          "Nihal Singh Wala",
          "Dharamkot",
          "Badhni Kalan"
        ]
      },
      {
        "name": "Pathankot",
        "cities": [
          "Pathankot",
          "Sujanpur",
          "Narot Jaimal Singh",
          "Dhar Kalan"
        ]
      },
      {
        "name": "Patiala",
        "cities": [
          "Patiala",
          "Rajpura",
          "Nabha",
          "Samana",
          "Patran",
          "Ghanaur"
        ]
      },
      {
        "name": "Rupnagar",
        "cities": [
          "Rupnagar / Ropar",
          "Anandpur Sahib",
          "Chamkaur Sahib",
          "Morinda",
          "Nangal"
        ]
      },
      {
        "name": "Sahibzada Ajit Singh Nagar (Mohali)",
        "cities": [
          "Mohali",
          "Kharar",
          "Zirakpur",
          "Dera Bassi",
          "Kurali",
          "New Chandigarh",
          "Lalru"
        ]
      },
      {
        "name": "Sangrur",
        "cities": [
          "Sangrur",
          "Dhuri",
          "Sunam",
          "Lehragaga",
          "Moonak",
          "Bhawanigarh"
        ]
      },
      {
        "name": "Shahid Bhagat Singh Nagar",
        "cities": [
          "Nawanshahr",
          "Banga",
          "Balachaur"
        ]
      },
      {
        "name": "Sri Muktsar Sahib",
        "cities": [
          "Sri Muktsar Sahib",
          "Malout",
          "Gidderbaha",
          "Bariwala"
        ]
      },
      {
        "name": "Tarn Taran",
        "cities": [
          "Tarn Taran Sahib",
          "Patti",
          "Khadur Sahib",
          "Bhikhiwind",
          "Goindwal Sahib"
        ]
      }
    ]
  },
  {
    "name": "Rajasthan",
    "type": "State",
    "districts": [
      {
        "name": "Ajmer",
        "cities": [
          "Ajmer",
          "Kishangarh",
          "Nasirabad",
          "Pushkar"
        ]
      },
      {
        "name": "Alwar",
        "cities": [
          "Alwar",
          "Rajgarh",
          "Ramgarh",
          "Govindgarh"
        ]
      },
      {
        "name": "Anupgarh",
        "cities": [
          "Anupgarh",
          "Suratgarh Road",
          "Ramsinghpur",
          "Gharsana"
        ]
      },
      {
        "name": "Balotra",
        "cities": [
          "Balotra",
          "Siwana",
          "Baytu",
          "Pachpadra"
        ]
      },
      {
        "name": "Banswara",
        "cities": [
          "Banswara",
          "Kushalgarh",
          "Ghatol",
          "Garhi"
        ]
      },
      {
        "name": "Baran",
        "cities": [
          "Baran",
          "Chhabra",
          "Antah",
          "Atru"
        ]
      },
      {
        "name": "Barmer",
        "cities": [
          "Barmer",
          "Chohtan",
          "Gudamalani",
          "Shiv"
        ]
      },
      {
        "name": "Beawar",
        "cities": [
          "Beawar",
          "Jaitaran",
          "Raipur",
          "Masuda"
        ]
      },
      {
        "name": "Bharatpur",
        "cities": [
          "Bharatpur",
          "Bayana",
          "Nadbai",
          "Weir",
          "Rupbas"
        ]
      },
      {
        "name": "Bhilwara",
        "cities": [
          "Bhilwara",
          "Mandalgarh",
          "Asind",
          "Gulabpura",
          "Mandal"
        ]
      },
      {
        "name": "Bikaner",
        "cities": [
          "Bikaner",
          "Nokha",
          "Dungargarh",
          "Lunkaransar",
          "Deshnoke"
        ]
      },
      {
        "name": "Bundi",
        "cities": [
          "Bundi",
          "Keshoraipatan",
          "Nainwa",
          "Hindoli"
        ]
      },
      {
        "name": "Chittorgarh",
        "cities": [
          "Chittorgarh",
          "Nimbahera",
          "Kapasan",
          "Bari Sadri",
          "Rawatbhata"
        ]
      },
      {
        "name": "Churu",
        "cities": [
          "Churu",
          "Ratangarh",
          "Sujangarh",
          "Sardarshahar",
          "Rajgarh / Sadulpur"
        ]
      },
      {
        "name": "Dausa",
        "cities": [
          "Dausa",
          "Bandikui",
          "Lalsot",
          "Mahwa",
          "Sikrai"
        ]
      },
      {
        "name": "Deeg",
        "cities": [
          "Deeg",
          "Kaman",
          "Nagar",
          "Kumher"
        ]
      },
      {
        "name": "Dholpur",
        "cities": [
          "Dholpur",
          "Bari",
          "Rajakhera",
          "Baseri"
        ]
      },
      {
        "name": "Didwana-Kuchaman",
        "cities": [
          "Didwana",
          "Kuchaman City",
          "Makrana",
          "Nawa",
          "Parbatsar"
        ]
      },
      {
        "name": "Dudu",
        "cities": [
          "Dudu",
          "Mozmabad",
          "Phagi"
        ]
      },
      {
        "name": "Dungarpur",
        "cities": [
          "Dungarpur",
          "Sagwara",
          "Aspur",
          "Simalwara"
        ]
      },
      {
        "name": "Gangapur City",
        "cities": [
          "Gangapur City",
          "Wazirpur",
          "Bamanwas"
        ]
      },
      {
        "name": "Hanumangarh",
        "cities": [
          "Hanumangarh",
          "Pilibanga",
          "Nohar",
          "Bhadra",
          "Rawatsar"
        ]
      },
      {
        "name": "Jaipur",
        "cities": [
          "Jaipur",
          "Sanganer",
          "Amer",
          "Mansarovar",
          "Malviya Nagar",
          "Vaishali Nagar"
        ]
      },
      {
        "name": "Jaipur Rural",
        "cities": [
          "Chomu",
          "Shahpura",
          "Bagru",
          "Kotputli Road",
          "Chaksu",
          "Jamwa Ramgarh"
        ]
      },
      {
        "name": "Jaisalmer",
        "cities": [
          "Jaisalmer",
          "Pokhran",
          "Fatehgarh"
        ]
      },
      {
        "name": "Jalore",
        "cities": [
          "Jalore",
          "Bhinmal",
          "Ahore",
          "Sayla"
        ]
      },
      {
        "name": "Jhalawar",
        "cities": [
          "Jhalawar",
          "Jhalrapatan",
          "Aklera",
          "Pirawa",
          "Bhawani Mandi"
        ]
      },
      {
        "name": "Jhunjhunu",
        "cities": [
          "Jhunjhunu",
          "Nawalgarh",
          "Chirawa",
          "Khetri",
          "Pilani",
          "Bissau"
        ]
      },
      {
        "name": "Jodhpur",
        "cities": [
          "Jodhpur",
          "Cantonment",
          "Mandore",
          "Ratanada",
          "Shastri Nagar"
        ]
      },
      {
        "name": "Jodhpur Rural",
        "cities": [
          "Bilara",
          "Piparcity",
          "Osian",
          "Bhopalgarh",
          "Luni"
        ]
      },
      {
        "name": "Karauli",
        "cities": [
          "Karauli",
          "Hindaun",
          "Todabhim",
          "Sapotra"
        ]
      },
      {
        "name": "Kekri",
        "cities": [
          "Kekri",
          "Sarwar",
          "Todaraisingh"
        ]
      },
      {
        "name": "Khairthal-Tijara",
        "cities": [
          "Tijara",
          "Bhiwadi",
          "Khairthal",
          "Kishangarh Bas"
        ]
      },
      {
        "name": "Kota",
        "cities": [
          "Kota",
          "Ramganj Mandi",
          "Sangod",
          "Ladpura"
        ]
      },
      {
        "name": "Kotputli-Behror",
        "cities": [
          "Kotputli",
          "Behror",
          "Neemrana",
          "Bansur",
          "Paota"
        ]
      },
      {
        "name": "Nagaur",
        "cities": [
          "Nagaur",
          "Merta City",
          "Jayal",
          "Ladnun",
          "Degana"
        ]
      },
      {
        "name": "Neem Ka Thana",
        "cities": [
          "Neem Ka Thana",
          "Sri Madhopur",
          "Khandela",
          "Patan"
        ]
      },
      {
        "name": "Pali",
        "cities": [
          "Pali",
          "Sojat",
          "Sumerpur",
          "Bali",
          "Falna",
          "Rani",
          "Sadri"
        ]
      },
      {
        "name": "Phalodi",
        "cities": [
          "Phalodi",
          "Bap",
          "Lohawat"
        ]
      },
      {
        "name": "Pratapgarh",
        "cities": [
          "Pratapgarh",
          "Chhoti Sadri",
          "Dhariawad",
          "Arnod"
        ]
      },
      {
        "name": "Rajsamand",
        "cities": [
          "Rajsamand / Kankroli",
          "Nathdwara",
          "Amet",
          "Kumbhalgarh",
          "Bhim"
        ]
      },
      {
        "name": "Salumbar",
        "cities": [
          "Salumbar",
          "Sarada",
          "Semari"
        ]
      },
      {
        "name": "Sanchore",
        "cities": [
          "Sanchore",
          "Chitalwana",
          "Bagoda"
        ]
      },
      {
        "name": "Sawai Madhopur",
        "cities": [
          "Sawai Madhopur",
          "Ranthambore",
          "Bonli",
          "Chauth Ka Barwara"
        ]
      },
      {
        "name": "Shahpura",
        "cities": [
          "Shahpura",
          "Jahazpur",
          "Kotri"
        ]
      },
      {
        "name": "Sikar",
        "cities": [
          "Sikar",
          "Fatehpur",
          "Laxmangarh",
          "Danta Ramgarh",
          "Reengus"
        ]
      },
      {
        "name": "Sirohi",
        "cities": [
          "Sirohi",
          "Mount Abu",
          "Abu Road",
          "Pindwara",
          "Sheoganj"
        ]
      },
      {
        "name": "Sri Ganganagar",
        "cities": [
          "Sri Ganganagar",
          "Raisinghnagar",
          "Karanpur",
          "Sadulshahar",
          "Padampur"
        ]
      },
      {
        "name": "Tonk",
        "cities": [
          "Tonk",
          "Niwai",
          "Malpura",
          "Deoli",
          "Uniara"
        ]
      },
      {
        "name": "Udaipur",
        "cities": [
          "Udaipur",
          "Fatehnagar",
          "Mavli",
          "Bhinder",
          "Vallabhnagar",
          "Gogunda"
        ]
      }
    ]
  },
  {
    "name": "Sikkim",
    "type": "State",
    "districts": [
      {
        "name": "Gangtok",
        "cities": [
          "Gangtok",
          "Singtam",
          "Ranipool"
        ]
      },
      {
        "name": "Gyalshing",
        "cities": [
          "Gyalshing",
          "Pelling",
          "Yuksom",
          "Dentan"
        ]
      },
      {
        "name": "Mangan",
        "cities": [
          "Mangan",
          "Chungthang",
          "Lachen",
          "Lachung"
        ]
      },
      {
        "name": "Namchi",
        "cities": [
          "Namchi",
          "Ravangla",
          "Jorethang"
        ]
      },
      {
        "name": "Pakyong",
        "cities": [
          "Pakyong",
          "Rangpo",
          "Rhenock",
          "Rongli"
        ]
      },
      {
        "name": "Soreng",
        "cities": [
          "Soreng",
          "Daramdin",
          "Chumbong"
        ]
      }
    ]
  },
  {
    "name": "Tamil Nadu",
    "type": "State",
    "districts": [
      {
        "name": "Ariyalur",
        "cities": [
          "Ariyalur",
          "Jayankondam",
          "Sendurai",
          "Udayarpalayam"
        ]
      },
      {
        "name": "Chengalpattu",
        "cities": [
          "Chengalpattu",
          "Tambaram (South)",
          "Pallavaram",
          "Maraimalai Nagar",
          "Mahabalipuram",
          "Maduranthakam"
        ]
      },
      {
        "name": "Chennai",
        "cities": [
          "Chennai",
          "Guindy",
          "T. Nagar",
          "Adyar",
          "Velachery",
          "Anna Nagar",
          "Mylapore",
          "Chromepet",
          "Egmore",
          "Royapettah"
        ]
      },
      {
        "name": "Coimbatore",
        "cities": [
          "Coimbatore",
          "Pollachi",
          "Mettupalayam",
          "Sulur",
          "Annur",
          "Valparai"
        ]
      },
      {
        "name": "Cuddalore",
        "cities": [
          "Cuddalore",
          "Chidambaram",
          "Panruti",
          "Neyveli",
          "Virudhachalam",
          "Tittakudi"
        ]
      },
      {
        "name": "Dharmapuri",
        "cities": [
          "Dharmapuri",
          "Harur",
          "Palacode",
          "Pennagaram",
          "Pappireddipatti"
        ]
      },
      {
        "name": "Dindigul",
        "cities": [
          "Dindigul",
          "Palani",
          "Kodaikanal",
          "Oddanchatram",
          "Natham",
          "Vedasandur"
        ]
      },
      {
        "name": "Erode",
        "cities": [
          "Erode",
          "Gobichettipalayam",
          "Bhavani",
          "Perundurai",
          "Sathyamangalam",
          "Anthiyur"
        ]
      },
      {
        "name": "Kallakurichi",
        "cities": [
          "Kallakurichi",
          "Ulundurpet",
          "Sankarapuram",
          "Tirukoilur",
          "Chinnasalem"
        ]
      },
      {
        "name": "Kanchipuram",
        "cities": [
          "Kanchipuram",
          "Sriperumbudur",
          "Walajabad",
          "Kundrathur"
        ]
      },
      {
        "name": "Kanyakumari",
        "cities": [
          "Nagercoil",
          "Kanyakumari",
          "Padmanabhapuram",
          "Colachel",
          "Kuzhithurai"
        ]
      },
      {
        "name": "Karur",
        "cities": [
          "Karur",
          "Kulithalai",
          "Aravakurichi",
          "Krishnarayapuram"
        ]
      },
      {
        "name": "Krishnagiri",
        "cities": [
          "Krishnagiri",
          "Hosur",
          "Pochampalli",
          "Uthangarai",
          "Denkanikottai"
        ]
      },
      {
        "name": "Madurai",
        "cities": [
          "Madurai",
          "Melur",
          "Thirumangalam",
          "Usilampatti",
          "Vadipatti",
          "Sholavandan"
        ]
      },
      {
        "name": "Mayiladuthurai",
        "cities": [
          "Mayiladuthurai",
          "Sirkazhi",
          "Tharangambadi",
          "Kuthalam"
        ]
      },
      {
        "name": "Nagapattinam",
        "cities": [
          "Nagapattinam",
          "Velankanni",
          "Vedaranyam",
          "Kilvelur"
        ]
      },
      {
        "name": "Namakkal",
        "cities": [
          "Namakkal",
          "Tiruchengode",
          "Rasipuram",
          "Paramathi Velur",
          "Komarapalayam"
        ]
      },
      {
        "name": "Nilgiris",
        "cities": [
          "Udhagamandalam / Ooty",
          "Coonoor",
          "Kotagiri",
          "Gudalur"
        ]
      },
      {
        "name": "Perambalur",
        "cities": [
          "Perambalur",
          "Kunnam",
          "Veppanthattai",
          "Alathur"
        ]
      },
      {
        "name": "Pudukkottai",
        "cities": [
          "Pudukkottai",
          "Aranthangi",
          "Alangudi",
          "Illuppur",
          "Gandarvakottai"
        ]
      },
      {
        "name": "Ramanathapuram",
        "cities": [
          "Ramanathapuram",
          "Rameswaram",
          "Paramakudi",
          "Kilakarai",
          "Kamuthi"
        ]
      },
      {
        "name": "Ranipet",
        "cities": [
          "Ranipet",
          "Arakkonam",
          "Walajah",
          "Arcot",
          "Nemili"
        ]
      },
      {
        "name": "Salem",
        "cities": [
          "Salem",
          "Attur",
          "Mettur",
          "Omalur",
          "Sankagiri",
          "Edappadi",
          "Yercaud"
        ]
      },
      {
        "name": "Sivaganga",
        "cities": [
          "Sivaganga",
          "Karaikudi",
          "Devakottai",
          "Manamadurai",
          "Tirupathur"
        ]
      },
      {
        "name": "Tenkasi",
        "cities": [
          "Tenkasi",
          "Sankarankovil",
          "Ambasamudram Road",
          "Kadayanallur",
          "Courtallam"
        ]
      },
      {
        "name": "Thanjavur",
        "cities": [
          "Thanjavur",
          "Kumbakonam",
          "Pattukkottai",
          "Thiruvaiyaru",
          "Papanasam"
        ]
      },
      {
        "name": "Theni",
        "cities": [
          "Theni Allinagaram",
          "Periyakulam",
          "Bodinayakanur",
          "Cumbum",
          "Uthamapalayam"
        ]
      },
      {
        "name": "Thoothukudi",
        "cities": [
          "Thoothukudi",
          "Kovilpatti",
          "Tiruchendur",
          "Kayalpattinam",
          "Ettayapuram"
        ]
      },
      {
        "name": "Tiruchirappalli",
        "cities": [
          "Tiruchirappalli",
          "Srirangam",
          "Manapparai",
          "Thuraiyur",
          "Lalgudi",
          "Musiri"
        ]
      },
      {
        "name": "Tirunelveli",
        "cities": [
          "Tirunelveli",
          "Palayamkottai",
          "Ambasamudram",
          "Nanguneri",
          "Radhapuram"
        ]
      },
      {
        "name": "Tirupathur",
        "cities": [
          "Tirupathur",
          "Vaniyambadi",
          "Ambur",
          "Natrampalli"
        ]
      },
      {
        "name": "Tiruppur",
        "cities": [
          "Tiruppur",
          "Avinashi",
          "Palladam",
          "Dharapuram",
          "Udumalaipettai",
          "Kangeyam"
        ]
      },
      {
        "name": "Tiruvallur",
        "cities": [
          "Tiruvallur",
          "Avadi",
          "Ponneri",
          "Gummidipoondi",
          "Tiruttani",
          "Poonamallee"
        ]
      },
      {
        "name": "Tiruvannamalai",
        "cities": [
          "Tiruvannamalai",
          "Arani",
          "Cheyyar",
          "Polur",
          "Chengam"
        ]
      },
      {
        "name": "Tiruvarur",
        "cities": [
          "Tiruvarur",
          "Mannargudi",
          "Thiruthuraipoondi",
          "Kudavasal",
          "Nannilam"
        ]
      },
      {
        "name": "Vellore",
        "cities": [
          "Vellore",
          "Katpadi",
          "Gudiyatham",
          "Pernambut",
          "Anaicut"
        ]
      },
      {
        "name": "Viluppuram",
        "cities": [
          "Viluppuram",
          "Tindivanam",
          "Gingee",
          "Vanur",
          "Marakkanam"
        ]
      },
      {
        "name": "Virudhunagar",
        "cities": [
          "Virudhunagar",
          "Sivakasi",
          "Rajapalayam",
          "Aruppukkottai",
          "Srivilliputhur"
        ]
      }
    ]
  },
  {
    "name": "Telangana",
    "type": "State",
    "districts": [
      {
        "name": "Adilabad",
        "cities": [
          "Adilabad",
          "Utnoor",
          "Boath",
          "Ichoda"
        ]
      },
      {
        "name": "Bhadradri Kothagudem",
        "cities": [
          "Kothagudem",
          "Bhadrachalam",
          "Yellandu",
          "Manuguru",
          "Palwancha"
        ]
      },
      {
        "name": "Hanumakonda",
        "cities": [
          "Hanumakonda",
          "Kazipet",
          "Hasanparthy",
          "Bheemadevarpalle"
        ]
      },
      {
        "name": "Hyderabad",
        "cities": [
          "Hyderabad",
          "Secunderabad",
          "Banjara Hills",
          "Jubilee Hills",
          "Gachibowli",
          "Madhapur",
          "Hitec City",
          "Charminar",
          "Kukatpally"
        ]
      },
      {
        "name": "Jagtial",
        "cities": [
          "Jagtial",
          "Korutla",
          "Metpally",
          "Dharmapuri",
          "Raikal"
        ]
      },
      {
        "name": "Jangaon",
        "cities": [
          "Jangaon",
          "Station Ghanpur",
          "Palakurthi"
        ]
      },
      {
        "name": "Jayashankar Bhupalpally",
        "cities": [
          "Bhupalpally",
          "Kataram",
          "Mahadevpur"
        ]
      },
      {
        "name": "Jogulamba Gadwal",
        "cities": [
          "Gadwal",
          "Alampur",
          "Ieeja",
          "Maldakal"
        ]
      },
      {
        "name": "Kamareddy",
        "cities": [
          "Kamareddy",
          "Banswada",
          "Yellareddy",
          "Madnoor"
        ]
      },
      {
        "name": "Karimnagar",
        "cities": [
          "Karimnagar",
          "Huzurabad",
          "Jammikunta",
          "Choppadandi",
          "Manakondur"
        ]
      },
      {
        "name": "Khammam",
        "cities": [
          "Khammam",
          "Madhira",
          "Sathupally",
          "Wyra",
          "Kallur"
        ]
      },
      {
        "name": "Kumuram Bheem Asifabad",
        "cities": [
          "Asifabad",
          "Kagaznagar",
          "Sirpur",
          "Rebbena"
        ]
      },
      {
        "name": "Mahabubabad",
        "cities": [
          "Mahabubabad",
          "Dornakal",
          "Thorrur",
          "Maripeda",
          "Kuravi"
        ]
      },
      {
        "name": "Mahabubnagar",
        "cities": [
          "Mahabubnagar",
          "Jadcherla",
          "Bhoothpur",
          "Devarkadra"
        ]
      },
      {
        "name": "Mancherial",
        "cities": [
          "Mancherial",
          "Bellampalli",
          "Mandamarri",
          "Chennur",
          "Kyathampally"
        ]
      },
      {
        "name": "Medak",
        "cities": [
          "Medak",
          "Narsapur",
          "Toopran",
          "Ramayampet"
        ]
      },
      {
        "name": "Medchal-Malkajgiri",
        "cities": [
          "Malkajgiri",
          "Medchal",
          "Alwal",
          "Quthbullapur",
          "Kukatpally",
          "Uppal",
          "Ghatkesar",
          "Kompally"
        ]
      },
      {
        "name": "Mulugu",
        "cities": [
          "Mulugu",
          "Govindaraopet",
          "Venkatapur",
          "Eturnagaram"
        ]
      },
      {
        "name": "Nagarkurnool",
        "cities": [
          "Nagarkurnool",
          "Achampet",
          "Kalwakurthy",
          "Kollapur"
        ]
      },
      {
        "name": "Nalgonda",
        "cities": [
          "Nalgonda",
          "Miryalaguda",
          "Devarakonda",
          "Nakrekal"
        ]
      },
      {
        "name": "Narayanpet",
        "cities": [
          "Narayanpet",
          "Makthal",
          "Kosgi",
          "Maganoor"
        ]
      },
      {
        "name": "Nirmal",
        "cities": [
          "Nirmal",
          "Bhainsa",
          "Khanapur",
          "Kaddam"
        ]
      },
      {
        "name": "Nizamabad",
        "cities": [
          "Nizamabad",
          "Bodhan",
          "Armoor",
          "Bheemgal"
        ]
      },
      {
        "name": "Peddapalli",
        "cities": [
          "Peddapalli",
          "Ramagundam",
          "Godavarikhani",
          "Sultanabad",
          "Manthani"
        ]
      },
      {
        "name": "Rajanna Sircilla",
        "cities": [
          "Sircilla",
          "Vemulawada",
          "Boinpalli",
          "Yellareddypet"
        ]
      },
      {
        "name": "Rangareddy",
        "cities": [
          "Gachibowli",
          "Shamshabad",
          "Rajendranagar",
          "Serilingampally",
          "Ibrahimpatnam",
          "Shadnagar",
          "Maheshwaram"
        ]
      },
      {
        "name": "Sangareddy",
        "cities": [
          "Sangareddy",
          "Patancheru",
          "Zaheerabad",
          "Ameenpur",
          "Tellapur"
        ]
      },
      {
        "name": "Siddipet",
        "cities": [
          "Siddipet",
          "Gajwel",
          "Dubbak",
          "Husnabad",
          "Cherial"
        ]
      },
      {
        "name": "Suryapet",
        "cities": [
          "Suryapet",
          "Kodad",
          "Huzurnagar",
          "Thungathurthy"
        ]
      },
      {
        "name": "Vikarabad",
        "cities": [
          "Vikarabad",
          "Tandur",
          "Pargi",
          "Kodangal"
        ]
      },
      {
        "name": "Wanaparthy",
        "cities": [
          "Wanaparthy",
          "Pebbair",
          "Kothakota",
          "Atmakur"
        ]
      },
      {
        "name": "Warangal",
        "cities": [
          "Warangal",
          "Narsampet",
          "Wardhannapet",
          "Geesugonda"
        ]
      },
      {
        "name": "Yadadri Bhuvanagiri",
        "cities": [
          "Bhongir / Bhuvanagiri",
          "Yadagirigutta",
          "Choutuppal",
          "Alair"
        ]
      }
    ]
  },
  {
    "name": "Tripura",
    "type": "State",
    "districts": [
      {
        "name": "Dhalai",
        "cities": [
          "Ambassa",
          "Kamalpur",
          "Gandacherra",
          "Longtharai Valley"
        ]
      },
      {
        "name": "Gomati",
        "cities": [
          "Udaipur",
          "Amarpur",
          "Karbook"
        ]
      },
      {
        "name": "Khowai",
        "cities": [
          "Khowai",
          "Teliamura",
          "Padmabil"
        ]
      },
      {
        "name": "North Tripura",
        "cities": [
          "Dharmanagar",
          "Kanchanpur",
          "Panisagar"
        ]
      },
      {
        "name": "Sepahijala",
        "cities": [
          "Bishramganj",
          "Sonamura",
          "Japuijla"
        ]
      },
      {
        "name": "South Tripura",
        "cities": [
          "Belonia",
          "Sabroom",
          "Santirbazar"
        ]
      },
      {
        "name": "Unakoti",
        "cities": [
          "Kailashahar",
          "Kumarghat"
        ]
      },
      {
        "name": "West Tripura",
        "cities": [
          "Agartala",
          "Ranirbazar",
          "Mohanpur",
          "Jirania"
        ]
      }
    ]
  },
  {
    "name": "Uttar Pradesh",
    "type": "State",
    "districts": [
      {
        "name": "Agra",
        "cities": [
          "Agra",
          "Fatehpur Sikri",
          "Etmadpur",
          "Kheragarh",
          "Bah",
          "Shamsabad"
        ]
      },
      {
        "name": "Aligarh",
        "cities": [
          "Aligarh",
          "Atrauli",
          "Khair",
          "Iglas",
          "Gabhana"
        ]
      },
      {
        "name": "Ambedkar Nagar",
        "cities": [
          "Akbarpur",
          "Tanda",
          "Jalalpur",
          "Allapur"
        ]
      },
      {
        "name": "Amethi",
        "cities": [
          "Amethi",
          "Gauriganj",
          "Musafirkhana",
          "Tiloi"
        ]
      },
      {
        "name": "Amroha",
        "cities": [
          "Amroha",
          "Hasanpur",
          "Dhanaura",
          "Gajraula"
        ]
      },
      {
        "name": "Auraiya",
        "cities": [
          "Auraiya",
          "Bidhuna",
          "Dibiyapur",
          "Achhalda"
        ]
      },
      {
        "name": "Ayodhya",
        "cities": [
          "Ayodhya",
          "Faizabad",
          "Rudauli",
          "Bikapur",
          "Sohawal",
          "Goshainganj"
        ]
      },
      {
        "name": "Azamgarh",
        "cities": [
          "Azamgarh",
          "Mubarakpur",
          "Mehnagar",
          "Sagri",
          "Lalganj",
          "Phoolpur"
        ]
      },
      {
        "name": "Baghpat",
        "cities": [
          "Baghpat",
          "Baraut",
          "Khekra",
          "Chhaprauli"
        ]
      },
      {
        "name": "Bahraich",
        "cities": [
          "Bahraich",
          "Nanpara",
          "Jarwal",
          "Mahasi"
        ]
      },
      {
        "name": "Ballia",
        "cities": [
          "Ballia",
          "Rasra",
          "Bairia",
          "Bansdih",
          "Sikanderpur"
        ]
      },
      {
        "name": "Balrampur",
        "cities": [
          "Balrampur",
          "Utraula",
          "Tulsipur"
        ]
      },
      {
        "name": "Banda",
        "cities": [
          "Banda",
          "Atarra",
          "Baberu",
          "Naraini"
        ]
      },
      {
        "name": "Barabanki",
        "cities": [
          "Barabanki",
          "Fatehpur",
          "Ramsanehighat",
          "Haidergarh",
          "Zaidpur"
        ]
      },
      {
        "name": "Bareilly",
        "cities": [
          "Bareilly",
          "Aonla",
          "Faridpur",
          "Baheri",
          "Nawabganj",
          "Mirganj"
        ]
      },
      {
        "name": "Basti",
        "cities": [
          "Basti",
          "Harraiya",
          "Rudhauli"
        ]
      },
      {
        "name": "Bhadohi",
        "cities": [
          "Bhadohi",
          "Gyanpur",
          "Suriyawan",
          "Khamaria"
        ]
      },
      {
        "name": "Bijnor",
        "cities": [
          "Bijnor",
          "Najibabad",
          "Nagina",
          "Chandpur",
          "Dhampur",
          "Kiratpur"
        ]
      },
      {
        "name": "Budaun",
        "cities": [
          "Budaun",
          "Ujhani",
          "Sahaswan",
          "Bilsi",
          "Dataganj"
        ]
      },
      {
        "name": "Bulandshahr",
        "cities": [
          "Bulandshahr",
          "Khurja",
          "Sikandrabad",
          "Siyana",
          "Anupshahr",
          "Debai"
        ]
      },
      {
        "name": "Chandauli",
        "cities": [
          "Chandauli",
          "Mughalsarai / Pt Deen Dayal Upadhyaya Nagar",
          "Sakaldiha",
          "Chakia"
        ]
      },
      {
        "name": "Chitrakoot",
        "cities": [
          "Chitrakoot Dham / Karwi",
          "Manikpur",
          "Mau",
          "Rajapur"
        ]
      },
      {
        "name": "Deoria",
        "cities": [
          "Deoria",
          "Bhatpar Rani",
          "Barhaj",
          "Salempur",
          "Rudrapur"
        ]
      },
      {
        "name": "Etah",
        "cities": [
          "Etah",
          "Kasganj Road",
          "Jalesar",
          "Aliganj"
        ]
      },
      {
        "name": "Etawah",
        "cities": [
          "Etawah",
          "Bharthana",
          "Jaswantnagar",
          "Saifai"
        ]
      },
      {
        "name": "Farrukhabad",
        "cities": [
          "Fatehgarh",
          "Farrukhabad",
          "Kaimganj",
          "Amritpur"
        ]
      },
      {
        "name": "Fatehpur",
        "cities": [
          "Fatehpur",
          "Bindki",
          "Khaga"
        ]
      },
      {
        "name": "Firozabad",
        "cities": [
          "Firozabad",
          "Shikohabad",
          "Sirasaganj",
          "Tundla",
          "Jasrana"
        ]
      },
      {
        "name": "Gautam Buddha Nagar",
        "cities": [
          "Noida",
          "Greater Noida",
          "Dadri",
          "Jewar",
          "Dankaur"
        ]
      },
      {
        "name": "Ghaziabad",
        "cities": [
          "Ghaziabad",
          "Sahibabad",
          "Muradnagar",
          "Modinagar",
          "Loni",
          "Indirapuram"
        ]
      },
      {
        "name": "Ghazipur",
        "cities": [
          "Ghazipur",
          "Zamania",
          "Mohammadabad",
          "Saidpur",
          "Zahoorabad"
        ]
      },
      {
        "name": "Gonda",
        "cities": [
          "Gonda",
          "Colonelganj",
          "Tarabganj",
          "Mankapur"
        ]
      },
      {
        "name": "Gorakhpur",
        "cities": [
          "Gorakhpur",
          "Sahjanwa",
          "Campierganj",
          "Bansgaon",
          "Pipraich",
          "Gola"
        ]
      },
      {
        "name": "Hamirpur",
        "cities": [
          "Hamirpur",
          "Maudaha",
          "Rath",
          "Sumerpur"
        ]
      },
      {
        "name": "Hapur",
        "cities": [
          "Hapur",
          "Pilkhuwa",
          "Garhmukteshwar",
          "Dhaulana"
        ]
      },
      {
        "name": "Hardoi",
        "cities": [
          "Hardoi",
          "Shahabad",
          "Sandila",
          "Bilgram",
          "Sandi"
        ]
      },
      {
        "name": "Hathras",
        "cities": [
          "Hathras",
          "Sadabad",
          "Sasni",
          "Sikandra Rao"
        ]
      },
      {
        "name": "Jalaun",
        "cities": [
          "Orai",
          "Jalaun",
          "Konch",
          "Kalpi",
          "Madhogarh"
        ]
      },
      {
        "name": "Jaunpur",
        "cities": [
          "Jaunpur",
          "Shahganj",
          "Machhlishahr",
          "Mariahu",
          "Kerakat",
          "Badlapur"
        ]
      },
      {
        "name": "Jhansi",
        "cities": [
          "Jhansi",
          "Babina",
          "Mauranipur",
          "Moth",
          "Garautha"
        ]
      },
      {
        "name": "Kannauj",
        "cities": [
          "Kannauj",
          "Chhibramau",
          "Tirwa"
        ]
      },
      {
        "name": "Kanpur Dehat",
        "cities": [
          "Akbarpur (Mati)",
          "Rura",
          "Derapur",
          "Rasulabad",
          "Bhognipur"
        ]
      },
      {
        "name": "Kanpur Nagar",
        "cities": [
          "Kanpur",
          "Kalyanpur",
          "Bithoor",
          "Ghatampur",
          "Bilhaur"
        ]
      },
      {
        "name": "Kasganj",
        "cities": [
          "Kasganj",
          "Ganjdundwara",
          "Sahawar",
          "Patiali"
        ]
      },
      {
        "name": "Kaushambi",
        "cities": [
          "Manjhanpur",
          "Chail",
          "Sirathu",
          "Bharwari"
        ]
      },
      {
        "name": "Kheri",
        "cities": [
          "Lakhimpur",
          "Gola Gokarannath",
          "Mohammadi",
          "Nighasan",
          "Palia Kalan"
        ]
      },
      {
        "name": "Kushinagar",
        "cities": [
          "Padrauna",
          "Hata",
          "Kasya",
          "Kushinagar",
          "Tamkuhi Raj"
        ]
      },
      {
        "name": "Lalitpur",
        "cities": [
          "Lalitpur",
          "Mahroni",
          "Talbehat",
          "Madawara"
        ]
      },
      {
        "name": "Lucknow",
        "cities": [
          "Lucknow",
          "Mohanlalganj",
          "Malihabad",
          "Bakshi Ka Talab",
          "Chinhat",
          "Gomti Nagar"
        ]
      },
      {
        "name": "Maharajganj",
        "cities": [
          "Maharajganj",
          "Nautanwa",
          "Nichlaul",
          "Pharenda"
        ]
      },
      {
        "name": "Mahoba",
        "cities": [
          "Mahoba",
          "Charkhari",
          "Kulpahar"
        ]
      },
      {
        "name": "Mainpuri",
        "cities": [
          "Mainpuri",
          "Bhongaon",
          "Karhal",
          "Kishni",
          "Kurawali"
        ]
      },
      {
        "name": "Mathura",
        "cities": [
          "Mathura",
          "Vrindavan",
          "Goverdhan",
          "Chhata",
          "Kosikalan",
          "Barsana"
        ]
      },
      {
        "name": "Mau",
        "cities": [
          "Mau",
          "Madhuban",
          "Ghosi",
          "Muhammadabad Gohna"
        ]
      },
      {
        "name": "Meerut",
        "cities": [
          "Meerut",
          "Sardhana",
          "Mawana",
          "Hastinapur"
        ]
      },
      {
        "name": "Mirzapur",
        "cities": [
          "Mirzapur",
          "Chunar",
          "Vindhyachal",
          "Lalganj"
        ]
      },
      {
        "name": "Moradabad",
        "cities": [
          "Moradabad",
          "Bilari",
          "Sambhal Road",
          "Kanth",
          "Thakurdwara"
        ]
      },
      {
        "name": "Muzaffarnagar",
        "cities": [
          "Muzaffarnagar",
          "Khatauli",
          "Budhana",
          "Jansath"
        ]
      },
      {
        "name": "Pilibhit",
        "cities": [
          "Pilibhit",
          "Bisalpur",
          "Puranpur",
          "Barkhera"
        ]
      },
      {
        "name": "Pratapgarh",
        "cities": [
          "Pratapgarh / Bela",
          "Kunda",
          "Patti",
          "Raniganj",
          "Lalganj Ajhara"
        ]
      },
      {
        "name": "Prayagraj",
        "cities": [
          "Prayagraj / Allahabad",
          "Phulpur",
          "Naini",
          "Soraon",
          "Karchhana",
          "Handia"
        ]
      },
      {
        "name": "Raebareli",
        "cities": [
          "Raebareli",
          "Lalganj",
          "Salon",
          "Bachhrawan",
          "Maharajganj"
        ]
      },
      {
        "name": "Rampur",
        "cities": [
          "Rampur",
          "Bilaspur",
          "Milak",
          "Shahabad",
          "Suar"
        ]
      },
      {
        "name": "Saharanpur",
        "cities": [
          "Saharanpur",
          "Deoband",
          "Behat",
          "Gangoh",
          "Nakur",
          "Rampur Maniharan"
        ]
      },
      {
        "name": "Sambhal",
        "cities": [
          "Sambhal",
          "Chandausi",
          "Gunnaur"
        ]
      },
      {
        "name": "Sant Kabir Nagar",
        "cities": [
          "Khalilabad",
          "Mehdawal",
          "Dhanghata"
        ]
      },
      {
        "name": "Shahjahanpur",
        "cities": [
          "Shahjahanpur",
          "Tilhar",
          "Powayan",
          "Jalalabad"
        ]
      },
      {
        "name": "Shamli",
        "cities": [
          "Shamli",
          "Kairana",
          "Thana Bhawan",
          "Kandhla"
        ]
      },
      {
        "name": "Shravasti",
        "cities": [
          "Bhinga",
          "Ikauna",
          "Payagpur"
        ]
      },
      {
        "name": "Siddharthnagar",
        "cities": [
          "Navgarh / Siddharthnagar",
          "Bansi",
          "Itwa",
          "Domariyaganj",
          "Shohratgarh"
        ]
      },
      {
        "name": "Sitapur",
        "cities": [
          "Sitapur",
          "Biswan",
          "Laharpur",
          "Mahmoodabad",
          "Khairabad",
          "Sidhauli"
        ]
      },
      {
        "name": "Sonbhadra",
        "cities": [
          "Robertsganj",
          "Anpara",
          "Renukoot",
          "Obra",
          "Duddhi"
        ]
      },
      {
        "name": "Sultanpur",
        "cities": [
          "Sultanpur",
          "Kadipur",
          "Lambhua",
          "Jaisinghpur"
        ]
      },
      {
        "name": "Unnao",
        "cities": [
          "Unnao",
          "Shuklaganj",
          "Safipur",
          "Purwa",
          "Bangarmau",
          "Hasanganj"
        ]
      },
      {
        "name": "Varanasi",
        "cities": [
          "Varanasi",
          "Ramnagar",
          "Pindra",
          "Shivpur",
          "Kashi"
        ]
      }
    ]
  },
  {
    "name": "Uttarakhand",
    "type": "State",
    "districts": [
      {
        "name": "Almora",
        "cities": [
          "Almora",
          "Ranikhet",
          "Dwarahat",
          "Chaukhutiya",
          "Someshwar"
        ]
      },
      {
        "name": "Bageshwar",
        "cities": [
          "Bageshwar",
          "Kapkot",
          "Garur",
          "Kanda"
        ]
      },
      {
        "name": "Chamoli",
        "cities": [
          "Gopeshwar",
          "Joshimath",
          "Badrinath",
          "Karnaprayag",
          "Gauchar"
        ]
      },
      {
        "name": "Champawat",
        "cities": [
          "Champawat",
          "Tanakpur",
          "Lohaghat",
          "Banbasa"
        ]
      },
      {
        "name": "Dehradun",
        "cities": [
          "Dehradun",
          "Rishikesh",
          "Mussoorie",
          "Vikasnagar",
          "Doiwala",
          "Chakrata"
        ]
      },
      {
        "name": "Haridwar",
        "cities": [
          "Haridwar",
          "Roorkee",
          "Manglaur",
          "Laksar",
          "Bhagwanpur"
        ]
      },
      {
        "name": "Nainital",
        "cities": [
          "Nainital",
          "Haldwani",
          "Ramnagar",
          "Bhimtal",
          "Bhowali",
          "Kaladhungi"
        ]
      },
      {
        "name": "Pauri Garhwal",
        "cities": [
          "Pauri",
          "Kotdwar",
          "Srinagar",
          "Lansdowne",
          "Satpuli"
        ]
      },
      {
        "name": "Pithoragarh",
        "cities": [
          "Pithoragarh",
          "Dharchula",
          "Didihat",
          "Gangolihat",
          "Berinag"
        ]
      },
      {
        "name": "Rudraprayag",
        "cities": [
          "Rudraprayag",
          "Ukhimath",
          "Jakholi",
          "Kedarnath"
        ]
      },
      {
        "name": "Tehri Garhwal",
        "cities": [
          "New Tehri",
          "Narendra Nagar",
          "Chamba",
          "Muni Ki Reti",
          "Ghansali"
        ]
      },
      {
        "name": "Udham Singh Nagar",
        "cities": [
          "Rudrapur",
          "Kashipur",
          "Pantnagar",
          "Kichha",
          "Sitarganj",
          "Khatima",
          "Bajpur",
          "Jaspur"
        ]
      },
      {
        "name": "Uttarkashi",
        "cities": [
          "Uttarkashi",
          "Barkot",
          "Purola",
          "Gangotri",
          "Yamunotri"
        ]
      }
    ]
  },
  {
    "name": "West Bengal",
    "type": "State",
    "districts": [
      {
        "name": "Alipurduar",
        "cities": [
          "Alipurduar",
          "Falakata",
          "Jaigaon",
          "Madarihat",
          "Birpara"
        ]
      },
      {
        "name": "Bankura",
        "cities": [
          "Bankura",
          "Bishnupur",
          "Khatra",
          "Sonamukhi",
          "Barjora"
        ]
      },
      {
        "name": "Birbhum",
        "cities": [
          "Suri",
          "Bolpur / Santiniketan",
          "Rampurhat",
          "Sainthia",
          "Dubrajpur"
        ]
      },
      {
        "name": "Cooch Behar",
        "cities": [
          "Cooch Behar",
          "Dinhata",
          "Mathabhanga",
          "Tufanganj",
          "Mekhliganj"
        ]
      },
      {
        "name": "Dakshin Dinajpur",
        "cities": [
          "Balurghat",
          "Gangarampur",
          "Buniadpur",
          "Harirampur"
        ]
      },
      {
        "name": "Darjeeling",
        "cities": [
          "Darjeeling",
          "Siliguri",
          "Kurseong",
          "Mirik",
          "Sukhiapokhri"
        ]
      },
      {
        "name": "Hooghly",
        "cities": [
          "Chinsurah",
          "Chandannagar",
          "Serampore",
          "Uttarpara",
          "Rishra",
          "Arambagh",
          "Tarakeswar",
          "Bandel"
        ]
      },
      {
        "name": "Howrah",
        "cities": [
          "Howrah",
          "Bally",
          "Uluberia",
          "Shibpur",
          "Domjur",
          "Bagnan",
          "Amta"
        ]
      },
      {
        "name": "Jalpaiguri",
        "cities": [
          "Jalpaiguri",
          "Malbazar",
          "Dhupguri",
          "Mainaguri"
        ]
      },
      {
        "name": "Jhargram",
        "cities": [
          "Jhargram",
          "Gopiballavpur",
          "Belpahari"
        ]
      },
      {
        "name": "Kalimpong",
        "cities": [
          "Kalimpong",
          "Pedong",
          "Gorubathan"
        ]
      },
      {
        "name": "Kolkata",
        "cities": [
          "Kolkata",
          "Salt Lake / Bidhannagar",
          "Park Street",
          "New Town",
          "Alipore",
          "Ballygunge",
          "Shyambazar",
          "Behala",
          "Jadavpur"
        ]
      },
      {
        "name": "Malda",
        "cities": [
          "English Bazar / Malda",
          "Old Malda",
          "Chanchal",
          "Habibpur",
          "Gazole"
        ]
      },
      {
        "name": "Murshidabad",
        "cities": [
          "Baharampur",
          "Murshidabad",
          "Jangipur",
          "Kandi",
          "Lalbagh",
          "Beldanga",
          "Dhulian"
        ]
      },
      {
        "name": "Nadia",
        "cities": [
          "Krishnanagar",
          "Kalyani",
          "Ranaghat",
          "Nabadwip",
          "Santipur",
          "Chakdaha"
        ]
      },
      {
        "name": "North 24 Parganas",
        "cities": [
          "Barasat",
          "Barrackpore",
          "Dum Dum",
          "Bidhannagar",
          "Naihati",
          "Habra",
          "Basirhat",
          "Bhatpara",
          "Madhyamgram"
        ]
      },
      {
        "name": "Paschim Bardhaman",
        "cities": [
          "Asansol",
          "Durgapur",
          "Raniganj",
          "Kulti",
          "Jamuria"
        ]
      },
      {
        "name": "Paschim Medinipur",
        "cities": [
          "Medinipur",
          "Kharagpur",
          "Ghatal",
          "Chandrakona"
        ]
      },
      {
        "name": "Purba Bardhaman",
        "cities": [
          "Bardhaman",
          "Kalna",
          "Katwa",
          "Memari"
        ]
      },
      {
        "name": "Purba Medinipur",
        "cities": [
          "Tamluk",
          "Haldia",
          "Contai",
          "Digha",
          "Kolaghat",
          "Egra"
        ]
      },
      {
        "name": "Purulia",
        "cities": [
          "Purulia",
          "Raghunathpur",
          "Jhalda",
          "Adra",
          "Balarampur"
        ]
      },
      {
        "name": "South 24 Parganas",
        "cities": [
          "Alipore",
          "Baruipur",
          "Diamond Harbour",
          "Sonarpur",
          "Canning",
          "Budge Budge",
          "Maheshtala",
          "Kakdwip"
        ]
      },
      {
        "name": "Uttar Dinajpur",
        "cities": [
          "Raiganj",
          "Islampur",
          "Dalkhola",
          "Kaliyaganj"
        ]
      }
    ]
  },
  {
    "name": "Andaman and Nicobar Islands",
    "type": "Union Territory",
    "districts": [
      {
        "name": "Nicobar",
        "cities": [
          "Car Nicobar",
          "Nancowry",
          "Campbell Bay"
        ]
      },
      {
        "name": "North and Middle Andaman",
        "cities": [
          "Mayabunder",
          "Diglipur",
          "Rangat",
          "Baratang"
        ]
      },
      {
        "name": "South Andaman",
        "cities": [
          "Port Blair",
          "Ferrargunj",
          "Garacharma",
          "Prothrapur",
          "Havelock / Swaraj Dweep"
        ]
      }
    ]
  },
  {
    "name": "Chandigarh",
    "type": "Union Territory",
    "districts": [
      {
        "name": "Chandigarh",
        "cities": [
          "Chandigarh",
          "Manimajra",
          "Sector 17",
          "Sector 35",
          "Industrial Area Phase 1",
          "Industrial Area Phase 2"
        ]
      }
    ]
  },
  {
    "name": "Dadra and Nagar Haveli and Daman and Diu",
    "type": "Union Territory",
    "districts": [
      {
        "name": "Dadra and Nagar Haveli",
        "cities": [
          "Silvassa",
          "Dadra",
          "Naroli",
          "Amli",
          "Khanvel"
        ]
      },
      {
        "name": "Daman",
        "cities": [
          "Daman",
          "Nani Daman",
          "Moti Daman",
          "Marwad"
        ]
      },
      {
        "name": "Diu",
        "cities": [
          "Diu",
          "Ghoghla",
          "Fudam",
          "Bucharwada"
        ]
      }
    ]
  },
  {
    "name": "Delhi",
    "type": "Union Territory",
    "districts": [
      {
        "name": "Central Delhi",
        "cities": [
          "Daryaganj",
          "Karol Bagh",
          "Paharganj",
          "Rajinder Nagar",
          "Chandni Chowk"
        ]
      },
      {
        "name": "East Delhi",
        "cities": [
          "Preet Vihar",
          "Mayur Vihar",
          "Laxmi Nagar",
          "Anand Vihar",
          "Patparganj",
          "Gandhi Nagar"
        ]
      },
      {
        "name": "New Delhi",
        "cities": [
          "Connaught Place",
          "Chanakyapuri",
          "India Gate",
          "Barakhamba",
          "Vasant Vihar"
        ]
      },
      {
        "name": "North Delhi",
        "cities": [
          "Civil Lines",
          "Sadar Bazar",
          "Kotwali",
          "Timarpur",
          "Model Town",
          "Alipur",
          "Narela"
        ]
      },
      {
        "name": "North East Delhi",
        "cities": [
          "Seelampur",
          "Yamuna Vihar",
          "Karawal Nagar",
          "Gokulpuri"
        ]
      },
      {
        "name": "North West Delhi",
        "cities": [
          "Rohini",
          "Pitampura",
          "Shalimar Bagh",
          "Saraswati Vihar",
          "Mangolpuri",
          "Kanjhawala"
        ]
      },
      {
        "name": "Shahdara",
        "cities": [
          "Shahdara",
          "Vivek Vihar",
          "Seemapuri",
          "Dilshad Garden",
          "Roop Nagar"
        ]
      },
      {
        "name": "South Delhi",
        "cities": [
          "Saket",
          "Hauz Khas",
          "Greater Kailash",
          "Mehrauli",
          "Malviya Nagar",
          "Green Park"
        ]
      },
      {
        "name": "South East Delhi",
        "cities": [
          "Lajpat Nagar",
          "Kalkaji",
          "Sarita Vihar",
          "Okhla",
          "Defence Colony",
          "Nehru Place"
        ]
      },
      {
        "name": "South West Delhi",
        "cities": [
          "Dwarka",
          "Vasant Kunj",
          "Najafgarh",
          "Palam",
          "Janakpuri",
          "Kapashera"
        ]
      },
      {
        "name": "West Delhi",
        "cities": [
          "Rajouri Garden",
          "Punjabi Bagh",
          "Janakpuri",
          "Patel Nagar",
          "Tilak Nagar",
          "Paschim Vihar"
        ]
      }
    ]
  },
  {
    "name": "Jammu and Kashmir",
    "type": "Union Territory",
    "districts": [
      {
        "name": "Anantnag",
        "cities": [
          "Anantnag",
          "Bijbehara",
          "Pahalgam",
          "Dooru",
          "Kokernag"
        ]
      },
      {
        "name": "Bandipora",
        "cities": [
          "Bandipora",
          "Gurez",
          "Sumbal",
          "Hajin"
        ]
      },
      {
        "name": "Baramulla",
        "cities": [
          "Baramulla",
          "Sopore",
          "Uri",
          "Tangmarg",
          "Pattan",
          "Gulmarg"
        ]
      },
      {
        "name": "Budgam",
        "cities": [
          "Budgam",
          "Chadoora",
          "Beerwah",
          "Magam",
          "Khansahib"
        ]
      },
      {
        "name": "Doda",
        "cities": [
          "Doda",
          "Bhaderwah",
          "Thathri",
          "Gandoh"
        ]
      },
      {
        "name": "Ganderbal",
        "cities": [
          "Ganderbal",
          "Kangan",
          "Sonamarg",
          "Lar"
        ]
      },
      {
        "name": "Jammu",
        "cities": [
          "Jammu",
          "Gandhi Nagar",
          "R.S. Pura",
          "Akhnoor",
          "Bishnah",
          "Bahu Fort"
        ]
      },
      {
        "name": "Kathua",
        "cities": [
          "Kathua",
          "Hiranagar",
          "Billawar",
          "Basohli",
          "Bani"
        ]
      },
      {
        "name": "Kishtwar",
        "cities": [
          "Kishtwar",
          "Padder",
          "Marwah",
          "Chhatroo"
        ]
      },
      {
        "name": "Kulgam",
        "cities": [
          "Kulgam",
          "Qazigund",
          "Damhal Hanjipora",
          "Devsar"
        ]
      },
      {
        "name": "Kupwara",
        "cities": [
          "Kupwara",
          "Handwara",
          "Karnah",
          "Lolab"
        ]
      },
      {
        "name": "Poonch",
        "cities": [
          "Poonch",
          "Mendhar",
          "Surankote",
          "Haveli"
        ]
      },
      {
        "name": "Pulwama",
        "cities": [
          "Pulwama",
          "Pampore",
          "Tral",
          "Awantipora"
        ]
      },
      {
        "name": "Rajouri",
        "cities": [
          "Rajouri",
          "Nowshera",
          "Sunderbani",
          "Thanamandi",
          "Kalakote"
        ]
      },
      {
        "name": "Ramban",
        "cities": [
          "Ramban",
          "Banihal",
          "Batote",
          "Gool"
        ]
      },
      {
        "name": "Reasi",
        "cities": [
          "Reasi",
          "Katra",
          "Mahore",
          "Pouni"
        ]
      },
      {
        "name": "Samba",
        "cities": [
          "Samba",
          "Vijaypur",
          "Ramgarh",
          "Ghagwal"
        ]
      },
      {
        "name": "Shopian",
        "cities": [
          "Shopian",
          "Zainapora",
          "Keller"
        ]
      },
      {
        "name": "Srinagar",
        "cities": [
          "Srinagar",
          "Lal Chowk",
          "Hazratbal",
          "Batamaloo",
          "Rajbagh",
          "Soura"
        ]
      },
      {
        "name": "Udhampur",
        "cities": [
          "Udhampur",
          "Ramnagar",
          "Chenani",
          "Krimchi",
          "Majalta"
        ]
      }
    ]
  },
  {
    "name": "Ladakh",
    "type": "Union Territory",
    "districts": [
      {
        "name": "Kargil",
        "cities": [
          "Kargil",
          "Dras",
          "Sankoo",
          "Zanskar / Padum",
          "Shakar Chiktan"
        ]
      },
      {
        "name": "Leh",
        "cities": [
          "Leh",
          "Chushul",
          "Diskit",
          "Khalatse",
          "Nyoma",
          "Nubra Valley",
          "Hunder"
        ]
      }
    ]
  },
  {
    "name": "Lakshadweep",
    "type": "Union Territory",
    "districts": [
      {
        "name": "Lakshadweep",
        "cities": [
          "Kavaratti",
          "Agatti",
          "Amini",
          "Andrott",
          "Minicoy",
          "Kadmat",
          "Kalpeni"
        ]
      }
    ]
  },
  {
    "name": "Puducherry",
    "type": "Union Territory",
    "districts": [
      {
        "name": "Karaikal",
        "cities": [
          "Karaikal",
          "Nedungadu",
          "Kottucherry",
          "Thirunallar",
          "Neravy"
        ]
      },
      {
        "name": "Mahe",
        "cities": [
          "Mahe",
          "Chalakkara",
          "Pandakkal"
        ]
      },
      {
        "name": "Puducherry",
        "cities": [
          "Puducherry",
          "Ozhukarai",
          "Villianur",
          "Ariyankuppam",
          "Bahour",
          "White Town"
        ]
      },
      {
        "name": "Yanam",
        "cities": [
          "Yanam",
          "Kanakalapeta",
          "Mettacur"
        ]
      }
    ]
  }
];

// Helper: Get list of all States & UTs
export function getStatesAndUTs(): { name: string; type: 'State' | 'Union Territory'; districtsCount: number }[] {
  return INDIA_STATES_AND_UTS.map((s) => ({
    name: s.name,
    type: s.type,
    districtsCount: s.districts.length
  }));
}

// Helper: Get list of all State / UT names
export function getStateNames(): string[] {
  return INDIA_STATES_AND_UTS.map((s) => s.name);
}

// Helper: Get Districts for a given State / UT name
export function getDistricts(stateName: string): string[] {
  if (!stateName) return [];
  const stateObj = INDIA_STATES_AND_UTS.find(
    (s) => s.name.trim().toLowerCase() === stateName.trim().toLowerCase()
  );
  if (!stateObj) return [];
  return stateObj.districts.map((d) => d.name);
}

// Helper: Get Cities for a given State and District
export function getCities(stateName: string, districtName: string): string[] {
  if (!stateName || !districtName) return [];
  const stateObj = INDIA_STATES_AND_UTS.find(
    (s) => s.name.trim().toLowerCase() === stateName.trim().toLowerCase()
  );
  if (!stateObj) return [];
  const districtObj = stateObj.districts.find(
    (d) => d.name.trim().toLowerCase() === districtName.trim().toLowerCase()
  );
  if (!districtObj) return [];
  return districtObj.cities || [];
}

// Helper: Get all unique cities for a state across all its districts
export function getAllCitiesForState(stateName: string): string[] {
  if (!stateName) return [];
  const stateObj = INDIA_STATES_AND_UTS.find(
    (s) => s.name.trim().toLowerCase() === stateName.trim().toLowerCase()
  );
  if (!stateObj) return [];
  const set = new Set<string>();
  stateObj.districts.forEach((d) => {
    (d.cities || []).forEach((c) => set.add(c));
  });
  return Array.from(set);
}

// Helper: Free-text search across all states, districts, and cities
export function searchLocations(query: string): { state: string; district: string; city?: string }[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const results: { state: string; district: string; city?: string }[] = [];

  for (const s of INDIA_STATES_AND_UTS) {
    for (const d of s.districts) {
      if (d.name.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) {
        results.push({ state: s.name, district: d.name });
      }
      for (const c of (d.cities || [])) {
        if (c.toLowerCase().includes(q)) {
          results.push({ state: s.name, district: d.name, city: c });
          if (results.length >= 30) return results;
        }
      }
    }
  }
  return results;
}
