export const pets = [
  {
    id: "1",
    name: "Max (Beagle Mix)",
    status: "lost" as const,
    reward: "$200 Reward",
    location: "Downtown Brooklyn, NY",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAoSXZfDr9BCp9TM9y8yOoBNgkkYdHB5eOFVJ79L9HlFD2j-NwSrzSMNdlFiUPKkAnt7T0UNvhjI-MQ-cA_Fno16GYWJQLmplsNxfuYVpJYBOEphueSYERylnSQNyvkxCslbLuGB3GzoWk31wd4STSrPLhxJTnKshtZHRAC9n1ty5iRVWcfbsrpt7kpwoWbh7D5g56udWZEqmE0sew8anAbyNnpFujWo2H24lp5y9TJ-RUelNWSB4g71dYcraJnERUVFJc5dLNms0",
    reporter: "Sarah J.",
    reporterAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6CMNv-Z24S3KODeiMTnshI3PtpJmXwXd_yHe79wcJIXssrmQqmX7CreoOeZP10PTxiV02N0f2oFnoAG1HfENE3mdoqcyIhLeewW7kfmfvoHjKFdPI1HJFATbF6ZPpEb1934Z1OAjPVA42DbesaYQGuzrBrao2_KlXdKlUFxOkoNJ-GImprC9DgdXt9ZjckNcimuwdm-H7MmR1ci6LGg7ri9P8lZrS0loQ-34PrfjZ1wJYnZG3pllMG0WloU-mDRXGQMwWh7wYN-M",
    timeAgo: "2h ago",
    description: "Max is a friendly beagle mix, about 3 years old. He was last seen near Prospect Park wearing a red collar.",
    breed: "Beagle Mix",
    age: "3 years",
    color: "Brown & White",
  },
  {
    id: "2",
    name: "Tabby Cat (No collar)",
    status: "found" as const,
    reward: "",
    location: "Park Slope, Brooklyn",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyytKEdu2fznYzDrXikm5ZOIO6xiJch84D1BccL7kPTcnkIFjs4-9nVnblUgSxQ4JvbJQTwdM8nlCoi47pcvyb1wVYYPELajsBmttV4_x9hloElvy-6dDKHsdRJRx6M3HckfBi4lX-uYPFP64wxVY0zLdVzHWnZb6qREx5saRyFnCct3tAALrT2g8gEnb1POjwyocKZrmxeUcexHWTcmyXM3g52Q90OmIdGrVe5brXuJMdyaD_A9PoLvBVA5UIv6GO_NeYaADCB2g",
    reporter: "Mike R.",
    reporterAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmK87_npE9dXAdcQAnTepeo58JgT_iDeBeUm92_-Ka0A3UUoNxBa0k5xXClgoaoe8AAB7sTWm3mp_ZGDzzhTgBQSoJ5PHI2Xa4iaF0P7YtwIB14GLxVX5fIzCLNa7Uidh8HmO0Pmc1Hw4rs7eywG9os1uGJNdhyk5I38bXQ-ncIXIRzW1UZFtCY8ARbxMwwOmWLyWTt4YAUvWWkf7ZkwBiKi11KKOWLbvnTiymVkl89sowcSJnnnCq0rDNmfraGf6d-UbaUKSb_sk",
    timeAgo: "5h ago",
    description: "Found a friendly tabby cat near Park Slope. No collar or chip. Currently safe.",
    breed: "Tabby",
    age: "Unknown",
    color: "Orange & White",
  },
];

export const notifications = [
  {
    id: "1",
    type: "match",
    title: "¡Posible coincidencia encontrada!",
    message: "Tu reporte de Max podría coincidir con una mascota encontrada en Brooklyn.",
    timeAgo: "5 min",
    read: false,
  },
  {
    id: "2",
    type: "community",
    title: "Nueva actividad en tu zona",
    message: "Se reportaron 3 mascotas perdidas a menos de 2km de tu ubicación.",
    timeAgo: "1h",
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "¡Final Feliz!",
    message: "Luna fue reunida con su familia gracias a la comunidad Firulais.",
    timeAgo: "3h",
    read: true,
  },
];

export const helpCenters = [
  {
    id: "1",
    name: "Refugio Animal Brooklyn",
    address: "123 Pet Lane, Brooklyn, NY",
    phone: "+1 (555) 123-4567",
    hours: "Lun-Vie 9am-6pm",
    distance: "0.8 km",
  },
  {
    id: "2",
    name: "Veterinaria 24h Park Slope",
    address: "456 Vet Ave, Park Slope, NY",
    phone: "+1 (555) 987-6543",
    hours: "24 horas",
    distance: "1.2 km",
  },
  {
    id: "3",
    name: "Centro de Adopción Firulais",
    address: "789 Happy St, Manhattan, NY",
    phone: "+1 (555) 456-7890",
    hours: "Sáb-Dom 10am-4pm",
    distance: "2.5 km",
  },
];

export const happyEndings = [
  {
    id: "1",
    petName: "Luna",
    breed: "Golden Retriever",
    daysLost: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyytKEdu2fznYzDrXikm5ZOIO6xiJch84D1BccL7kPTcnkIFjs4-9nVnblUgSxQ4JvbJQTwdM8nlCoi47pcvyb1wVYYPELajsBmttV4_x9hloElvy-6dDKHsdRJRx6M3HckfBi4lX-uYPFP64wxVY0zLdVzHWnZb6qREx5saRyFnCct3tAALrT2g8gEnb1POjwyocKZrmxeUcexHWTcmyXM3g52Q90OmIdGrVe5brXuJMdyaD_A9PoLvBVA5UIv6GO_NeYaADCB2g",
    story: "Gracias a la comunidad Firulais, Luna fue encontrada sana y salva a solo 3 cuadras de casa.",
  },
  {
    id: "2",
    petName: "Rocky",
    breed: "Labrador Mix",
    daysLost: 3,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAoSXZfDr9BCp9TM9y8yOoBNgkkYdHB5eOFVJ79L9HlFD2j-NwSrzSMNdlFiUPKkAnt7T0UNvhjI-MQ-cA_Fno16GYWJQLmplsNxfuYVpJYBOEphueSYERylnSQNyvkxCslbLuGB3GzoWk31wd4STSrPLhxJTnKshtZHRAC9n1ty5iRVWcfbsrpt7kpwoWbh7D5g56udWZEqmE0sew8anAbyNnpFujWo2H24lp5y9TJ-RUelNWSB4g71dYcraJnERUVFJc5dLNms0",
    story: "Un vecino lo vio en el parque y gracias al mapa de Firulais pudimos localizarlo rápidamente.",
  },
];

export const chatMessages = [
  {
    id: "1",
    user: "Maria G.",
    avatar: "MG",
    message: "Vi un perro beagle cerca del parque esta mañana, ¿alguien lo está buscando?",
    timeAgo: "10 min",
    isOwn: false,
  },
  {
    id: "2",
    user: "Tú",
    avatar: "TU",
    message: "¡Sí! Puede ser Max, ¿puedes enviar una foto?",
    timeAgo: "8 min",
    isOwn: true,
  },
  {
    id: "3",
    user: "Carlos V.",
    avatar: "CV",
    message: "Yo también vi uno similar en la esquina de Broadway y Park. Tenía collar rojo.",
    timeAgo: "5 min",
    isOwn: false,
  },
];
