import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Loader2, Plus, Search } from "lucide-react";

export interface SmartSearchOption {
  id: string | number;
  label: string;
  sublabel?: string;
  data?: any;
}

export interface SmartSearchInputProps {
  value?: string | number;
  onSelect: (option: SmartSearchOption | null) => void;
  onSearch: (query: string) => Promise<SmartSearchOption[]>;
  onCreate?: (query: string) => Promise<SmartSearchOption | null>;
  placeholder?: string;
  emptyText?: string;
  createText?: string;
  disabled?: boolean;
  className?: string;
  allowCreate?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  debounceMs?: number;
}

export function SmartSearchInput({
  value,
  onSelect,
  onSearch,
  onCreate,
  placeholder = "Search...",
  emptyText = "No results found",
  createText = "Create new",
  disabled = false,
  className,
  allowCreate = true,
  showBadge = false,
  badgeText = "New",
  debounceMs = 300,
}: SmartSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SmartSearchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SmartSearchOption | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Fetch options when query changes
  const fetchOptions = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setOptions([]);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);

      try {
        const results = await onSearch(searchQuery);
        setOptions(results);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
          setOptions([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [onSearch]
  );

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query) {
      timeoutRef.current = setTimeout(() => {
        fetchOptions(query);
      }, debounceMs);
    } else {
      setOptions([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, fetchOptions, debounceMs]);

  // Handle selection
  const handleSelect = (option: SmartSearchOption) => {
    setSelectedOption(option);
    setQuery(option.label);
    setOpen(false);
    onSelect(option);
  };

  // Handle create new
  const handleCreate = async () => {
    if (!onCreate || !query.trim()) return;

    setLoading(true);
    try {
      const newOption = await onCreate(query);
      if (newOption) {
        handleSelect(newOption);
      }
    } catch (error) {
      console.error('Create error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuery("");
    setSelectedOption(null);
    setOptions([]);
    onSelect(null);
  };

  // Handle button click to toggle popover
  const handleButtonClick = () => {
    if (disabled) return;
    setOpen(!open);
    if (!open && !query) {
      // Trigger search with empty query to show all options
      fetchOptions("");
    }
  };

  // Display value
  const displayValue = selectedOption?.label || (query || "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          onClick={handleButtonClick}
          className={cn(
            "w-full justify-between font-normal",
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {displayValue || placeholder}
            </span>
            {showBadge && selectedOption && (
              <Badge variant="secondary" className="ml-auto shrink-0">
                {badgeText}
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            className="h-11"
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {!loading && options.length === 0 && query && (
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {emptyText}
                  </p>
                  {allowCreate && onCreate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCreate}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {createText}: "{query}"
                    </Button>
                  )}
                </div>
              </CommandEmpty>
            )}

            {!loading && options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedOption?.id === option.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium truncate">{option.label}</div>
                      {option.sublabel && (
                        <div className="text-xs text-muted-foreground truncate">
                          {option.sublabel}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
                {allowCreate && onCreate && query && (
                  <CommandItem
                    onSelect={handleCreate}
                    className="border-t cursor-pointer text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createText}: "{query}"
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
