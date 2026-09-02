export type CatalogoModelos = Record<string, Record<string, string[]>>;

export const CATALOGO_POR_TIPO: Record<string, CatalogoModelos> = {
  Smartphone: {
    Apple: {
      iPhone: ['iPhone 2G', 'iPhone 3G', 'iPhone 3GS', 'iPhone 4', 'iPhone 4S', 'iPhone 5', 'iPhone 5C', 'iPhone 5S', 'iPhone 6', 'iPhone 6 Plus', 'iPhone 6S', 'iPhone 6S Plus', 'iPhone 7', 'iPhone 7 Plus', 'iPhone 8', 'iPhone 8 Plus', 'iPhone SE', 'iPhone X', 'iPhone XR', 'iPhone XS', 'iPhone XS Max', 'iPhone SE 2', 'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max', 'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max', 'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max', 'iPhone SE 3', 'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max', 'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max', 'iPhone 17e', 'iPhone 17', 'iPhone 17 Air', 'iPhone 17 Pro', 'iPhone 17 Pro Max'],
    },
    Samsung: {
      A: ['Galaxy A01', 'Galaxy A02', 'Galaxy A02s', 'Galaxy A03', 'Galaxy A04', 'Galaxy A04s', 'Galaxy A05', 'Galaxy A06', 'Galaxy A07', 'Galaxy A10', 'Galaxy A10s', 'Galaxy A11', 'Galaxy A12', 'Galaxy A13', 'Galaxy A14', 'Galaxy A15', 'Galaxy A16', 'Galaxy A16 5G', 'Galaxy A17', 'Galaxy A17 5G', 'Galaxy A20', 'Galaxy A20s', 'Galaxy A21s', 'Galaxy A22', 'Galaxy A23', 'Galaxy A24', 'Galaxy A25 5G', 'Galaxy A26 5G', 'Galaxy A30', 'Galaxy A30s', 'Galaxy A31', 'Galaxy A32', 'Galaxy A33', 'Galaxy A34', 'Galaxy A35 5G', 'Galaxy A36 5G', 'Galaxy A37 5G', 'Galaxy A50', 'Galaxy A50s', 'Galaxy A51', 'Galaxy A52', 'Galaxy A52s', 'Galaxy A53', 'Galaxy A54', 'Galaxy A55 5G', 'Galaxy A56 5G', 'Galaxy A57 5G', 'Galaxy A70', 'Galaxy A70s', 'Galaxy A71', 'Galaxy A72', 'Galaxy A73'],
      J: ['Galaxy J1', 'Galaxy J1 Mini', 'Galaxy J2', 'Galaxy J2 Prime', 'Galaxy J3', 'Galaxy J4', 'Galaxy J4 Plus', 'Galaxy J5', 'Galaxy J5 Prime', 'Galaxy J6', 'Galaxy J6 Plus', 'Galaxy J7', 'Galaxy J7 Prime', 'Galaxy J7 Pro', 'Galaxy J8'],
      S: ['Galaxy S6', 'Galaxy S6 Edge', 'Galaxy S7', 'Galaxy S7 Edge', 'Galaxy S8', 'Galaxy S8 Plus', 'Galaxy S9', 'Galaxy S9 Plus', 'Galaxy S10e', 'Galaxy S10', 'Galaxy S10 Plus', 'Galaxy S10 5G', 'Galaxy S20', 'Galaxy S20 FE', 'Galaxy S21', 'Galaxy S21 FE', 'Galaxy S22', 'Galaxy S22 Plus', 'Galaxy S22 Ultra', 'Galaxy S23', 'Galaxy S23 Plus', 'Galaxy S23 Ultra', 'Galaxy S24', 'Galaxy S24 Plus', 'Galaxy S24 Ultra', 'Galaxy S25', 'Galaxy S25 Plus', 'Galaxy S25 Ultra', 'Galaxy S25 Edge', 'Galaxy S25 FE', 'Galaxy S26', 'Galaxy S26 Plus', 'Galaxy S26 Ultra'],
      M: ['Galaxy M10', 'Galaxy M11', 'Galaxy M12', 'Galaxy M13', 'Galaxy M14', 'Galaxy M15', 'Galaxy M20', 'Galaxy M21', 'Galaxy M22', 'Galaxy M23', 'Galaxy M30', 'Galaxy M31', 'Galaxy M32', 'Galaxy M33', 'Galaxy M34', 'Galaxy M35', 'Galaxy M51', 'Galaxy M52', 'Galaxy M53', 'Galaxy M54', 'Galaxy M55'],
      Z: ['Galaxy Fold', 'Galaxy Z Flip', 'Galaxy Z Flip 5G', 'Galaxy Z Flip3', 'Galaxy Z Flip4', 'Galaxy Z Flip5', 'Galaxy Z Flip6', 'Galaxy Z Flip7', 'Galaxy Z Flip7 FE', 'Galaxy Fold2', 'Galaxy Z Fold3', 'Galaxy Z Fold4', 'Galaxy Z Fold5', 'Galaxy Z Fold6', 'Galaxy Z Fold7', 'Galaxy Z TriFold'],
      Note: ['Galaxy Note 8', 'Galaxy Note 9', 'Galaxy Note 10', 'Galaxy Note 10 Plus', 'Galaxy Note 20', 'Galaxy Note 20 Ultra'],
    },
    Motorola: {
      'Moto G': ['Moto G (1ª geração)', 'Moto G2', 'Moto G3', 'Moto G4', 'Moto G4 Play', 'Moto G5', 'Moto G5 Plus', 'Moto G5S', 'Moto G5S Plus', 'Moto G6', 'Moto G6 Play', 'Moto G6 Plus', 'Moto G7', 'Moto G7 Play', 'Moto G7 Power', 'Moto G7 Plus', 'Moto G8', 'Moto G8 Play', 'Moto G8 Power', 'Moto G9 Play', 'Moto G9 Power', 'Moto G20', 'Moto G22', 'Moto G23', 'Moto G24', 'Moto G30', 'Moto G31', 'Moto G32', 'Moto G42', 'Moto G52', 'Moto G53', 'Moto G54', 'Moto G60', 'Moto G62', 'Moto G72', 'Moto G73', 'Moto G84'],
      Edge: ['Edge 20', 'Edge 30', 'Edge 30 Neo', 'Edge 30 Fusion', 'Edge 40', 'Edge 40 Neo', 'Edge 50 Fusion', 'Edge 50 Pro', 'Edge 50 Ultra', 'Edge 60', 'Edge 60 Fusion', 'Edge 60 Neo', 'Edge 60 Pro'],
      Razr: ['Razr V3', 'Razr 2019', 'Razr 5G', 'Razr 40', 'Razr 40 Ultra', 'Razr 50', 'Razr 50 Ultra', 'Razr 60', 'Razr 60 Ultra'],
      'Moto E': ['Moto E2', 'Moto E3', 'Moto E4', 'Moto E4 Plus', 'Moto E5', 'Moto E5 Play', 'Moto E6 Plus', 'Moto E7', 'Moto E20', 'Moto E22', 'Moto E32', 'Moto E40'],
      'Moto X': ['Moto X', 'Moto X2', 'Moto X Play', 'Moto X Style', 'Moto X4'],
      'Moto Z': ['Moto Z', 'Moto Z Play', 'Moto Z2 Play', 'Moto Z3 Play', 'Moto Z4'],
      'Moto One': ['Motorola One', 'Motorola One Vision', 'Motorola One Action', 'Motorola One Macro', 'Motorola One Fusion'],
    },
    Xiaomi: {
      Redmi: ['Redmi 6', 'Redmi 6A', 'Redmi 7', 'Redmi 7A', 'Redmi 8', 'Redmi 8A', 'Redmi 9', 'Redmi 9A', 'Redmi 9C', 'Redmi 10', 'Redmi 10C', 'Redmi 12', 'Redmi 13', 'Redmi 15', 'Redmi 15C', 'Redmi Note 7', 'Redmi Note 8', 'Redmi Note 8 Pro', 'Redmi Note 9', 'Redmi Note 9S', 'Redmi Note 9 Pro', 'Redmi Note 10', 'Redmi Note 10S', 'Redmi Note 10 Pro', 'Redmi Note 11', 'Redmi Note 11S', 'Redmi Note 11 Pro', 'Redmi Note 12', 'Redmi Note 12 Pro', 'Redmi Note 13', 'Redmi Note 13 Pro', 'Redmi Note 14', 'Redmi Note 15', 'Redmi Note 15 Pro', 'Redmi Note 15 Pro+'],
      Xiaomi: ['Mi 8', 'Mi 9', 'Mi 9T', 'Mi 10', 'Mi 10T', 'Mi 11', 'Xiaomi 11 Lite', 'Xiaomi 12', 'Xiaomi 12 Lite', 'Xiaomi 12T', 'Xiaomi 13', 'Xiaomi 13 Lite', 'Xiaomi 13 Pro', 'Xiaomi 14', 'Xiaomi 14T', 'Xiaomi 14T Pro', 'Xiaomi 15', 'Xiaomi 15 Ultra', 'Xiaomi 15T', 'Xiaomi 15T Pro'],
      Mi: ['Mi A1', 'Mi A2', 'Mi A2 Lite', 'Mi Mix 2', 'Mi Mix 2S', 'Mi Mix 3', 'Mi Note 10'],
    },
    Redmi: {
      Note: ['Redmi Note 5', 'Redmi Note 6 Pro', 'Redmi Note 7', 'Redmi Note 8', 'Redmi Note 8 Pro', 'Redmi Note 9', 'Redmi Note 9S', 'Redmi Note 9 Pro', 'Redmi Note 10', 'Redmi Note 10S', 'Redmi Note 10 Pro', 'Redmi Note 11', 'Redmi Note 11S', 'Redmi Note 11 Pro', 'Redmi Note 12', 'Redmi Note 12 Pro', 'Redmi Note 13', 'Redmi Note 13 Pro', 'Redmi Note 14', 'Redmi Note 14 Pro'],
      Redmi: ['Redmi 5', 'Redmi 6', 'Redmi 6A', 'Redmi 7', 'Redmi 7A', 'Redmi 8', 'Redmi 8A', 'Redmi 9', 'Redmi 9A', 'Redmi 10', 'Redmi 12', 'Redmi 13'],
    },
    Poco: {
      X: ['Poco X2', 'Poco X3', 'Poco X3 NFC', 'Poco X3 Pro', 'Poco X4 Pro', 'Poco X5', 'Poco X5 Pro', 'Poco X6', 'Poco X6 Pro', 'Poco X7', 'Poco X7 Pro'],
      F: ['Poco F1', 'Poco F2 Pro', 'Poco F3', 'Poco F4', 'Poco F5', 'Poco F6', 'Poco F7', 'Poco F7 Pro', 'Poco F7 Ultra'],
      M: ['Poco M2', 'Poco M2 Pro', 'Poco M3', 'Poco M4 Pro', 'Poco M5', 'Poco M6'],
    },
    Realme: {
      C: ['Realme C1', 'Realme C2', 'Realme C3', 'Realme C11', 'Realme C12', 'Realme C15', 'Realme C17', 'Realme C20', 'Realme C21', 'Realme C25', 'Realme C30', 'Realme C31', 'Realme C33', 'Realme C35', 'Realme C51', 'Realme C53', 'Realme C55', 'Realme C55 NFC', 'Realme C67'],
      GT: ['Realme GT', 'Realme GT 2', 'Realme GT 3', 'Realme GT 5', 'Realme GT 6', 'Realme GT 7', 'Realme GT 7 Pro'],
      Number: ['Realme 5', 'Realme 5 Pro', 'Realme 6', 'Realme 6 Pro', 'Realme 7', 'Realme 7 Pro', 'Realme 8', 'Realme 9', 'Realme 10', 'Realme 11', 'Realme 12', 'Realme 13', 'Realme 14 5G', 'Realme 14T 5G', 'Realme 14 Pro 5G', 'Realme 14 Pro+ 5G', 'Realme 15 5G', 'Realme 15 Pro 5G', 'Realme 15T', 'Realme 16 5G', 'Realme 16 Pro+ 5G'],
      Narzo: ['Realme Narzo 10', 'Realme Narzo 20', 'Realme Narzo 30', 'Realme Narzo 50', 'Realme Narzo 60', 'Realme Narzo 70'],
    },
    Infinix: {
      Hot: ['Hot 7', 'Hot 8', 'Hot 9', 'Hot 10', 'Hot 10 Play', 'Hot 11', 'Hot 12', 'Hot 20', 'Hot 30', 'Hot 40', 'Hot 50', 'Hot 50 Pro', 'Hot 50 Pro+'],
      Note: ['Note 7', 'Note 8', 'Note 10', 'Note 11', 'Note 12', 'Note 30', 'Note 30 Pro', 'Note 40', 'Note 50', 'Note 50 Pro', 'Note 50 Pro+'],
      GT: ['GT 20 Pro', 'GT 30 Pro'],
      Zero: ['Zero 5G', 'Zero 20', 'Zero 30', 'Zero 40'],
      Smart: ['Smart 3', 'Smart 4', 'Smart 5', 'Smart 6', 'Smart 7', 'Smart 8', 'Smart 9'],
    },
    Tecno: {
      Spark: ['Spark 5', 'Spark 6', 'Spark 7', 'Spark 8', 'Spark 9', 'Spark 10', 'Spark 20', 'Spark 20 Pro', 'Spark 30', 'Spark 40'],
      Pova: ['Pova 2', 'Pova 3', 'Pova 4', 'Pova 5', 'Pova 6'],
      Pop: ['Pop 2', 'Pop 3', 'Pop 4', 'Pop 5', 'Pop 6', 'Pop 7'],
      Camon: ['Camon 18', 'Camon 19', 'Camon 20', 'Camon 30', 'Camon 40'],
      Phantom: ['Phantom X', 'Phantom X2', 'Phantom V Fold', 'Phantom V Fold2'],
    },
    Huawei: {
      Nova: ['Nova 2i', 'Nova 3i', 'Nova 5T', 'Nova 7i', 'Nova 8i', 'Nova 9', 'Nova 10', 'Nova 11', 'Nova 12'],
      Mate: ['Mate 8', 'Mate 9', 'Mate 10', 'Mate 10 Pro', 'Mate 20', 'Mate 20 Pro', 'Mate 30', 'Mate 40', 'Mate 50', 'Mate 60'],
      P: ['P8', 'P9', 'P10', 'P20', 'P20 Lite', 'P30', 'P30 Lite', 'P40', 'P50', 'P60'],
      Y: ['Y5', 'Y6', 'Y7', 'Y7 2019', 'Y8p', 'Y9', 'Y9 Prime'],
    },
    Honor: {
      X: ['Honor X5', 'Honor X5 Plus', 'Honor X6', 'Honor X7', 'Honor X8', 'Honor X9', 'Honor X50', 'Honor X5b', 'Honor X6c', 'Honor X7d', 'Honor X8d'],
      Magic: ['Magic 2', 'Magic 3', 'Magic 4', 'Magic 5', 'Magic 6', 'Magic 7 Pro', 'Magic 8 Pro', 'Magic V', 'Magic V2', 'Magic V3', 'Magic V5'],
      Number: ['Honor 8X', 'Honor 9X', 'Honor 10', 'Honor 20', 'Honor 50', 'Honor 70', 'Honor 90', 'Honor 200', 'Honor 400', 'Honor 400 Lite', 'Honor 400 Pro', 'Honor 600 Lite'],
    },
    OnePlus: {
      Nord: ['Nord N10', 'Nord N100', 'Nord N200', 'Nord N20', 'Nord N30', 'Nord CE', 'Nord CE 2', 'Nord CE 3', 'Nord CE 4', 'Nord 2', 'Nord 3', 'Nord 4'],
      Number: ['OnePlus One', 'OnePlus 2', 'OnePlus 3', 'OnePlus 3T', 'OnePlus 5', 'OnePlus 5T', 'OnePlus 6', 'OnePlus 6T', 'OnePlus 7', 'OnePlus 7T', 'OnePlus 8', 'OnePlus 8T', 'OnePlus 9', 'OnePlus 10 Pro', 'OnePlus 11', 'OnePlus 12', 'OnePlus 13', 'OnePlus 13R', 'OnePlus 13T'],
      Open: ['OnePlus Open'],
    },
    Oppo: {
      A: ['A3s', 'A5', 'A5s', 'A7', 'A9', 'A12', 'A15', 'A16', 'A17', 'A18', 'A31', 'A38', 'A53', 'A54', 'A58', 'A74', 'A78', 'A98'],
      Reno: ['Reno 2', 'Reno 3', 'Reno 4', 'Reno 5', 'Reno 6', 'Reno 7', 'Reno 8', 'Reno 10', 'Reno 11', 'Reno 12', 'Reno 13', 'Reno 14'],
      Find: ['Find X', 'Find X2', 'Find X3', 'Find X5', 'Find X6', 'Find X7', 'Find X8'],
    },
    Vivo: {
      Y: ['Y12', 'Y15', 'Y17', 'Y19', 'Y20', 'Y21', 'Y22', 'Y27', 'Y30', 'Y33', 'Y35', 'Y36', 'Y53'],
      V: ['V11', 'V15', 'V17', 'V20', 'V21', 'V23', 'V25', 'V27', 'V29', 'V30', 'V40', 'V50', 'V60'],
      X: ['X50', 'X60', 'X70', 'X80', 'X90', 'X100', 'X200'],
    },
    Nokia: {
      C: ['C1', 'C2', 'C3', 'C10', 'C20', 'C21', 'C22', 'C30', 'C32'],
      G: ['G10', 'G11', 'G20', 'G21', 'G22', 'G42'],
      X: ['X6', 'X7', 'X10', 'X20', 'X30', 'X50'],
      Lumia: ['Lumia 520', 'Lumia 535', 'Lumia 630', 'Lumia 640', 'Lumia 720', 'Lumia 820', 'Lumia 920', 'Lumia 950'],
    },
    Asus: {
      Zenfone: ['Zenfone 2', 'Zenfone 3', 'Zenfone 4', 'Zenfone 5', 'Zenfone 6', 'Zenfone 7', 'Zenfone 8', 'Zenfone 9', 'Zenfone 10', 'Zenfone 11'],
      ROG: ['ROG Phone', 'ROG Phone 2', 'ROG Phone 3', 'ROG Phone 5', 'ROG Phone 6', 'ROG Phone 7', 'ROG Phone 8'],
    },
    Sony: {
      Xperia: ['Xperia Z', 'Xperia Z1', 'Xperia Z2', 'Xperia Z3', 'Xperia Z5', 'Xperia XA', 'Xperia XA1', 'Xperia L1', 'Xperia L2', 'Xperia XZ', 'Xperia XZ1', 'Xperia 1', 'Xperia 1 II', 'Xperia 1 III', 'Xperia 1 IV', 'Xperia 1 V', 'Xperia 1 VII', 'Xperia 5', 'Xperia 5 II', 'Xperia 5 III', 'Xperia 5 IV', 'Xperia 10', 'Xperia 10 II', 'Xperia 10 III', 'Xperia 10 IV', 'Xperia 10 V', 'Xperia 10 VII'],
    },
    LG: {
      K: ['K4', 'K8', 'K10', 'K11', 'K12', 'K20', 'K22', 'K40', 'K41S', 'K50', 'K51S', 'K52'],
      G: ['G2', 'G3', 'G4', 'G5', 'G6', 'G7 ThinQ', 'G8 ThinQ'],
      V: ['V10', 'V20', 'V30', 'V35', 'V40', 'V50', 'V60'],
      Q: ['Q6', 'Q7', 'Q8', 'Q9'],
      Velvet: ['Velvet', 'Velvet 2 Pro'],
    },
    TCL: {
      'Serie 30': ['30 SE', '30 Plus', '30 5G'],
      'Serie 40': ['40 SE', '40 R', '40 Nxt'],
      'Serie 50': ['50', '50 Pro', '50 5G'],
    },
    ZTE: {
      Blade: ['Blade A31', 'Blade A51', 'Blade A52', 'Blade A72', 'Blade V40'],
    },
    Alcatel: {
      'Serie 1': ['1', '1L', '1B', '1S'],
      'Serie 3': ['3', '3L', '3X'],
    },
    Itel: {
      A: ['A16', 'A23', 'A27', 'A48', 'A60'],
      S: ['S16', 'S18', 'S23'],
    },
    Multilaser: {
      M: ['M7', 'M8', 'M10', 'M-Pro'],
    },
    Positivo: {
      Twist: ['Twist 2', 'Twist 3', 'Twist 4', 'Twist 5'],
    },
    Google: {
      Pixel: ['Pixel', 'Pixel XL', 'Pixel 2', 'Pixel 2 XL', 'Pixel 3', 'Pixel 3a', 'Pixel 3 XL', 'Pixel 4', 'Pixel 4a', 'Pixel 4 XL', 'Pixel 5', 'Pixel 5a', 'Pixel 6', 'Pixel 6a', 'Pixel 6 Pro', 'Pixel 7', 'Pixel 7a', 'Pixel 7 Pro', 'Pixel 8', 'Pixel 8a', 'Pixel 8 Pro', 'Pixel 9', 'Pixel 9a', 'Pixel 9 Pro', 'Pixel 9 Pro XL', 'Pixel 10'],
    },
    HTC: {
      One: ['One M7', 'One M8', 'One M9', 'One A9'],
      Desire: ['Desire 510', 'Desire 530', 'Desire 626', 'Desire 820', 'Desire 10'],
      U: ['U11', 'U11 Plus', 'U12 Plus'],
    },
    Meizu: {
      M: ['M2', 'M3', 'M5', 'M6', 'M6 Note'],
      Note: ['Note 8', 'Note 9', 'Note 10'],
    },
  },
  Notebook: {
    Dell: {
      Inspiron: ['Inspiron 14', 'Inspiron 15 3511', 'Inspiron 15 3520', 'Inspiron 15 3530', 'Inspiron 16'],
      Latitude: ['Latitude 3420', 'Latitude 3430', 'Latitude 3440', 'Latitude 3520', 'Latitude 5440', 'Latitude 7440'],
      Vostro: ['Vostro 3400', 'Vostro 3510', 'Vostro 3520', 'Vostro 5620'],
      XPS: ['XPS 13', 'XPS 13 Plus', 'XPS 15', 'XPS 17'],
      G: ['G15', 'G16'],
      Alienware: ['m16', 'm18', 'x16'],
    },
    HP: {
      Pavilion: ['Pavilion 14', 'Pavilion 15', 'Pavilion x360'],
      'HP 250': ['HP 250 G8', 'HP 250 G9', 'HP 250 G10'],
      'HP 255': ['HP 255 G8', 'HP 255 G9', 'HP 255 G10'],
      ProBook: ['ProBook 440 G9', 'ProBook 440 G10', 'ProBook 450 G9', 'ProBook 450 G10'],
      EliteBook: ['EliteBook 840 G9', 'EliteBook 840 G10', 'EliteBook 860 G10'],
      Victus: ['Victus 15', 'Victus 16'],
      Omen: ['Omen 16', 'Omen 17'],
    },
    Lenovo: {
      IdeaPad: ['IdeaPad 1', 'IdeaPad 3', 'IdeaPad 5', 'IdeaPad Slim 3', 'IdeaPad Slim 5'],
      ThinkPad: ['ThinkPad E14', 'ThinkPad E15', 'ThinkPad E16', 'ThinkPad T14', 'ThinkPad T14s', 'ThinkPad X1 Carbon'],
      Yoga: ['Yoga Slim 6', 'Yoga Slim 7', 'Yoga 7i', 'Yoga Pro 7'],
      Legion: ['Legion 5', 'Legion 5 Pro', 'Legion 7', 'Legion Slim 5'],
      LOQ: ['LOQ 15', 'LOQ 16'],
    },
    Acer: {
      Aspire: ['Aspire 3', 'Aspire 5', 'Aspire 7'],
      Swift: ['Swift 3', 'Swift Go 14', 'Swift Go 16', 'Swift X'],
      Nitro: ['Nitro 5', 'Nitro V 15', 'Nitro V 16'],
      Predator: ['Predator Helios 16', 'Predator Helios 18', 'Predator Triton 14'],
    },
    Asus: {
      VivoBook: ['VivoBook 15', 'VivoBook 16', 'VivoBook Go 15', 'VivoBook Pro 15'],
      Zenbook: ['Zenbook 14', 'Zenbook 14 OLED', 'Zenbook S 13', 'Zenbook S 14'],
      TUF: ['TUF Gaming F15', 'TUF Gaming F16', 'TUF Gaming A15', 'TUF Gaming A16'],
      ROG: ['ROG Strix G16', 'ROG Strix G18', 'ROG Zephyrus G14', 'ROG Zephyrus G16'],
      ExpertBook: ['ExpertBook B1', 'ExpertBook B5'],
    },
    Apple: {
      MacBook: ['MacBook Air M1', 'MacBook Air M2', 'MacBook Air M3', 'MacBook Air M4', 'MacBook Air M5', 'MacBook Pro M1', 'MacBook Pro M2', 'MacBook Pro M3', 'MacBook Pro M4', 'MacBook Pro M5'],
    },
    Samsung: {
      GalaxyBook: ['Galaxy Book2', 'Galaxy Book3', 'Galaxy Book4', 'Galaxy Book4 Edge', 'Galaxy Book5'],
    },
    LG: {
      Gram: ['LG Gram 14', 'LG Gram 15', 'LG Gram 16', 'LG Gram 17'],
    },
    Vaio: {
      FE: ['Vaio FE14', 'Vaio FE15'],
      Fit: ['Vaio Fit 14', 'Vaio Fit 15'],
      Z: ['Vaio Z'],
    },
    Positivo: {
      Motion: ['Motion Q', 'Motion C', 'Motion Plus'],
      Vision: ['Vision C', 'Vision R15'],
      Duo: ['Duo 2 em 1'],
    },
    Avell: {
      A: ['A52', 'A57', 'A70'],
      Storm: ['Storm 450', 'Storm 550', 'Storm 600'],
    },
  },
  Desktop: {
    Dell: {
      OptiPlex: ['OptiPlex 3080', 'OptiPlex 5080', 'OptiPlex 7090', 'OptiPlex 7010'],
      Inspiron: ['Inspiron 3910', 'Inspiron 3020'],
      XPS: ['XPS Desktop 8950', 'XPS Desktop 8960'],
      Alienware: ['Aurora R13', 'Aurora R15', 'Aurora R16'],
    },
    HP: {
      ProDesk: ['ProDesk 400 G6', 'ProDesk 400 G7', 'ProDesk 600 G6'],
      EliteDesk: ['EliteDesk 800 G6', 'EliteDesk 800 G8'],
      Pavilion: ['Pavilion Desktop TP01', 'Pavilion Gaming TG01'],
      Omen: ['Omen 25L', 'Omen 40L', 'Omen 45L'],
    },
    Lenovo: {
      ThinkCentre: ['ThinkCentre M70q', 'ThinkCentre M75q', 'ThinkCentre M90q'],
      IdeaCentre: ['IdeaCentre 3', 'IdeaCentre 5', 'IdeaCentre Gaming 5'],
      Legion: ['Legion Tower 5', 'Legion Tower 7'],
    },
    Apple: {
      Mac: ['iMac 24 M1', 'iMac 24 M3', 'iMac 24 M4', 'Mac mini M2', 'Mac mini M4', 'Mac Studio M2', 'Mac Studio M3'],
    },
    Positivo: {
      Master: ['Master D3400', 'Master D6100', 'Master C6300'],
      Union: ['Union'],
    },
    'Montado (Custom/Gamer)': {
      'Computador montado': ['PC Gamer de entrada', 'PC Gamer intermediário', 'PC Gamer avançado', 'Workstation', 'Servidor'],
    },
  },
  Tablet: {
    Apple: {
      iPad: ['iPad 7ª Geração', 'iPad 8ª Geração', 'iPad 9ª Geração', 'iPad 10ª Geração', 'iPad A16', 'iPad Air 4', 'iPad Air 5', 'iPad Air 6', 'iPad Air M3', 'iPad mini 6', 'iPad mini 7', 'iPad Pro 11', 'iPad Pro 12,9', 'iPad Pro M4', 'iPad Pro M5'],
    },
    'Apple (iPad)': {
      iPad: ['iPad 7ª Geração', 'iPad 8ª Geração', 'iPad 9ª Geração', 'iPad 10ª Geração', 'iPad Air 5', 'iPad Air 6', 'iPad mini 6', 'iPad mini 7', 'iPad Pro 11', 'iPad Pro 12,9', 'iPad Pro M4', 'iPad Pro M5'],
    },
    Samsung: {
      GalaxyTab: ['Galaxy Tab A7', 'Galaxy Tab A8', 'Galaxy Tab A9', 'Galaxy Tab A9+', 'Galaxy Tab S6 Lite', 'Galaxy Tab S7 FE', 'Galaxy Tab S8', 'Galaxy Tab S9', 'Galaxy Tab S9 FE', 'Galaxy Tab S10', 'Galaxy Tab S10 FE', 'Galaxy Tab S11'],
    },
    Lenovo: {
      Tab: ['Tab M10', 'Tab M11', 'Tab P11', 'Tab P12', 'Tab P12 Pro', 'Legion Tab'],
    },
    Xiaomi: {
      Pad: ['Xiaomi Pad 5', 'Xiaomi Pad 6', 'Xiaomi Pad 6S Pro', 'Xiaomi Pad 7', 'Xiaomi Pad 7 Pro'],
      Redmi: ['Redmi Pad', 'Redmi Pad SE', 'Redmi Pad 2'],
    },
    Multilaser: {
      M: ['M7', 'M8', 'M10', 'M-Pro'],
    },
    Amazon: {
      Fire: ['Fire HD 8', 'Fire HD 10', 'Fire HD 10 Plus', 'Fire Max 11'],
    },
    Huawei: {
      MatePad: ['MatePad 10.4', 'MatePad 11', 'MatePad 11.5', 'MatePad Pro'],
    },
    Microsoft: {
      Surface: ['Surface Go 3', 'Surface Go 4', 'Surface Pro 8', 'Surface Pro 9', 'Surface Pro 10', 'Surface Pro 11'],
    },
    Positivo: {
      Tab: ['Tab 7', 'Tab 8', 'Tab Q10'],
    },
  },
  Console: {
    Sony: {
      PlayStation: ['PlayStation 4', 'PlayStation 4 Slim', 'PlayStation 4 Pro', 'PlayStation 5', 'PlayStation 5 Slim', 'PlayStation 5 Pro', 'PlayStation Portal'],
    },
    PlayStation: {
      PlayStation: ['PlayStation 4', 'PlayStation 4 Slim', 'PlayStation 4 Pro', 'PlayStation 5', 'PlayStation 5 Slim', 'PlayStation 5 Pro', 'PlayStation Portal'],
    },
    Xbox: {
      Xbox: ['Xbox One', 'Xbox One S', 'Xbox One X', 'Xbox Series S', 'Xbox Series X'],
    },
    Nintendo: {
      Switch: ['Nintendo Switch', 'Nintendo Switch Lite', 'Nintendo Switch OLED', 'Nintendo Switch 2'],
      Wii: ['Wii', 'Wii U'],
    },
    Valve: {
      SteamDeck: ['Steam Deck LCD', 'Steam Deck OLED'],
    },
    Asus: {
      ROGAlly: ['ROG Ally', 'ROG Ally X'],
    },
  },
  Impressora: {
    HP: {
      DeskJet: ['DeskJet 2774', 'DeskJet 2874', 'DeskJet Ink Advantage 2774'],
      SmartTank: ['Smart Tank 517', 'Smart Tank 583', 'Smart Tank 724'],
      OfficeJet: ['OfficeJet Pro 9010', 'OfficeJet Pro 9730'],
      LaserJet: ['LaserJet M404', 'LaserJet M428', 'LaserJet Pro M15', 'LaserJet Pro MFP 4103'],
    },
    Epson: {
      EcoTank: ['EcoTank L3250', 'EcoTank L4260', 'EcoTank L5290', 'EcoTank L6270', 'EcoTank L8180'],
      WorkForce: ['WorkForce WF-7210', 'WorkForce WF-7830'],
      Monocromatica: ['M1120', 'M2120', 'M2170'],
    },
    Canon: {
      Pixma: ['Pixma G3110', 'Pixma G3160', 'Pixma G6010', 'Pixma G7010'],
      Maxify: ['Maxify GX6010', 'Maxify GX7010'],
      imageCLASS: ['imageCLASS LBP6030', 'imageCLASS MF3010', 'imageCLASS MF455dw'],
    },
    Brother: {
      HL: ['HL-1212W', 'HL-1202', 'HL-L2360DW', 'HL-L5102DW'],
      DCP: ['DCP-1617NW', 'DCP-L2540DW', 'DCP-L5652DN'],
      MFC: ['MFC-L2710DW', 'MFC-L3750CDW', 'MFC-L6902DW'],
    },
    Samsung: {
      Xpress: ['Xpress M2020', 'Xpress M2070', 'Xpress C430W'],
    },
    Lexmark: {
      Laser: ['MS321dn', 'MX421ade', 'MC3224dwe'],
    },
    Xerox: {
      Phaser: ['Phaser 3020', 'Phaser 3260'],
      WorkCentre: ['WorkCentre 3025', 'WorkCentre 3345'],
    },
    Elgin: {
      Ecoprint: ['Ecoprint L42 Pro', 'Ecoprint L42 DT'],
    },
    Pantum: {
      Laser: ['P2500W', 'M6550NW', 'M7100DW'],
    },
    Kyocera: {
      Ecosys: ['ECOSYS P2040dn', 'ECOSYS M2040dn', 'ECOSYS M2635dn'],
    },
  },
};

export const MARCAS_COMPLETAS_POR_TIPO: Record<string, string[]> = {
  ...Object.fromEntries(
    Object.entries(CATALOGO_POR_TIPO).map(([tipo, marcas]) => [
      tipo,
      [...Object.keys(marcas), 'Outra'],
    ]),
  ),
};
