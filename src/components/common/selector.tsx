import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SelectorOption {
    value: string;
    label: string;
}

export default function Selector({
    placeholder,
    options,
    setSelectedValue,
    value,
}: {
    placeholder: string;
    options: SelectorOption[];
    setSelectedValue: (value: string) => void;
    value?: string | null;
}) {

    return (
        <Select onValueChange={setSelectedValue} value={value ?? undefined}>
            <SelectTrigger className="px-8 border rounded text-primary">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-background">
                {options.map(option => (
                    <SelectItem
                        key={option.value}
                        className="text-primary"
                        value={option.value}
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}