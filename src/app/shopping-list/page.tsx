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
import { useSignOut } from 'react-firebase-hooks/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig'; // Firebase config
import { useRouter } from 'next/navigation';

const SafePlateApp: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1');
  const [mounted, setMounted] = useState(false);

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [signOut, loadingSignOut, errorSignOut] = useSignOut(auth);
  const [user, loadingUser, errorUser] = useAuthState(auth); // Get the current user
  const router = useRouter();

  useEffect(() => {
    if (!loadingSignOut && !loadingUser && !user) {
      // Redirect to login page if signed out
      router.push('/auth');
    }
    // Add error handling for signOut error if needed
     if (errorSignOut) {
       console.error("Sign out error:", errorSignOut);
       toast({ title: "Error", description: "Could not sign out.", variant: "destructive" });
     }
  }, [loadingSignOut, loadingUser, user, router, errorSignOut, toast]);

 useEffect(() => {
  if (user) { // Only fetch if user is logged in
      const fetchShoppingItems = async () => {
        setIsLoading(true);
        try {
          const itemsCollectionRef = collection(db, 'users', user.uid, 'shoppingItems');
          const q = query(itemsCollectionRef, orderBy("name")); // Example: order by name
          const querySnapshot = await getDocs(q);
          const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingItem));
          setItems(fetchedItems);
          setMounted(true); // Set mounted after initial data load
        } catch (error) {
          console.error("Error fetching shopping items: ", error);
          toast({ title: "Error", description: "Could not fetch shopping items.", variant: "destructive" })
        } finally {
          setIsLoading(false);
        }
      };
    
      fetchShoppingItems();
    }
  }, [toast, user]); // Add user to dependencies

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!user) return; // Ensure user is logged in

    e.preventDefault(); // Make sure this is the VERY FIRST line

    const quantity = parseInt(newItemQuantity, 10); // Define quantity here
    if (!newItemName.trim() || quantity <= 0) {
      toast({ title: "Invalid Input", description: "Please enter a valid item name and quantity.", variant: "destructive" });
      return;
    }
    const newItemData = { // Data without ID for Firestore
      name: newItemName.trim(),
      quantity,
      purchased: false,
    };

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'shoppingItems'), newItemData);
      const newItemWithId: ShoppingItem = { id: docRef.id, ...newItemData };
      // Add to local state and sort
      setItems(prevItems => [...prevItems, newItemWithId].sort((a, b) => a.name.localeCompare(b.name)));
      setNewItemName('');
      setNewItemQuantity('1');
      toast({ title: "Item Added", description: `${newItemData.name} added to your list.` });
    } catch (error) {
      console.error("[SafePlateApp] Error adding item to Firestore: ", error);
      toast({ title: "Error", description: "Could not add item.", variant: "destructive" });
    }
  };

  const handleTogglePurchased = async (id: string) => {
    if (!user) return; // Ensure user is logged in
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newPurchasedState = !item.purchased;
    const itemRef = doc(db, 'users', user.uid, 'shoppingItems', id);
    try {
      await updateDoc(itemRef, { purchased: newPurchasedState });
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === id ? { ...i, purchased: newPurchasedState } : i
        )
      );
    } catch (error) {
      console.error("Error updating item purchased state: ", error);
      toast({ title: "Error", description: "Could not update item status.", variant: "destructive" });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!user) return; // Ensure user is logged in
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return;

    const itemRef = doc(db, 'users', user.uid, 'shoppingItems', id);
    try {
      await deleteDoc(itemRef);
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      toast({ title: "Item Removed", description: `${itemToDelete.name} removed from your list.`, variant: "destructive" });
    } catch (error) {
      console.error("Error deleting item: ", error);
      toast({ title: "Error", description: "Could not delete item.", variant: "destructive" });
    }
  };
  
  const handleQuantityChange = async (id: string, change: number) => {
    if (!user) return; // Ensure user is logged in
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + change);
     if (newQuantity === item.quantity && change !== 0) { // Avoid update if quantity is already 1 and trying to decrease
        if (newQuantity === 1 && change < 0) {
             toast({ title: "Info", description: "Quantity cannot be less than 1.", variant: "default" });
        }
        return;
    }
    const itemRef = doc(db, 'users', user.uid, 'shoppingItems', id);
    try {
      await updateDoc(itemRef, { quantity: newQuantity });
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === id ? { ...i, quantity: newQuantity } : i
        )
      );
    } catch (error) {
      console.error("Error updating item quantity: ", error);
      toast({ title: "Error", description: "Could not update item quantity.", variant: "destructive" });
    }
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
      <header className="flex flex-col items-center justify-center mb-8 text-primary">
        <div className="flex items-center justify-between w-full max-w-2xl mb-4">
          {/* Assuming you want the logo/icon and title on the left and logout on the right */}
          <ShoppingBasket size={48} className="mr-3" />
          <h1 className="text-4xl font-bold">SafePlate</h1>
          <Button onClick={() => signOut()} disabled={loadingSignOut} variant="destructive">
            Logout
          </Button>
        </div>
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
