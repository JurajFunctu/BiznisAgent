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
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerPricing, setCustomerPricing] = useState<any>({});

  useEffect(() => {
    if (token) {
      api.getCustomers(token, search ? { search } : {})
        .then(setCustomers)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, search]);

  useEffect(() => {
    const savedPricing = localStorage.getItem('customer-pricing');
    if (savedPricing) setCustomerPricing(JSON.parse(savedPricing));
  }, []);

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
                <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className={`border-b hover:bg-muted/30 transition-colors cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-primary/10' : ''}`}>
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

      {/* Customer Detail Panel with Pricing */}
      {selectedCustomer && (
        <div className="mt-4 border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{selectedCustomer.companyName}</h3>
              <p className="text-sm text-muted-foreground">IČO: {selectedCustomer.ico} | {selectedCustomer.contactName} | {selectedCustomer.contactEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={segmentVariants[selectedCustomer.segment || 'standardny']}>{selectedCustomer.segment}</Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>✕</Button>
            </div>
          </div>

          {/* Custom Pricing Section */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                💰 Individuálny cenník a zľavy
                <Settings2 className="w-4 h-4 text-muted-foreground cursor-pointer" />
              </h4>
              <p className="text-xs text-muted-foreground">Agent automaticky aplikuje pri tvorbe CP a FA</p>
            </div>

            <div className="space-y-3">
              {/* Global discount */}
              <div className="flex items-center gap-4 p-3 border rounded-lg bg-background">
                <span className="text-sm font-medium w-48">Paušálna zľava:</span>
                <Input
                  type="number"
                  className="w-24 h-8"
                  placeholder="0"
                  value={customerPricing[selectedCustomer.id]?.globalDiscount || ''}
                  onChange={(e) => {
                    const updated = { ...customerPricing, [selectedCustomer.id]: { ...customerPricing[selectedCustomer.id], globalDiscount: e.target.value } };
                    setCustomerPricing(updated);
                    localStorage.setItem('customer-pricing', JSON.stringify(updated));
                  }}
                />
                <span className="text-sm text-muted-foreground">%</span>
                <span className="text-xs text-primary ml-auto">Agent aplikuje automaticky na všetky položky</span>
              </div>

              {/* Payment terms */}
              <div className="flex items-center gap-4 p-3 border rounded-lg bg-background">
                <span className="text-sm font-medium w-48">Splatnosť faktúr:</span>
                <select 
                  className="h-8 px-3 rounded border bg-background text-sm"
                  value={customerPricing[selectedCustomer.id]?.paymentDays || '30'}
                  onChange={(e) => {
                    const updated = { ...customerPricing, [selectedCustomer.id]: { ...customerPricing[selectedCustomer.id], paymentDays: e.target.value } };
                    setCustomerPricing(updated);
                    localStorage.setItem('customer-pricing', JSON.stringify(updated));
                  }}
                >
                  <option value="7">7 dní</option>
                  <option value="14">14 dní</option>
                  <option value="30">30 dní</option>
                  <option value="60">60 dní</option>
                  <option value="90">90 dní</option>
                </select>
              </div>

              {/* Product-specific pricing */}
              <div className="p-3 border rounded-lg bg-background">
                <p className="text-sm font-medium mb-2">Individuálne ceny produktov:</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Produkt</th>
                      <th className="text-left p-2">Katalógová cena</th>
                      <th className="text-left p-2">Zákaznícka cena</th>
                      <th className="text-left p-2">Zľava</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { code: 'HV-200', name: 'Hydraulický valec HV-200', catalogPrice: 890 },
                      { code: 'T-45', name: 'Tesnenie T-45', catalogPrice: 12.50 },
                      { code: 'MS-HV', name: 'Montážna sada MS-HV', catalogPrice: 45 },
                      { code: 'KS-100', name: 'Kompresný systém KS-100', catalogPrice: 1250 },
                      { code: 'FP-30', name: 'Filter priemyselný FP-30', catalogPrice: 78 },
                    ].map(product => {
                      const custPrice = customerPricing[selectedCustomer.id]?.products?.[product.code];
                      const discount = custPrice ? Math.round((1 - custPrice / product.catalogPrice) * 100) : (customerPricing[selectedCustomer.id]?.globalDiscount || 0);
                      return (
                        <tr key={product.code} className="border-b">
                          <td className="p-2">{product.code} — {product.name}</td>
                          <td className="p-2">{product.catalogPrice.toFixed(2)} €</td>
                          <td className="p-2">
                            <Input
                              type="number"
                              className="w-24 h-6 text-xs"
                              placeholder={`${(product.catalogPrice * (1 - (customerPricing[selectedCustomer.id]?.globalDiscount || 0) / 100)).toFixed(2)}`}
                              value={custPrice || ''}
                              onChange={(e) => {
                                const products = { ...(customerPricing[selectedCustomer.id]?.products || {}), [product.code]: e.target.value };
                                const updated = { ...customerPricing, [selectedCustomer.id]: { ...customerPricing[selectedCustomer.id], products } };
                                setCustomerPricing(updated);
                                localStorage.setItem('customer-pricing', JSON.stringify(updated));
                              }}
                            />
                          </td>
                          <td className="p-2 text-green-600 dark:text-green-400 font-medium">-{discount}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-primary">💡 Agent automaticky použije individuálny cenník pri generovaní CP a FA pre tohto zákazníka.</p>
            </div>
          </div>
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
