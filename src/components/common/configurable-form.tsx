"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Path, useForm, UseFormSetValue, DefaultValues } from "react-hook-form";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { fetchWithToast } from "@/hooks/fetch-with-toast";
import { forwardRef, useImperativeHandle, useMemo, useRef, useCallback } from "react";
import MultiSelector from "@/components/common/multi-selector";
import Selector from "@/components/common/selector";
import { getZodRequiredFields } from "@/lib/utils";
import { CompactInput } from "@/components/ui/compact-input";
import { StatefulButton, StatefulButtonRef } from "../ui/stateful-button";
import { Switch } from "@/components/ui/switch";

type ConfigurableFormProps<T extends z.ZodObject<any>> = {
    formSchema: T;
    endpoint: string;
    entityName: string;
    displayNames: Record<string, string>;
    defaultValues: z.infer<T>;
    buttonTitle?: string;
    headerTitle?: string;
    loadingTitle?: string;
    onSuccess?: () => void;
    extraData?: Record<string, unknown>;
    className?: string;
    selectorList?: string[]
    multiSelectorList?: string[]
    switchList?: string[]
    optionsMap?: Record<string, Array<{ value: string; label: string }>>;
    endpointType?: string;
    isSubmitDisabled?: boolean;
    passwordList?: string[]
    dateList?: string[]
    containerClassName?: string;
    exclusionList?: string[];
    onError?: (error: unknown) => void;
    onFormSuccess?: () => void; // New prop for parent callback
};

export type ConfigurableFormRef<T extends z.ZodObject<any>> = {
    setValue: UseFormSetValue<z.infer<T>>;
    getValues: () => z.infer<T>;
    loading: boolean;
};

