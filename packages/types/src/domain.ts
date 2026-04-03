// Domain types serão migrados de apps/web/lib/types/ gradualmente
export interface Academy {
  id: string;
  name: string;
  cnpj?: string;
  city?: string;
  state?: string;
}
