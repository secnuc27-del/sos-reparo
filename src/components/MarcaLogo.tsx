import { useEffect, useState } from "react";

const SLUGS: Record<string, string> = {
  apple: "apple",
  "apple (ipad)": "apple",
  iphone: "apple",
  ipad: "apple",
  macbook: "apple",
  galaxy: "samsung",
  ps5: "playstation",
  ps4: "playstation",
  samsung: "samsung",
  motorola: "motorola",
  xiaomi: "xiaomi",
  redmi: "xiaomi",
  poco: "poco",
  realme: "realme",
  infinix: "infinix",
  tecno: "tecno",
  huawei: "huawei",
  honor: "honor",
  oneplus: "oneplus",
  oppo: "oppo",
  vivo: "vivo",
  nokia: "nokia",
  asus: "asus",
  sony: "sony",
  lg: "lg",
  tcl: "tcl",
  zte: "zte",
  alcatel: "alcatel",
  itel: "itel",
  dell: "dell",
  hp: "hp",
  lenovo: "lenovo",
  acer: "acer",
  vaio: "vaio",
  avell: "avell",
  positivo: "positivo",
  master: "positivo",
  microsoft: "microsoft",
  amazon: "amazon",
  valve: "steam",
  playstation: "playstation",
  sonyplaystation: "playstation",
  xbox: "xbox",
  nintendo: "nintendo",
  epson: "epson",
  canon: "canon",
  brother: "brother",
  lexmark: "lexmark",
  xerox: "xerox",
  elgin: "elgin",
  pantum: "pantum",
  kyocera: "kyocera",
};

const TAMANHOS = {
  sm: { caixa: "h-7 w-7 rounded-lg", imagem: "h-4 w-4", texto: "text-[9px]" },
  md: { caixa: "h-9 w-9 rounded-xl", imagem: "h-5 w-5", texto: "text-[10px]" },
  lg: { caixa: "h-11 w-11 rounded-xl", imagem: "h-6 w-6", texto: "text-xs" },
};

function slugDaMarca(marca: string) {
  const nome = marca.trim().toLowerCase();
  return SLUGS[nome] || SLUGS[nome.replace(/\s+/g, "")];
}

function iniciaisDaMarca(marca: string) {
  const partes = marca.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  return partes.map((parte) => parte[0]).join("").slice(0, 2).toUpperCase();
}

type MarcaLogoProps = {
  marca: string;
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
};

export function MarcaLogo({ marca, tamanho = "md", className = "" }: MarcaLogoProps) {
  const [falhou, setFalhou] = useState(false);
  const slug = slugDaMarca(marca);
  const dimensoes = TAMANHOS[tamanho];

  useEffect(() => {
    setFalhou(false);
  }, [slug]);

  return (
    <span
      title={marca || "Marca não informada"}
      className={"inline-flex shrink-0 items-center justify-center border border-border bg-white shadow-sm " + dimensoes.caixa + " " + className}
    >
      {slug && !falhou ? (
        <img
          src={"https://cdn.simpleicons.org/" + slug}
          alt=""
          aria-hidden="true"
          className={dimensoes.imagem + " object-contain"}
          onError={() => setFalhou(true)}
        />
      ) : (
        <span className={"font-black text-primary " + dimensoes.texto}>
          {iniciaisDaMarca(marca)}
        </span>
      )}
    </span>
  );
}
