import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Plus, Settings2 } from 'lucide-react';
import { ConfigModal } from '../ConfigModal';

export function CRM() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (token) {
      api.getCustomers(token, search ? { search } : {})
        .then(setCustomers)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, search]);

  useEffect(() => {
    const saved = localStorage.getItem('crm-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse config:', e);
      }
    } else {
      setConfig({
        col_ico: true,
        col_nazov: true,
        col_kontakt: true,
        col_email: true,
        col_telefon: true,
        col_segment: true,
        col_ai_score: true,
        col_adresa: false,
      });
    }
  }, []);

  const segmentVariants: Record<string, any> = {
    vip: 'success',
    standardny: 'default',
    novy: 'warning',
    rizikovy: 'error',
  };

  const configSections = [
    {
      title: 'Zobrazované stĺpce',
      fields: [
        { id: 'col_ico', label: 'IČO', type: 'checkbox' as const, defaultValue: true },
        { id: 'col_nazov', label: 'Názov spoločnosti', type: 'checkbox' as const, defaultValue: true },
        { id: 'col_kontakt', label: 'Kontaktná osoba', type: 'checkbox' as const, defaultValue: true },
        { id: 'col_email', label: 'Email', type: 'checkbox' as const, defaultValue: true },
        { id: 'col_telefon', label: 'Telefón', type: 'checkbox' as const, defaultValue: true },
        { id: 'col_segment', label: 'Segment', type: 'checkbox' as const, defaultValue: true },
        { id: 'col_ai_score', label: 'AI Skóre', type: 'checkbox' as const, defaultValue: true },
        { id: 'col_adresa', label: 'Adresa', type: 'checkbox' as const, defaultValue: false },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Zákazníci (CRM)</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfigOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Pridať zákazníka
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Hľadať zákazníkov..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">Načítavam...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Firma</th>
                {config.col_ico && <th className="text-left p-3 font-medium">IČO</th>}
                {config.col_kontakt && <th className="text-left p-3 font-medium">Kontakt</th>}
                {config.col_email && <th className="text-left p-3 font-medium">Email</th>}
                {config.col_telefon && <th className="text-left p-3 font-medium">Telefón</th>}
                {config.col_adresa && <th className="text-left p-3 font-medium">Adresa</th>}
                {config.col_segment && <th className="text-left p-3 font-medium">Segment</th>}
                {config.col_ai_score && <th className="text-left p-3 font-medium">AI Score</th>}
                <th className="text-left p-3 font-medium">Insight</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="p-3 font-medium">{customer.companyName}</td>
                  {config.col_ico && <td className="p-3 text-muted-foreground">{customer.ico}</td>}
                  {config.col_kontakt && <td className="p-3">{customer.contactName}</td>}
                  {config.col_email && <td className="p-3 text-muted-foreground text-xs">{customer.contactEmail}</td>}
                  {config.col_telefon && <td className="p-3 text-muted-foreground text-xs">{customer.contactPhone}</td>}
                  {config.col_adresa && <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{customer.address}</td>}
                  {config.col_segment && (
                    <td className="p-3">
                      <Badge variant={segmentVariants[customer.segment || 'standardny']}>
                        {customer.segment}
                      </Badge>
                    </td>
                  )}
                  {config.col_ai_score && (
                    <td className="p-3">
                      <span className="font-medium">{customer.aiScore}%</span>
                    </td>
                  )}
                  <td className="p-3 max-w-[250px]">
                    {customer.id % 3 === 0 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">📉 Objednávky -35%</span>
                    )}
                    {customer.id % 3 === 1 && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">⚠️ 45 dní bez obj.</span>
                    )}
                    {customer.id % 3 === 2 && customer.segment === 'vip' && (
                      <span className="text-xs text-green-600 dark:text-green-400">⭐ 23 obj./rok</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfigModal
        open={configOpen}
        onOpenChange={setConfigOpen}
        title="Konfigurácia zobrazenia zákazníkov"
        sections={configSections}
        storageKey="crm-config"
        onSave={setConfig}
      />
    </div>
  );
}
