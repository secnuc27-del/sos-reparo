export type CatalogoModelos = Record<string, Record<string, string[]>>;

export const CATALOGO_POR_TIPO: Record<string, CatalogoModelos> = {
  Smartphone: {
    Apple: {
      iPhone: ['iPhone SE', 'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max', 'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max', 'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max', 'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max', 'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max', 'iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max'],
    },
    Samsung: {
      A: ['Galaxy A03', 'Galaxy A04', 'Galaxy A05', 'Galaxy A06', 'Galaxy A14', 'Galaxy A15', 'Galaxy A24', 'Galaxy A25', 'Galaxy A34', 'Galaxy A35', 'Galaxy A54', 'Galaxy A55', 'Galaxy A56', 'Galaxy A73'],
      S: ['Galaxy S20', 'Galaxy S20 FE', 'Galaxy S21', 'Galaxy S21 FE', 'Galaxy S22', 'Galaxy S22 Plus', 'Galaxy S22 Ultra', 'Galaxy S23', 'Galaxy S23 Plus', 'Galaxy S23 Ultra', 'Galaxy S24', 'Galaxy S24 Plus', 'Galaxy S24 Ultra', 'Galaxy S25', 'Galaxy S25 Plus', 'Galaxy S25 Ultra'],
      M: ['Galaxy M12', 'Galaxy M13', 'Galaxy M14', 'Galaxy M15', 'Galaxy M23', 'Galaxy M32', 'Galaxy M34', 'Galaxy M35', 'Galaxy M52', 'Galaxy M53', 'Galaxy M54', 'Galaxy M55'],
      Z: ['Galaxy Z Flip3', 'Galaxy Z Flip4', 'Galaxy Z Flip5', 'Galaxy Z Flip6', 'Galaxy Z Fold3', 'Galaxy Z Fold4', 'Galaxy Z Fold5', 'Galaxy Z Fold6'],
      Note: ['Galaxy Note 10', 'Galaxy Note 10 Plus', 'Galaxy Note 20', 'Galaxy Note 20 Ultra'],
    },
    Motorola: {
      'Moto G': ['Moto G20', 'Moto G22', 'Moto G23', 'Moto G24', 'Moto G30', 'Moto G31', 'Moto G32', 'Moto G42', 'Moto G52', 'Moto G53', 'Moto G54', 'Moto G60', 'Moto G62', 'Moto G72', 'Moto G73', 'Moto G84'],
      Edge: ['Edge 20', 'Edge 30', 'Edge 30 Neo', 'Edge 30 Fusion', 'Edge 40', 'Edge 40 Neo', 'Edge 50 Fusion', 'Edge 50 Pro', 'Edge 50 Ultra'],
      Razr: ['Razr 40', 'Razr 40 Ultra', 'Razr 50', 'Razr 50 Ultra'],
      'Moto E': ['Moto E20', 'Moto E22', 'Moto E32', 'Moto E40'],
    },
    Xiaomi: {
      Redmi: ['Redmi 9', 'Redmi 10', 'Redmi 12', 'Redmi 13', 'Redmi Note 10', 'Redmi Note 11', 'Redmi Note 12', 'Redmi Note 13', 'Redmi Note 14'],
      Xiaomi: ['Xiaomi 11 Lite', 'Xiaomi 12', 'Xiaomi 12 Lite', 'Xiaomi 13', 'Xiaomi 13 Lite', 'Xiaomi 13 Pro', 'Xiaomi 14', 'Xiaomi 14T', 'Xiaomi 14T Pro'],
    },
    Redmi: {
      Note: ['Redmi Note 10', 'Redmi Note 11', 'Redmi Note 12', 'Redmi Note 13', 'Redmi Note 14', 'Redmi Note 14 Pro'],
      Redmi: ['Redmi 9', 'Redmi 10', 'Redmi 12', 'Redmi 13'],
    },
    Poco: {
      X: ['Poco X3', 'Poco X4 Pro', 'Poco X5', 'Poco X5 Pro', 'Poco X6', 'Poco X6 Pro'],
      F: ['Poco F3', 'Poco F4', 'Poco F5', 'Poco F6'],
      M: ['Poco M3', 'Poco M4 Pro', 'Poco M5', 'Poco M6'],
    },
    Realme: {
      C: ['Realme C11', 'Realme C21', 'Realme C25', 'Realme C30', 'Realme C33', 'Realme C35', 'Realme C53', 'Realme C55', 'Realme C67'],
      GT: ['Realme GT', 'Realme GT 2', 'Realme GT 3', 'Realme GT 5', 'Realme GT 6'],
      Number: ['Realme 8', 'Realme 9', 'Realme 10', 'Realme 11', 'Realme 12', 'Realme 13'],
    },
    Infinix: {
      Hot: ['Hot 10', 'Hot 11', 'Hot 12', 'Hot 20', 'Hot 30', 'Hot 40', 'Hot 50'],
      Note: ['Note 10', 'Note 11', 'Note 12', 'Note 30', 'Note 40', 'Note 50'],
      Zero: ['Zero 5G', 'Zero 20', 'Zero 30', 'Zero 40'],
      Smart: ['Smart 5', 'Smart 6', 'Smart 7', 'Smart 8', 'Smart 9'],
    },
    Tecno: {
      Spark: ['Spark 8', 'Spark 9', 'Spark 10', 'Spark 20', 'Spark 20 Pro', 'Spark 30'],
      Pova: ['Pova 3', 'Pova 4', 'Pova 5', 'Pova 6'],
      Camon: ['Camon 18', 'Camon 19', 'Camon 20', 'Camon 30'],
      Phantom: ['Phantom X', 'Phantom X2', 'Phantom V Fold'],
    },
    Huawei: {
      Nova: ['Nova 8i', 'Nova 9', 'Nova 10', 'Nova 11', 'Nova 12'],
      Mate: ['Mate 20', 'Mate 30', 'Mate 40', 'Mate 50', 'Mate 60'],
      P: ['P30', 'P40', 'P50', 'P60'],
      Y: ['Y6', 'Y7', 'Y8p', 'Y9'],
    },
    Honor: {
      X: ['Honor X7', 'Honor X8', 'Honor X9', 'Honor X50'],
      Magic: ['Magic 4', 'Magic 5', 'Magic 6', 'Magic V2'],
      Number: ['Honor 50', 'Honor 70', 'Honor 90', 'Honor 200'],
    },
    OnePlus: {
      Nord: ['Nord N10', 'Nord N20', 'Nord N30', 'Nord CE 2', 'Nord CE 3', 'Nord CE 4'],
      Number: ['OnePlus 9', 'OnePlus 10 Pro', 'OnePlus 11', 'OnePlus 12', 'OnePlus 13'],
      Open: ['OnePlus Open'],
    },
    Oppo: {
      A: ['A15', 'A16', 'A17', 'A18', 'A38', 'A58', 'A78', 'A98'],
      Reno: ['Reno 5', 'Reno 6', 'Reno 7', 'Reno 8', 'Reno 10', 'Reno 11', 'Reno 12'],
      Find: ['Find X3', 'Find X5', 'Find X6', 'Find X7'],
    },
    Vivo: {
      Y: ['Y20', 'Y21', 'Y22', 'Y27', 'Y33', 'Y35', 'Y36', 'Y53'],
      V: ['V20', 'V21', 'V23', 'V25', 'V27', 'V29', 'V30', 'V40'],
      X: ['X60', 'X70', 'X80', 'X90', 'X100'],
    },
    Nokia: {
      C: ['C10', 'C20', 'C21', 'C22', 'C32'],
      G: ['G10', 'G11', 'G20', 'G21', 'G22', 'G42'],
      X: ['X10', 'X20', 'X30', 'X50'],
    },
    Asus: {
      Zenfone: ['Zenfone 7', 'Zenfone 8', 'Zenfone 9', 'Zenfone 10', 'Zenfone 11'],
      ROG: ['ROG Phone 3', 'ROG Phone 5', 'ROG Phone 6', 'ROG Phone 7', 'ROG Phone 8'],
    },
    Sony: {
      Xperia: ['Xperia 1 II', 'Xperia 1 III', 'Xperia 1 IV', 'Xperia 1 V', 'Xperia 5 III', 'Xperia 5 IV', 'Xperia 10 IV', 'Xperia 10 V'],
    },
    LG: {
      K: ['K10', 'K11', 'K12', 'K22', 'K41S', 'K51S', 'K52'],
      G: ['G6', 'G7 ThinQ', 'G8 ThinQ'],
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
  },
};

export const MARCAS_COMPLETAS_POR_TIPO: Record<string, string[]> = {
  Smartphone: [...Object.keys(CATALOGO_POR_TIPO.Smartphone), 'Outra'],
};
