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
            <SelectTrigger className="px-8 border rounded dark:text-white text-[#374151]">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="dark:bg-background bg-white">
                {options.map(option => (
                    <SelectItem
                        key={option.value}
                        className="dark:text-white text-[#2D2D31]"
                        value={option.value}
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}