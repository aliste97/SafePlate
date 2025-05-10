'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ShoppingItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBasket, PlusCircle, Trash2, Sparkles, Loader2, Lightbulb, X, Package } from 'lucide-react';

const SafePlateApp: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1');
  const [mounted, setMounted] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    try {
      const storedItems = localStorage.getItem('safePlateItems');
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Failed to load items from localStorage", error);
      toast({ title: "Error", description: "Could not load saved items.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('safePlateItems', JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save items to localStorage", error);
        toast({ title: "Error", description: "Could not save items.", variant: "destructive" });
      }
    }
  }, [items, mounted, toast]);

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const quantity = parseInt(newItemQuantity, 10);
    if (newItemName.trim() && quantity > 0) {
      const newItem: ShoppingItem = {
        id: crypto.randomUUID(),
        name: newItemName.trim(),
        quantity,
        purchased: false,
      };
      setItems(prevItems => [newItem, ...prevItems]);
      setNewItemName('');
      setNewItemQuantity('1');
      toast({ title: "Item Added", description: `${newItem.name} added to your list.` });
    } else {
      toast({ title: "Invalid Input", description: "Please enter a valid item name and quantity.", variant: "destructive" });
    }
  };

  const handleTogglePurchased = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    if (itemToDelete) {
      toast({ title: "Item Removed", description: `${itemToDelete.name} removed from your list.`, variant: "destructive" });
    }
  };
  
  const handleQuantityChange = (id: string, change: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      )
    );
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <header className="flex items-center justify-center mb-8 text-primary">
        <ShoppingBasket size={48} className="mr-3" />
        <h1 className="text-4xl font-bold">SafePlate</h1>
      </header>

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-grow w-full sm:w-auto">
              <label htmlFor="itemName" className="block text-sm font-medium text-foreground mb-1">Item Name</label>
              <Input
                id="itemName"
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Apples, Milk"
                required
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-24">
              <label htmlFor="itemQuantity" className="block text-sm font-medium text-foreground mb-1">Quantity</label>
              <Input
                id="itemQuantity"
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                min="1"
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto whitespace-nowrap">
              <PlusCircle size={18} className="mr-2" /> Add Item
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">My Shopping List</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Your shopping list is empty. Add some items!</p>
          ) : (
            <ul className="space-y-3">
              {items.map(item => (
                <li key={item.id} className={`flex items-center gap-3 p-3 rounded-md transition-all duration-300 ${item.purchased ? 'bg-muted/50' : 'bg-card hover:bg-secondary/30'}`}>
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={item.purchased}
                    onCheckedChange={() => handleTogglePurchased(item.id)}
                    aria-label={`Mark ${item.name} as purchased`}
                  />
                  <label htmlFor={`item-${item.id}`} className={`flex-grow cursor-pointer ${item.purchased ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.name}
                  </label>
                  <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.id, -1)} className="h-7 w-7" aria-label="Decrease quantity">
                        <X size={14} />
                      </Button>
                    <span className={`px-2.5 py-1 text-sm font-semibold rounded-full bg-accent text-accent-foreground ${item.purchased ? 'opacity-50' : ''}`}>
                      {item.quantity}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.id, 1)} className="h-7 w-7" aria-label="Increase quantity">
                        <PlusCircle size={14} />
                      </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-destructive hover:text-destructive/80 h-8 w-8" aria-label={`Delete ${item.name}`}>
                    <Trash2 size={18} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SafePlateApp;
