import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown } from "lucide-react";
import { Dispatch } from "react";
import { SetStateAction } from "react";

export interface SelectorOption {
    value: string;
    label: string;
}

export default function MultiSelector({ options, selected, setSelected }: { options: SelectorOption[], selected: string[], setSelected: Dispatch<SetStateAction<string[]>> }) {

    const toggleSelection = (value: string) => {
        setSelected(
            selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
        );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between h-max">
                    {selected.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                            {selected.map((value) => (
                                <Badge key={value} className="px-1 py-1">
                                    {options.find((o) => o.value === value)?.label || 'Sin nombre'}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        "Seleccionar"
                    )}
                    <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
                <Command>
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            {options.length > 0 && [options[0]].map(option =>
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => toggleSelection(option.value)}
                                    className='flex justify-between'
                                >
                                    {option.label || 'Sin nombre'}
                                    {selected.includes(option.value) && <Check className="w-4 h-4" />}
                                </CommandItem>
                            )}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Settings">
                            {options.map(option =>
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => toggleSelection(option.value)}
                                    className='flex justify-between'
                                >
                                    {option.label || 'Sin nombre'}
                                    {selected.includes(option.value) && <Check className="w-4 h-4" />}
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover >
    );
}
