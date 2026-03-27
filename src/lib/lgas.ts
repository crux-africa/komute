export interface BusStop {
  name: string;
  landmarks: string[];
  commonRoutes: string[];
}

export interface LGA {
  name: string;
  alias: string;
  busStops: BusStop[];
}

export const LAGOS_LGAS: LGA[] = [
  {
    name: "Alimosho",
    alias: "Alimosho",
    busStops: [
      { name: "Ikotun Roundabout", landmarks: ["IKotun Market", "St. Eugene Catholic Church"], commonRoutes: ["Ikoyi", "Victoria Island", "Lekki"] },
      { name: "Idimu Junction", landmarks: ["Idimu Market", "Alimosho General Hospital"], commonRoutes: ["Ojuelegba", "Surulere", "Yaba"] },
      { name: "Egbe Junction", landmarks: ["Egbe Market", "Apartment 46"], commonRoutes: ["Ikeja", "Ogba", "Agege"] },
      { name: "Abraham Adesanya", landmarks: ["Abeokuta Expressway", "Sango Market"], commonRoutes: ["Ota", "Abeokuta", "Sango"] },
    ],
  },
  {
    name: "Amuwo-Odofin",
    alias: "Amuwo-Odofin",
    busStops: [
      { name: "Festac Gate", landmarks: ["First Bank", "47 Corporate Avenue"], commonRoutes: ["Apapa", "Berger", "Ikeja"] },
      { name: "Trade Fair", landmarks: ["BBA", "Jumia Office"], commonRoutes: ["Oshodi", "Mile 2", "Okokomaiko"] },
      { name: "Berger Yard", landmarks: ["Berger Paints", "Nigerian Breweries"], commonRoutes: ["Ikeja", "Victoria Island", "Lagos Island"] },
      { name: "Satellite Town", landmarks: ["Nigerian Navy", "Baba I demo"], commonRoutes: ["Oshodi", "Ajah", "Lekki"] },
    ],
  },
  {
    name: "Apapa-Ijashe",
    alias: "Apapa",
    busStops: [
      { name: "Apapa Port Gate", landmarks: ["Nigerian Port Authority", "NPA Headquarters"], commonRoutes: ["Oshodi", "Berger", "Ikeja"] },
      { name: "Toll Gate", landmarks: ["Railway Crossing", "Oshodi"] , commonRoutes: ["Oshodi", "Mile 2", "Festac"] },
      { name: "Liverpool", landmarks: ["Liverpool Market", "Nigerian Navy"], commonRoutes: ["Lagos Island", "Idumota", "CMS"] },
    ],
  },
  {
    name: "Badagry",
    alias: "Badagry",
    busStops: [
      { name: "Badagry Roundabout", landmarks: ["Badagry Market", "First Church"], commonRoutes: ["Ojo", "Okokomaiko", "Ijanikin"] },
      { name: "Seme Border", landmarks: ["Nigeria-Benin Border", "Seme Market"], commonRoutes: ["Cotonou", "Benin City", "Soki"] },
      { name: "Topo", landmarks: ["Topo Market", "Badagry Expressway"], commonRoutes: ["Oshodi", "Mile 2", "Festac"] },
    ],
  },
  {
    name: "Epe",
    alias: "Epe",
    busStops: [
      { name: "Epe T-junction", landmarks: ["Epe Market", "Oba Palace"], commonRoutes: ["Lekki", "Ajah", "Eko Akete"] },
      { name: "Lekki-Epe Expressway", landmarks: ["Lekki Free Trade Zone", "Dangote Refinery"], commonRoutes: ["Victoria Island", "Lekki", "Ajah"] },
      { name: "Omu Ibrahim", landmarks: ["Omu Resort", "Epe Marina"], commonRoutes: ["Lekki", "Eti-Osa", "Ajah"] },
    ],
  },
  {
    name: "Eti-Osa",
    alias: "Eti-Osa",
    busStops: [
      { name: "Victoria Island", landmarks: ["KFC", "Eko Hotel", "The Bridge"], commonRoutes: ["Ikoyi", "Lagos Island", "Lekki"] },
      { name: "Lekki Phase 1", landmarks: ["Lekki Conservation Centre", "Funtime Park"], commonRoutes: ["Ajah", "Victoria Island", "Ikoyi"] },
      { name: "Lekki Phase 2", landmarks: ["Lekki Mall", "Pan Atlantic University"], commonRoutes: ["Ajah", "Epe", "Victoria Island"] },
      { name: "Ikota", landmarks: ["Ikota Shopping Complex", "Nigerian Army"], commonRoutes: ["Ajah", "Eti-Osa", "VGC"] },
      { name: "Ajah Market", landmarks: ["Ajah Flyover", "Ajah Market"], commonRoutes: ["Lekki", "Victoria Island", "Epe"] },
    ],
  },
  {
    name: "Ibeju-Lekki",
    alias: "Ibeju-Lekki",
    busStops: [
      { name: "Ajah Junction", landmarks: ["Ajah Roundabout", "Ajah Market"], commonRoutes: ["Lekki", "Victoria Island", "Epe"] },
      { name: "Lekki Free Trade Zone", landmarks: ["Dangote Refinery", "Alaro City"], commonRoutes: ["Epe", "Lekki Phase 2", "Ajah"] },
      { name: "Eleko Beach", landmarks: ["Eleko Beach Resort", "Eti-Osa"], commonRoutes: ["Lekki", "Epe", "Ajah"] },
    ],
  },
  {
    name: "Ifako-Ijaiye",
    alias: "Ifako-Ijaiye",
    busStops: [
      { name: "Ogba", landmarks: ["Nigerian Law School", "Oke-Ira"], commonRoutes: ["Ikeja", "Maryland", "Mojid"] },
      { name: "Abule-Egba", landmarks: ["Abule-Egba Market", "Amuwajale"], commonRoutes: ["Ojuelegba", "Surulere", "Ikeja"] },
      { name: "Iyana-Ipaja", landmarks: ["Iyana-Ipaja Market", "K人家园"], commonRoutes: ["Egbe", "Mojid", "Berger"] },
      { name: "Agege", landmarks: ["Agege Stadium", "Pen Cinema"], commonRoutes: ["Ogba", "Ikeja", "Mushin"] },
    ],
  },
  {
    name: "Ikeja",
    alias: "Ikeja",
    busStops: [
      { name: "Oba Akran", landmarks: ["Ikeja City Mall", "KFC Ikeja"], commonRoutes: ["Ogba", "Maryland", "Mojid"] },
      { name: "Opbi", landmarks: ["Opbi Market", "Ikeja GRA"], commonRoutes: ["Ogba", "Abule-Egba", "Maryland"] },
      { name: "Oshodi-Berger", landmarks: ["Berger Roundabout", "Nigerian Breweries"], commonRoutes: ["Oshodi", "Berger", "Victoria Island"] },
      { name: "Ikeja Under Bridge", landmarks: ["Ikeja Police Station", "Computer Village"], commonRoutes: ["Maryland", "Ogba", "Mojid"] },
      { name: "Allen Avenue", landmarks: ["Allen Roundabout", "Oshodi"], commonRoutes: ["Oshodi", "Victoria Island", "Ikoyi"] },
      { name: "Onipanu", landmarks: ["Onipanu Market", "Ikorodu Road"], commonRoutes: ["Mushin", "Ojuelegba", "Yaba"] },
    ],
  },
  {
    name: "Ikorodu",
    alias: "Ikorodu",
    busStops: [
      { name: "Ikorodu Garage", landmarks: ["Ikorodu Main Market", "Lagos State University"], commonRoutes: ["Fadeyi", "Yaba", "Ojuelegba"] },
      { name: "Ajah", landmarks: ["Ajah Roundabout", "Ajah Market"], commonRoutes: ["Victoria Island", "Lekki", "Epe"] },
      { name: "Ketu", landmarks: ["Ketu Market", "UI Loanne"], commonRoutes: ["Ojuelegba", "Surulere", "Mushin"] },
      { name: "Mile 12", landmarks: ["Mile 12 Market", "Toluwani"], commonRoutes: ["Ketu", "Fadeyi", "Ojuelegba"] },
      { name: "Babcock", landmarks: ["Babcock University", "Ilorin"], commonRoutes: ["Iseyin", "Shaki", "Ilorin"] },
      { name: "Owode/Apa", landmarks: ["Owode Market", "Apa Waterfront"], commonRoutes: ["Epe", "Lekki", "Ajah"] },
    ],
  },
  {
    name: "Kosofe",
    alias: "Kosofe",
    busStops: [
      { name: "Ketu", landmarks: ["Ketu Market", "Alausa"], commonRoutes: ["Ojuelegba", "Surulere", "Mushin"] },
      { name: "Mile 12", landmarks: ["Mile 12 Market", "IKOS"], commonRoutes: ["Ketu", "Fadeyi", "Ojuelegba"] },
      { name: "Ogudin", landmarks: ["Ogudin Market", "Kosofe Mgbon"], commonRoutes: ["Ketu", "Ojuelegba", "Yaba"] },
      { name: "Kaji", landmarks: ["Kaji Market", "Abule-Egba"], commonRoutes: ["Abule-Egba", "Ikeja", "Ogba"] },
    ],
  },
  {
    name: "Lagos Island",
    alias: "Lagos Island",
    busStops: [
      { name: "CMS", landmarks: ["Catholic Mission Street", "Idumota"], commonRoutes: ["Victoria Island", "Lekki", "Apapa"] },
      { name: "Idumota", landmarks: ["Idumota Market", "Central Mosque"], commonRoutes: ["Apapa", "CMS", "Ojuelegba"] },
      { name: "Lagos Island CBD", landmarks: ["National Museum", "Tafawa Balewa Square"], commonRoutes: ["Victoria Island", "Ikoyi", "Lekki"] },
      { name: "Ereko", landmarks: ["Ereko Market", "Lagos Island"], commonRoutes: ["Apapa", "Idumota", "CMS"] },
      { name: "Olowogbowo", landmarks: ["Olowogbowo Market", "Bureau de Change"], commonRoutes: ["CMS", "Idumota", "Victoria Island"] },
    ],
  },
  {
    name: "Lagos Mainland",
    alias: "Lagos Mainland",
    busStops: [
      { name: "Ojuelegba", landmarks: ["Tejuosho", "Palmgroove"], commonRoutes: ["Surulere", "Yaba", "Mushin"] },
      { name: "Strainmill", landmarks: ["Strainmill Bus Stop", "Onipanu"], commonRoutes: ["Mushin", "Ojuelegba", "Ikeja"] },
      { name: "Yaba", landmarks: ["Yaba Market", "LUTH"], commonRoutes: ["Ojuelegba", "Surulere", "Oyingbo"] },
      { name: "Mushin", landmarks: ["Mushin Market", "Isolo"], commonRoutes: ["Ojuelegba", "Ikeja", "Surulere"] },
    ],
  },
  {
    name: "Mushin",
    alias: "Mushin",
    busStops: [
      { name: "Mushin Market", landmarks: ["Mushin Main Market", "Mushin"], commonRoutes: ["Ojuelegba", "Ikeja", "Surulere"] },
      { name: "Isolo", landmarks: ["Isolo Industrial", "Ajao Estate"], commonRoutes: ["Ikeja", "Oshodi", "Apapa"] },
      { name: "Ajao Estate", landmarks: ["Ajao Market", "Lagos-Ibadan Expressway"], commonRoutes: ["Ikeja", "Mushin", "Ojuelegba"] },
      { name: "Orile-Iganmu", landmarks: ["Orile Market", "Nigerian Railway"], commonRoutes: ["Oshodi", "Apapa", "Festac"] },
    ],
  },
  {
    name: "Ojo",
    alias: "Ojo",
    busStops: [
      { name: "Ojo Town", landmarks: ["Ojo Market", "Ojo Town Hall"], commonRoutes: ["Festac", "Badagry", "Trade Fair"] },
      { name: "Ijanikin", landmarks: ["Ijanikin Market", "Ijanikin Beach"], commonRoutes: ["Badagry", "Ojo", "Festac"] },
      { name: "Trade Fair", landmarks: ["Trade Fair Complex", "BBA"], commonRoutes: ["Oshodi", "Festac", "Berger"] },
      { name: "Ajangbadi", landmarks: ["Ajangbadi Market", "Ojo Road"], commonRoutes: ["Ojo", "Festac", "Badagry"] },
    ],
  },
  {
    name: "Oshodi/Isolo",
    alias: "Oshodi",
    busStops: [
      { name: "Oshodi-Bojo", landmarks: ["Oshodi Bus Terminal", "Oshodi Market"], commonRoutes: ["Victoria Island", "Ikeja", "Apapa"] },
      { name: "Amuwo", landmarks: ["Amuwo Odofin", "Festac"], commonRoutes: ["Apapa", "Festac", "Berger"] },
      { name: "Isolo", landmarks: ["Isolo Junction", "Ajao Estate"], commonRoutes: ["Ikeja", "Mushin", "Apapa"] },
      { name: "Kollington", landmarks: ["Kollington Bus Stop", "Ishashi"], commonRoutes: ["Apapa", "Festac", "Oshodi"] },
    ],
  },
  {
    name: "Shomolu",
    alias: "Shomolu",
    busStops: [
      { name: "Bariga", landmarks: ["Bariga Market", "UNILAG"], commonRoutes: ["Yaba", "Ojuelegba", "Surulere"] },
      { name: "Shomolu", landmarks: ["Shomolu Market", "Palmgroove"], commonRoutes: ["Ojuelegba", "Yaba", "Surulere"] },
      { name: "Fadeyi", landmarks: ["Fadeyi Market", "Ikorodu Road"], commonRoutes: ["Yaba", "Ojuelegba", "Ketu"] },
    ],
  },
  {
    name: "Surulere",
    alias: "Surulere",
    busStops: [
      { name: "Ojuelegba", landmarks: ["Ojuelegba Market", "Tejuosho"], commonRoutes: ["Yaba", "Mushin", "Ikeja"] },
      { name: "Babalosa", landmarks: ["Babalosa Market", "Surulere"], commonRoutes: ["Ojuelegba", "Tejuosho", "Ikeja"] },
      { name: "Adelabu", landmarks: ["Adelabu Market", "Rally"], commonRoutes: ["Ojuelegba", "Mushin", "Tejuosho"] },
      { name: "Tejuosho", landmarks: ["Tejuosho Market", "Ojuelegba"], commonRoutes: ["Yaba", "Ojuelegba", "Ikeja"] },
      { name: "Coker", landmarks: ["Coker Market", "Orile"], commonRoutes: ["Ojuelegba", "Mushin", "Oshodi"] },
    ],
  },
  {
    name: "Yaba",
    alias: "Yaba",
    busStops: [
      { name: "Yaba Market", landmarks: ["Yaba Main Market", "Oyingbo"], commonRoutes: ["Ojuelegba", "Surulere", "Lagos Island"] },
      { name: "Oyingbo", landmarks: ["Oyingbo Market", "Tejuosho"], commonRoutes: ["Yaba", "Ojuelegba", "Lagos Island"] },
      { name: "Jibowu", landmarks: ["Jibowu Bridge", "Yaba College"], commonRoutes: ["Ojuelegba", "Surulere", "Tejuosho"] },
      { name: "Massey", landmarks: ["Massey Street", "Pelewura"], commonRoutes: ["Yaba", "Oyingbo", "Ojuelegba"] },
    ],
  },
];

export function getLGAByName(name: string): LGA | undefined {
  return LAGOS_LGAS.find(lga => 
    lga.name.toLowerCase() === name.toLowerCase() ||
    lga.alias.toLowerCase() === name.toLowerCase()
  );
}

export function getBusStopByName(lgaName: string, busStopName: string): BusStop | undefined {
  const lga = getLGAByName(lgaName);
  return lga?.busStops.find(bs => 
    bs.name.toLowerCase() === busStopName.toLowerCase()
  );
}

export function getAllLGANames(): string[] {
  return LAGOS_LGAS.map(lga => lga.name);
}

export function getBusStopsForLGA(lgaName: string): BusStop[] {
  const lga = getLGAByName(lgaName);
  return lga?.busStops || [];
}