export const ConfigurableForm = forwardRef(function ConfigurableForm<T extends z.ZodObject<any>>({
    formSchema,
    endpoint,
    entityName,
    displayNames,
    defaultValues,
    buttonTitle = "Save",
    headerTitle = "Form",
    loadingTitle = "Saving...",
    onSuccess,
    onError,
    extraData = {},
    className,
    selectorList,
    multiSelectorList,
    switchList,
    optionsMap,
    endpointType,
    isSubmitDisabled,
    passwordList,
    dateList,
    containerClassName,
    exclusionList,
    onFormSuccess
}: ConfigurableFormProps<T>, ref: React.Ref<ConfigurableFormRef<T>>) {
    // Define the form data type
    type FormData = z.infer<T>;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: defaultValues as DefaultValues<FormData>,
        mode: 'onChange'
    });

    const buttonRef = useRef<StatefulButtonRef>(null);

    useImperativeHandle(ref, () => ({
        setValue: form.setValue,
        getValues: form.getValues,
        loading: form.formState.isSubmitting
    }));

    const requiredList = useMemo(() => getZodRequiredFields(formSchema), [formSchema])

    // Automatically detect field types from schema
    const autoDetectedLists = useMemo(() => {
        const selectorFields: string[] = [];
        const switchFields: string[] = [];
        const dateFields: string[] = [];
        const arrayFields: string[] = [];
        const numericFields: string[] = [];
        const objectFields: string[] = [];

        for (const [fieldName, fieldSchema] of Object.entries(formSchema.shape)) {
            // Skip excluded fields
            if (exclusionList?.includes(fieldName)) continue;

            // Use more robust type detection with proper type assertions
            const fieldType = (fieldSchema as any)._def?.typeName;
            let actualType = fieldType;
            let currentSchema = fieldSchema as any;

            // Recursively unwrap ZodDefault and ZodOptional to get the actual type
            while (currentSchema.constructor.name === 'ZodDefault' || currentSchema.constructor.name === 'ZodOptional') {
                if (currentSchema._def?.innerType?.def?.type) {
                    actualType = currentSchema._def.innerType.def.type;
                } else if (currentSchema._def?.innerType?.type) {
                    actualType = currentSchema._def.innerType.type;
                }
                // Move to the inner type for next iteration
                currentSchema = currentSchema._def?.innerType;
            }

            if (actualType === 'enum' || actualType === 'union') {
                selectorFields.push(fieldName);
            } else if (actualType === 'boolean') {
                switchFields.push(fieldName);
            } else if (actualType === 'date') {
                dateFields.push(fieldName);
            } else if (actualType === 'array') {
                arrayFields.push(fieldName);
            } else if (actualType === 'number' || actualType === 'int' || actualType === 'float') {
                numericFields.push(fieldName);
            } else if (actualType === 'object') {
                objectFields.push(fieldName);
            } else if (fieldName.endsWith('Id')) {
                // Auto-detect ID fields as selectors (e.g., teacherId, studentId, locationId)
                selectorFields.push(fieldName);
            }
        }

        return {
            selectorFields,
            switchFields,
            dateFields,
            arrayFields,
            numericFields,
            objectFields
        };
    }, [formSchema, exclusionList]);

    // Use provided lists or fall back to auto-detected ones
    const finalSelectorList = selectorList && selectorList.length > 0 ? selectorList : autoDetectedLists.selectorFields;
    const finalSwitchList = switchList && switchList.length > 0 ? switchList : autoDetectedLists.switchFields;
    const finalDateList = dateList && dateList.length > 0 ? dateList : autoDetectedLists.dateFields;
    const finalArrayList = multiSelectorList && multiSelectorList.length > 0 ? multiSelectorList : autoDetectedLists.arrayFields;
    const finalNumericList = autoDetectedLists.numericFields;

    // Debug logging to see what's being detected
    // console.log('Schema analysis:', {
    //     schemaShape: Object.keys(formSchema.shape),
    //     exclusionList,
    //     autoDetectedLists,
    //     finalLists: {
    //         selector: finalSelectorList,
    //         switch: finalSwitchList,
    //         date: finalDateList,
    //         array: finalArrayList,
    //         numeric: finalNumericList,
    //         object: autoDetectedLists.objectFields
    //     }
    // });

    const handleFinish = useCallback((success: boolean) => {
        if (buttonRef.current) {
            buttonRef.current.finishAnimation(success);
        }
    }, []);

    console.log(endpoint, 'endpoint');
    const { onPost, onPatch, loading } = fetchWithToast(
        endpoint,
        entityName,
        form.getValues(),
        onSuccess,
        false,
        undefined,
        (success: boolean) => {
            handleFinish(success);
            if (success && onFormSuccess) {
                onFormSuccess();
            }
        }
    );

    const { isValid, isDirty, isSubmitting } = form.formState;

    const isButtonDisabled = isSubmitDisabled || !isValid || !isDirty || isSubmitting || loading;

    return (
        <div className={containerClassName}>
            <Form {...form}>
                <form
                    {...(className ? { className } : { className: "space-y-4" })}
                    onSubmit={form.handleSubmit(async (data) => {
                        const mergedData = { ...data, ...extraData };
                        try {
                            if (endpointType === 'PATCH') {
                                await onPatch(mergedData);
                            } else {
                                await onPost(mergedData);
                            }
                        } catch (error) {
                            buttonRef.current?.finishAnimation(false);
                            onError?.(error);
                        }
                    })}
                >
                    {Object.keys(defaultValues).filter(fieldKey =>
                        !exclusionList?.includes(fieldKey) &&
                        !autoDetectedLists.objectFields.includes(fieldKey)
                    ).map((fieldKey) => (
                        <FormField
                            key={fieldKey}
                            control={form.control}
                            name={fieldKey as Path<FormData>}
                            render={({ field }) => (
                                finalSelectorList?.includes(fieldKey) ? (
                                    <FormItem className="space-y-0">
                                        <FormLabel>
                                            {`${displayNames[fieldKey]}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                        </FormLabel>
                                        <FormControl>
                                            <Selector
                                                setSelectedValue={(value) => {
                                                    field.onChange(value)
                                                    form.trigger(fieldKey as Path<FormData>)
                                                    // if (fieldKey === 'companyId' && optionsMap.companyId) {
                                                    //     const selected = optionsMap.companyId.find((c: any) => c.value === value);
                                                    //     form.setValue('companyName' as Path<FormData>, selected ? selected.label : '');
                                                    // }
                                                }}
                                                placeholder={'Select'}
                                                options={optionsMap?.[fieldKey] || []}
                                                value={field.value as string}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ) : finalArrayList?.includes(fieldKey) ? (
                                    <FormItem>
                                        <FormLabel>
                                            {`${displayNames[fieldKey]}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                        </FormLabel>
                                        <FormControl>
                                            <MultiSelector
                                                options={optionsMap?.[fieldKey] || []}
                                                setSelected={(value) => {
                                                    field.onChange(value)
                                                    form.trigger(fieldKey as Path<FormData>)
                                                }}
                                                selected={field.value as string[]}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ) : finalSwitchList?.includes(fieldKey) ? (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>
                                            {`${displayNames[fieldKey]}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                        </FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value as boolean}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ) : finalNumericList?.includes(fieldKey) ? (
                                    <FormItem>
                                        <FormControl>
                                            <CompactInput
                                                label={`${displayNames ? displayNames[fieldKey] : fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                                {...field}
                                                type="number"
                                                step="any"
                                                placeholder={`Ingresa ${displayNames ? displayNames[fieldKey]?.toLowerCase() : fieldKey}`}
                                                value={field.value as string | number}
                                                onChange={(e) => {
                                                    // Clear field error when user starts typing
                                                    if (form.formState.errors[fieldKey as Path<FormData>]) {
                                                        form.clearErrors(fieldKey as Path<FormData>);
                                                    }
                                                    // Convert string to number for numeric fields
                                                    const numValue = e.target.value === '' ? '' : Number(e.target.value);
                                                    field.onChange(numValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ) : (
                                    <FormItem>
                                        <FormControl>
                                            <CompactInput
                                                label={`${displayNames ? displayNames[fieldKey] : fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                                {...field}
                                                {...(passwordList?.includes(fieldKey) ? { type: 'password' } : {})}
                                                {...(finalDateList?.includes(fieldKey) ? { type: 'date' } : {})}
                                                placeholder={`Ingresa ${displayNames ? displayNames[fieldKey]?.toLowerCase() : fieldKey}`}
                                                value={field.value as string}
                                                onChange={(e) => {
                                                    // Clear field error when user starts typing
                                                    if (form.formState.errors[fieldKey as Path<FormData>]) {
                                                        form.clearErrors(fieldKey as Path<FormData>);
                                                    }
                                                    field.onChange(e);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            )}
                        />
                    ))}
                    <StatefulButton
                        ref={buttonRef}
                        type="submit"
                        className="w-full"
                        disabled={isButtonDisabled}
                        variant="default"
                    >
                        {buttonTitle}
                    </StatefulButton>
                </form>
            </Form>
        </div>
    );
});
