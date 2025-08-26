import { useState, useEffect } from 'react';
import { Plus, Car, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAdminVehicles } from '@/hooks/useAdminVehicles';
import { useToast } from '@/hooks/use-toast';

export const CreateVehicleDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    plate: '',
    color: '',
    year: new Date().getFullYear(),
    engine: '',
    fuel_type: 'gasolina' as 'gasolina' | 'diesel' | 'electrico' | 'hibrido',
    mileage: 0,
    vin: '',
    user_id: '',
  });

  const { users, fetchUsers } = useAdminUsers();
  const { addVehicle } = useAdminVehicles();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id) {
      toast({
        title: "Error",
        description: "Debes seleccionar un propietario para el vehículo",
        variant: "destructive",
      });
      return;
    }

    const result = await addVehicle(formData);
    
    if (!result.error) {
      // Reset form
      setFormData({
        model: '',
        plate: '',
        color: '',
        year: new Date().getFullYear(),
        engine: '',
        fuel_type: 'gasolina',
        mileage: 0,
        vin: '',
        user_id: '',
      });
      
      // Close modal automatically
      setOpen(false);
      
      // Note: The success toast is already shown in the addVehicle function
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Crear Vehículo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Car size={20} />
            <span>Crear Nuevo Vehículo</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Propietario */}
          <div className="space-y-2">
            <Label htmlFor="user_id" className="flex items-center space-x-2">
              <User size={16} />
              <span>Propietario *</span>
            </Label>
            <Select 
              value={formData.user_id} 
              onValueChange={(value) => handleChange('user_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar usuario..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.first_name} {user.last_name} - {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Información del vehículo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Toyota Corolla"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Año *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleChange('year', parseInt(e.target.value))}
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa *</Label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
                placeholder="ABC-123"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="Rojo"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel_type">Tipo de Combustible *</Label>
            <Select 
              value={formData.fuel_type} 
              onValueChange={(value: any) => handleChange('fuel_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasolina">Gasolina</SelectItem>
                <SelectItem value="diesel">Diésel</SelectItem>
                <SelectItem value="electrico">Eléctrico</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="engine">Motor *</Label>
            <Input
              id="engine"
              value={formData.engine}
              onChange={(e) => handleChange('engine', e.target.value)}
              placeholder="1.8L 4 cilindros"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mileage">Kilometraje</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => handleChange('mileage', parseInt(e.target.value) || 0)}
                placeholder="50000"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) => handleChange('vin', e.target.value.toUpperCase())}
                placeholder="1HGBH41JXMN109186"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Vehículo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};