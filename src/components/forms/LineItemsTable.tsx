"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoneyInput } from "./MoneyInput";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn, calculateTotal, createMoney } from "@/lib/utils";

export interface LineItem {
  id: string;
  seq: number;
  itemId?: string;
  description: string;
  qty: string;
  uom: string;
  unitPrice: { txn: string; base: string };
  total: { txn: string; base: string };
  memo?: string;
}

interface LineItemsTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  className?: string;
  showItemColumn?: boolean;
  showMemoColumn?: boolean;
  uomOptions?: string[];
}

export function LineItemsTable({
  items,
  onChange,
  className,
  showItemColumn = true,
  showMemoColumn = true,
  uomOptions = ["EA", "HR", "LB", "KG", "L", "M", "FT", "IN"]
}: LineItemsTableProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      seq: items.length + 1,
      description: "",
      qty: "1",
      uom: "EA",
      unitPrice: createMoney("0.00"),
      total: createMoney("0.00"),
      memo: ""
    };
    onChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    // Re-sequence items
    const resequencedItems = newItems.map((item, index) => ({
      ...item,
      seq: index + 1
    }));
    onChange(resequencedItems);
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total when qty or unitPrice changes
        if (field === "qty" || field === "unitPrice") {
          const qty = parseFloat(field === "qty" ? value : updatedItem.qty);
          const unitPrice = parseFloat(field === "unitPrice" ? value.txn : updatedItem.unitPrice.txn);
          const total = qty * unitPrice;
          updatedItem.total = createMoney(total.toString());
        }
        
        return updatedItem;
      }
      return item;
    });
    onChange(newItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    // Re-sequence items
    const resequencedItems = newItems.map((item, index) => ({
      ...item,
      seq: index + 1
    }));
    onChange(resequencedItems);
  };

  const total = calculateTotal(items);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Line Items</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-12">#</TableHead>
              {showItemColumn && (
                <TableHead className="w-32">Item</TableHead>
              )}
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="w-20">Qty</TableHead>
              <TableHead className="w-20">UOM</TableHead>
              <TableHead className="w-24 text-right">Unit Price</TableHead>
              <TableHead className="w-24 text-right">Total</TableHead>
              {showMemoColumn && (
                <TableHead className="w-32">Memo</TableHead>
              )}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 cursor-grab"
                    onMouseDown={() => setDraggedIndex(index)}
                    onMouseUp={() => setDraggedIndex(null)}
                    onMouseLeave={() => setDraggedIndex(null)}
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {item.seq}
                  </div>
                </TableCell>
                {showItemColumn && (
                  <TableCell>
                    <Input
                      value={item.itemId || ""}
                      onChange={(e) => updateItem(item.id, "itemId", e.target.value)}
                      placeholder="Item ID"
                      className="h-8"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Description"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                    placeholder="0"
                    className="h-8 text-right"
                    min="0"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <select
                    value={item.uom}
                    onChange={(e) => updateItem(item.id, "uom", e.target.value)}
                    className="h-8 w-full border rounded px-2 text-sm"
                  >
                    {uomOptions.map(uom => (
                      <option key={uom} value={uom}>{uom}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <MoneyInput
                    value={item.unitPrice}
                    onChange={(value) => updateItem(item.id, "unitPrice", value)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <div className="text-right font-mono text-sm">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(parseFloat(item.total.txn))}
                  </div>
                </TableCell>
                {showMemoColumn && (
                  <TableCell>
                    <Input
                      value={item.memo || ""}
                      onChange={(e) => updateItem(item.id, "memo", e.target.value)}
                      placeholder="Memo"
                      className="h-8"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-mono">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(parseFloat(total))}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax:</span>
            <span className="font-mono">$0.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping:</span>
            <span className="font-mono">$0.00</span>
          </div>
          <div className="flex justify-between text-base font-medium border-t pt-2">
            <span>Total:</span>
            <span className="font-mono">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(parseFloat(total))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
