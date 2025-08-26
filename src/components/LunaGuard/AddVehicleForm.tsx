import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVehicles } from '@/hooks/useVehicles';

interface AddVehicleFormProps {
  onClose: () => void;
}

export const AddVehicleForm = ({ onClose }: AddVehicleFormProps) => {
  const [formData, setFormData] = useState({
    model: '',
    plate: '',
    color: '',
    year: new Date().getFullYear(),
    engine: '',
    fuel_type: 'gasolina' as 'gasolina' | 'diesel' | 'electrico' | 'hibrido',
    mileage: 0,
    vin: '',
  });
  const [loading, setLoading] = useState(false);
  const { addVehicle } = useVehicles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addVehicle(formData);
      if (!result?.error) {
        onClose();
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-premium">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Agregar Vehículo</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Ej: Toyota Corolla 2023"
                required
              />
            </div>

            <div>
              <Label htmlFor="plate">Placa</Label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={(e) => setFormData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                placeholder="Ej: ABC-123"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Ej: Blanco"
                  required
                />
              </div>
              <div>
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="engine">Motor</Label>
              <Input
                id="engine"
                value={formData.engine}
                onChange={(e) => setFormData(prev => ({ ...prev, engine: e.target.value }))}
                placeholder="Ej: 1.8L 4-Cylinder"
                required
              />
            </div>

            <div>
              <Label htmlFor="fuel_type">Tipo de Combustible</Label>
              <Select value={formData.fuel_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, fuel_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasolina">Gasolina</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electrico">Eléctrico</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mileage">Kilometraje</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                placeholder="Número de identificación vehicular"
                required
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Agregar Vehículo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};