"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MoneyInputProps {
  label?: string;
  value: { txn: string; base: string };
  onChange: (value: { txn: string; base: string }) => void;
  currency?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ label, value, onChange, currency = "USD", className, placeholder, required, error }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Remove any non-numeric characters except decimal point
      const numericValue = inputValue.replace(/[^0-9.]/g, "");
      
      // Ensure only one decimal point
      const parts = numericValue.split(".");
      const formattedValue = parts.length > 2 
        ? parts[0] + "." + parts.slice(1).join("")
        : numericValue;
      
      // Limit to 2 decimal places
      const finalValue = parts.length === 2 && parts[1].length > 2
        ? parts[0] + "." + parts[1].substring(0, 2)
        : formattedValue;
      
      onChange({
        txn: finalValue,
        base: finalValue
      });
    };

    const formatDisplayValue = (value: string) => {
      if (!value) return "";
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      return num.toFixed(2);
    };

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label htmlFor="money-input">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {currency}
          </div>
          <Input
            ref={ref}
            id="money-input"
            type="text"
            value={formatDisplayValue(value.txn)}
            onChange={handleChange}
            placeholder={placeholder || "0.00"}
            className={cn(
              "pl-12 text-right font-mono",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

MoneyInput.displayName = "MoneyInput";
