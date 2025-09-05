"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Path, useForm, UseFormSetValue, DefaultValues } from "react-hook-form";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { fetchWithToast } from "@/hooks/fetch-with-toast";
import { forwardRef, useImperativeHandle, useMemo, useRef, useCallback, useState } from "react";
import MultiSelector from "@/components/common/multi-selector";
import Selector from "@/components/common/selector";
import { getZodRequiredFields } from "@/lib/utils";
import { extractSchemaDefaults } from "@/utils";
import { CompactInput } from "@/components/ui/compact-input";
import { StatefulButton, StatefulButtonRef } from "../ui/stateful-button";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "./date-time-picker";
import { DatePicker } from "./date-picker";
import { ImageUploadWithPreview } from "../image-upload-with-preview";
import { CoordinatesInput } from "./coordinates-input";
import { VideoLinksInput } from "./video-links-input";

type ConfigurableFormProps<T extends z.ZodObject<any>> = {
    formSchema: T;
    endpoint: string;
    entityName: string;
    displayNames: Record<string, string>;
    defaultValues?: z.infer<T>;
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
    dateTimeList?: string[] // Fields that need full date + time
    dateOnlyList?: string[] // Fields that need date only (no time)
    weekdayList?: string[] // Fields that need weekday selection
    imagesList?: string[] // Fields that need image upload with preview
    coordinatesList?: string[] // Fields that need coordinates input (lat, lng)
    inputList?: string[] // Fields that need special input components (like videoLinks)
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
    dateTimeList,
    dateOnlyList,
    weekdayList,
    imagesList,
    coordinatesList,
    inputList,
    containerClassName,
    exclusionList,
    onFormSuccess
}: ConfigurableFormProps<T>, ref: React.Ref<ConfigurableFormRef<T>>) {
    // Define the form data type
    type FormData = z.infer<T>;

    // Automatically extract default values from schema if none provided
    const computedDefaultValues = useMemo(() => {
        if (defaultValues) {
            return defaultValues;
        }

        // Extract defaults from schema
        const schemaDefaults = extractSchemaDefaults(formSchema);

        // If no defaults were extracted, create defaults for all schema fields
        if (Object.keys(schemaDefaults).length === 0) {
            const allFieldsDefaults: Record<string, any> = {};
            for (const fieldName of Object.keys(formSchema.shape)) {
                allFieldsDefaults[fieldName] = undefined;
            }
            return allFieldsDefaults;
        }
        return schemaDefaults;
    }, [defaultValues, formSchema]);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: computedDefaultValues as DefaultValues<FormData>,
        mode: 'onChange'
    });

    const buttonRef = useRef<StatefulButtonRef>(null);
    const [isUploading, setIsUploading] = useState(false);

    useImperativeHandle(ref, () => ({
        setValue: form.setValue,
        getValues: form.getValues,
        loading: form.formState.isSubmitting
    }));

    const requiredList = useMemo(() => getZodRequiredFields(formSchema), [formSchema])

    // Utility function to extract options from Zod schema
    const extractOptionsFromSchema = useCallback((fieldName: string) => {
        let currentSchema = formSchema.shape[fieldName];
        if (!currentSchema) return [];

        // Navigate through ZodDefault and ZodOptional wrappers
        while (currentSchema.constructor.name === 'ZodDefault' || currentSchema.constructor.name === 'ZodOptional') {
            currentSchema = (currentSchema as any)._def?.innerType;
        }

        // Handle array of enums (like weeklyDays)
        if (currentSchema.constructor.name === 'ZodArray') {
            const innerSchema = (currentSchema as any)._def.element;
            if (innerSchema.constructor.name === 'ZodEnum') {
                // Try different possible property names for enum values
                let enumValues: string[] = [];

                if ((innerSchema as any)._def.values) {
                    enumValues = (innerSchema as any)._def.values;
                } else if ((innerSchema as any)._def.options) {
                    enumValues = (innerSchema as any)._def.options;
                } else if ((innerSchema as any)._def.entries) {
                    // For newer Zod versions, enum values are in _def.entries
                    enumValues = Object.keys((innerSchema as any)._def.entries);
                }

                const options = enumValues.map((value: string) => ({
                    value,
                    label: value.charAt(0).toUpperCase() + value.slice(1)
                }));
                return options;
            }
        }

        // Handle direct enums
        if (currentSchema.constructor.name === 'ZodEnum') {
            // Try different possible property names for enum values
            let enumValues: string[] = [];

            if ((currentSchema as any)._def.values) {
                enumValues = (currentSchema as any)._def.values;
            } else if ((currentSchema as any)._def.options) {
                enumValues = (currentSchema as any)._def.options;
            } else if ((currentSchema as any)._def.entries) {
                // For newer Zod versions, enum values are in _def.entries
                enumValues = Object.keys((currentSchema as any)._def.entries);
            }

            const options = enumValues.map((value: string) => ({
                value,
                label: value.charAt(0).toUpperCase() + value.slice(1)
            }));
            return options;
        }

        // Handle unions
        if (currentSchema.constructor.name === 'ZodUnion') {
            const options = (currentSchema as any)._def.options.map((option: any) => {
                if (option.constructor.name === 'ZodLiteral') {
                    const value = option._def.value;
                    return {
                        value: value.toString(),
                        label: value.toString().charAt(0).toUpperCase() + value.toString().slice(1)
                    };
                }
                return null;
            }).filter(Boolean);
            return options;
        }

        return [];
    }, [formSchema]);

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
                // All array fields should use MultiSelector
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
    const finalArrayList = multiSelectorList && multiSelectorList.length > 0 ? multiSelectorList : autoDetectedLists.arrayFields.filter(field => !inputList?.includes(field));
    const finalNumericList = autoDetectedLists.numericFields;



    const handleFinish = useCallback((success: boolean) => {
        if (buttonRef.current) {
            buttonRef.current.finishAnimation(success);
        }
    }, []);


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

    const isButtonDisabled = isSubmitDisabled || !isValid || !isDirty || isSubmitting || loading || isUploading;



    return (
        <div className={containerClassName}>
            <Form {...form}>
                <form
                    {...(className ? { className } : { className: "space-y-4" })}
                    onSubmit={form.handleSubmit(async (data) => {
                        // Convert null values to undefined for optional fields
                        const cleanedData = Object.keys(data).reduce((acc, key) => {
                            const value = (data as any)[key];
                            acc[key] = value === null ? undefined : value;
                            return acc;
                        }, {} as any);

                        const mergedData = { ...cleanedData, ...extraData };
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
                    {(() => {
                        // Use schema fields instead of computedDefaultValues keys
                        return Object.keys(formSchema.shape);
                    })().filter(fieldKey => {
                        const isExcluded = exclusionList?.includes(fieldKey);
                        const isObjectField = autoDetectedLists.objectFields.includes(fieldKey);
                        const isCoordinatesField = coordinatesList?.includes(fieldKey);
                        const isInputListField = inputList?.includes(fieldKey);
                        const shouldExclude = isExcluded || (isObjectField && !isCoordinatesField && !isInputListField);
                        return !shouldExclude;
                    }).map((fieldKey) => {


                        return (
                            <FormField
                                key={fieldKey}
                                control={form.control}
                                name={fieldKey as Path<FormData>}
                                render={({ field }) => (
                                    finalSelectorList?.includes(fieldKey) ? (
                                        <FormItem className="space-y-0">
                                            <FormLabel>
                                                {`${displayNames[fieldKey] || fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                            </FormLabel>


                                            <FormControl>
                                                <Selector
                                                    setSelectedValue={(value) => {
                                                        field.onChange(value)
                                                        form.trigger(fieldKey as Path<FormData>)
                                                    }}
                                                    placeholder={'Select'}
                                                    options={optionsMap?.[fieldKey] || extractOptionsFromSchema(fieldKey)}
                                                    value={field.value as string}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) : imagesList?.includes(fieldKey) ? (
                                        <FormItem className="col-span-2">
                                            <FormLabel>
                                                {`${displayNames?.[fieldKey] || fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                            </FormLabel>
                                            <FormControl>
                                                <ImageUploadWithPreview
                                                    existingImages={field.value as string[] || []}
                                                    onImagesChange={(images) => {
                                                        if (form.formState.errors[fieldKey as Path<FormData>]) {
                                                            form.clearErrors(fieldKey as Path<FormData>);
                                                        }
                                                        field.onChange(images);
                                                    }}
                                                    maxImages={10}
                                                    multiple={true}
                                                    showExistingImages={true}
                                                    allowRemoveExisting={true}
                                                    onStartUpload={() => {
                                                        setIsUploading(true);
                                                    }}
                                                    onEndUpload={() => {
                                                        setIsUploading(false);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) : finalArrayList?.includes(fieldKey) ? (
                                        <FormItem>
                                            <FormLabel>
                                                {`${displayNames[fieldKey] || fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                            </FormLabel>
                                            <FormControl>
                                                <MultiSelector
                                                    options={optionsMap?.[fieldKey] || extractOptionsFromSchema(fieldKey)}
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
                                                {`${displayNames[fieldKey] || fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
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
                                                    placeholder={`Ingresa ${displayNames?.[fieldKey]?.toLowerCase() || fieldKey}`}
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
                                    ) : dateTimeList?.includes(fieldKey) ? (
                                        <FormItem>
                                            <FormLabel>
                                                {`${displayNames?.[fieldKey] || fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                            </FormLabel>
                                            <FormControl>
                                                <DateTimePicker
                                                    value={field.value as Date | string}
                                                    onChange={(value) => {
                                                        if (form.formState.errors[fieldKey as Path<FormData>]) {
                                                            form.clearErrors(fieldKey as Path<FormData>);
                                                        }
                                                        field.onChange(value);
                                                    }}
                                                    placeholder={`Select ${displayNames?.[fieldKey]?.toLowerCase() || fieldKey}`}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) : dateOnlyList?.includes(fieldKey) ? (
                                        <FormItem>
                                            <FormLabel>
                                                {`${displayNames?.[fieldKey] || fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                            </FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value as Date | string}
                                                    onChange={(value) => {
                                                        if (form.formState.errors[fieldKey as Path<FormData>]) {
                                                            form.clearErrors(fieldKey as Path<FormData>);
                                                        }
                                                        field.onChange(value);
                                                    }}
                                                    placeholder={`Select ${displayNames?.[fieldKey]?.toLowerCase() || fieldKey}`}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) : finalDateList?.includes(fieldKey) ? (
                                        <FormItem>
                                            <FormLabel>
                                                {`${displayNames?.[fieldKey] || fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                            </FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value as Date | string}
                                                    onChange={(value) => {
                                                        if (form.formState.errors[fieldKey as Path<FormData>]) {
                                                            form.clearErrors(fieldKey as Path<FormData>);
                                                        }
                                                        field.onChange(value);
                                                    }}
                                                    placeholder={`Select ${displayNames?.[fieldKey]?.toLowerCase() || fieldKey}`}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) : coordinatesList?.includes(fieldKey) ? (
                                        <FormItem>
                                            <FormControl>
                                                <CoordinatesInput
                                                    value={field.value as { lat: number; lng: number } | null}
                                                    onChange={(value) => {
                                                        if (form.formState.errors[fieldKey as Path<FormData>]) {
                                                            form.clearErrors(fieldKey as Path<FormData>);
                                                        }
                                                        field.onChange(value);
                                                    }}
                                                    label={`${displayNames?.[fieldKey] || fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                                    required={requiredList.includes(fieldKey)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) : inputList?.includes(fieldKey) ? (
                                        <FormItem>
                                            <FormControl>
                                                {fieldKey === 'videoLinks' ? (
                                                    <VideoLinksInput
                                                        value={field.value as any[] || []}
                                                        onChange={(value) => {
                                                            if (form.formState.errors[fieldKey as Path<FormData>]) {
                                                                form.clearErrors(fieldKey as Path<FormData>);
                                                            }
                                                            field.onChange(value);
                                                        }}
                                                        label={`${displayNames?.[fieldKey] || fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                                        placeholder={`Enter ${displayNames?.[fieldKey]?.toLowerCase() || fieldKey}...`}
                                                    />
                                                ) : (
                                                    <CompactInput
                                                        label={`${displayNames ? displayNames[fieldKey] : fieldKey}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                                        {...field}
                                                        placeholder={`Ingresa ${displayNames?.[fieldKey]?.toLowerCase() || fieldKey}`}
                                                        value={field.value as string}
                                                        onChange={(e) => {
                                                            if (form.formState.errors[fieldKey as Path<FormData>]) {
                                                                form.clearErrors(fieldKey as Path<FormData>);
                                                            }
                                                            field.onChange(e);
                                                        }}
                                                    />
                                                )}
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
                                                    placeholder={`Ingresa ${displayNames?.[fieldKey]?.toLowerCase() || fieldKey}`}
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
                        )
                    })}


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
