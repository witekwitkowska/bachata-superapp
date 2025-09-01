"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Path, useForm, UseFormSetValue } from "react-hook-form";
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

type ConfigurableFormProps<T extends z.ZodType<any, any>> = {
    formSchema: T;
    endpoint: string;
    entityName: string;
    displayNames: any;
    defaultValues: z.infer<T>;
    buttonTitle?: string;
    headerTitle?: string;
    loadingTitle?: string;
    onSuccess?: () => void;
    extraData?: any;
    className?: string;
    selectorList?: string[]
    multiSelectorList?: string[]
    switchList?: string[]
    optionsMap?: any;
    endpointType?: string;
    isSubmitDisabled?: boolean;
    passwordList?: string[]
    dateList?: string[]
    containerClassName?: string;
    onError?: (error: any) => void;
};

export type ConfigurableFormRef<T extends z.ZodType<any, any>> = {
    setValue: UseFormSetValue<z.infer<T>>;
    getValues: () => z.infer<T>;
    loading: boolean;
};

export const ConfigurableForm = forwardRef(function ConfigurableForm<T extends z.ZodType<any, any>>({
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
    containerClassName
}: ConfigurableFormProps<T>, ref: React.Ref<ConfigurableFormRef<T>>) {
    // Define the form data type
    type FormData = z.infer<T>;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema) as any,
        defaultValues,
        mode: 'onChange'
    });

    const buttonRef = useRef<StatefulButtonRef>(null);

    useImperativeHandle(ref, () => ({
        setValue: form.setValue,
        getValues: form.getValues,
        loading: form.formState.isSubmitting
    }));

    const requiredList = useMemo(() => getZodRequiredFields(formSchema), [formSchema])

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
        handleFinish
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
                    {Object.keys(defaultValues).map((fieldKey) => (
                        <FormField
                            key={fieldKey}
                            control={form.control as any}
                            name={fieldKey as Path<FormData>}
                            render={({ field }) => (
                                selectorList?.includes(fieldKey) ? (
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
                                                options={optionsMap[fieldKey]}
                                                value={field.value}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ) : multiSelectorList?.includes(fieldKey) ? (
                                    <FormItem>
                                        <FormLabel>
                                            {`${displayNames[fieldKey]}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                        </FormLabel>
                                        <FormControl>
                                            <MultiSelector
                                                options={optionsMap[fieldKey]}
                                                setSelected={(value) => {
                                                    field.onChange(value)
                                                    form.trigger(fieldKey as Path<FormData>)
                                                }}
                                                selected={field.value}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ) : switchList?.includes(fieldKey) ? (
                                    <FormItem>
                                        <FormLabel>
                                            {`${displayNames[fieldKey]}${requiredList.includes(fieldKey) ? ' *' : ''}`}
                                        </FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
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
                                                {...(dateList?.includes(fieldKey) ? { type: 'date' } : {})}
                                                placeholder={`Ingresa ${displayNames ? displayNames[fieldKey]?.toLowerCase() : fieldKey}`}
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
