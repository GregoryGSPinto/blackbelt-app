// BlackBelt v2 — CEP auto-fill via ViaCEP (public API, no limits)

export interface CepAddress {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export async function fetchAddressByCep(cep: string): Promise<CepAddress | null> {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.erro) return null;

    return {
      logradouro: data.logradouro ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
      estado: data.uf ?? '',
    };
  } catch {
    return null;
  }
}
