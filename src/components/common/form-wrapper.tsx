import { z } from "zod";
import { PropsWithChildren, forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { Form } from "../ui/form";
import { useForm, UseFormSetValue } from "react-hook-form";
import { fetchWithToast } from "@/hooks/fetch-with-toast";
import { StatefulButton, StatefulButtonRef } from "../ui/stateful-button";
import { zodResolver } from "@hookform/resolvers/zod";


interface FormWrapperProps {
    children: React.ReactNode;
    className?: string;
    extraData?: any;
    endpointType?: string;
    onError?: (error: any) => void;
    endpoint: string;
    entityName: string;
    onSuccess?: (data: any) => void;
    buttonTitle?: string;
    isSubmitDisabled?: boolean;
    formSchema: z.ZodType<any, any>;
    defaultValues: any;
}

export type FormWrapperRef = {
    setValue: UseFormSetValue<any>;
    getValues: () => any;
    loading: boolean;
};

export const FormWrapper = forwardRef(
    function FormWrapper({ buttonTitle, isSubmitDisabled, formSchema, defaultValues, children, className, extraData, endpointType, onError, endpoint, entityName, onSuccess }: PropsWithChildren<FormWrapperProps>, ref: React.Ref<FormWrapperRef>) {

        type FormData = z.infer<typeof formSchema>;

        const form = useForm<FormData>({
            resolver: zodResolver(formSchema) as any,
            defaultValues,
            mode: 'onChange'
        });

        useImperativeHandle(ref, () => ({
            setValue: form.setValue,
            getValues: form.getValues,
            loading: form.formState.isSubmitting
        }));

        const buttonRef = useRef<StatefulButtonRef>(null);


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
                    {children}
                    <StatefulButton
                        ref={buttonRef}
                        type="submit"
                        className="w-full"
                        disabled={isButtonDisabled}
                        variant="default"
                    >
                        {buttonTitle || "Save"}
                        {form.formState?.errors && (
                            <div className="text-red-500">
                                {form.formState?.errors?.message?.toString()}
                            </div>
                        )}
                    </StatefulButton>
                </form>
            </Form >
        );
    })