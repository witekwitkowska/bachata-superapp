import { useState } from "react";
import { useToast } from "./use-toast";
import { handleFetch, handlePatch, handlePost, handlePut } from "@/lib/fetch";

export function fetchWithToast<T = any>(
  endpoint: string,
  entityName: string,
  body?: any,
  onSuccess?: (result?: T) => void,
  disableToast?: boolean,
  initialData?: any,
  onFinish?: (success: boolean, error?: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<T | undefined>(initialData || undefined);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const { toast } = useToast();
  return {
    loading,
    setLoading,
    success,
    error,
    errorDetails,
    data,
    setData,
    async onPost(params: any = {}) {
      try {
        setLoading(true);
        setError(""); // Clear any previous errors
        const response = await handlePost(
          `/api/${endpoint}`,
          { ...body, ...params },
          `Failed to post ${entityName}`
        );
        setSuccess(true);
        setData(response);
        onSuccess?.();
        onFinish?.(true); // Call onFinish with success
        !disableToast &&
          toast({
            title: "Success",
            description: `${entityName} creado exitosamente`,
          });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "error";
        toast({
          title: `Error al crear ${entityName}`,
          description: errorMessage,
          variant: "destructive",
        });
        setError(errorMessage);
        onFinish?.(false, errorMessage); // Call onFinish with error
        if (error instanceof Error && "data" in error) {
          setErrorDetails((error as any).data);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    async onPatch(params: any = {}) {
      try {
        setLoading(true);
        setError(""); // Clear any previous errors
        const response = await handlePatch(
          `/api/${endpoint}`,
          { ...body, ...params },
          `Failed to update ${entityName}`
        );
        setSuccess(true);
        setData(response);
        onSuccess?.();
        onFinish?.(true); // Call onFinish with success
        !disableToast &&
          toast({
            title: "Success",
            description: `${entityName} actualizado exitosamente`,
          });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "error";
        toast({
          title: `Error al actualizar ${entityName}`,
          description: errorMessage,
          variant: "destructive",
        });
        setError(errorMessage);
        onFinish?.(false, errorMessage); // Call onFinish with error
        if (error instanceof Error && "errorDetails" in error) {
          setErrorDetails((error as any).errorDetails);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    async onPut(params: any = {}, byPassOnSuccess?: boolean) {
      try {
        setLoading(true);
        setError(""); // Clear any previous errors
        const response = await handlePut(
          `/api/${endpoint}`,
          { ...body, ...params },
          `Failed to update ${entityName}`
        );
        setSuccess(true);
        setData(response);
        !byPassOnSuccess && onSuccess?.();
        onFinish?.(true); // Call onFinish with success
        !disableToast &&
          toast({
            title: "Success",
            description:
              response?.message || `${entityName} actualizado exitosamente`,
          });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "error";
        toast({
          title: `Error al actualizar ${entityName}`,
          description: errorMessage,
          variant: "destructive",
        });
        setError(errorMessage);
        onFinish?.(false, errorMessage); // Call onFinish with error
        if (error instanceof Error && "errorDetails" in error) {
          setErrorDetails((error as any).errorDetails);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    async onGet(params: any = {}) {
      try {
        setLoading(true);
        const response = await handleFetch(
          `/api/${endpoint}`,
          `Failed to update ${entityName}`
        );
        setSuccess(true);
        setData(response);
        onSuccess?.(response);
        !disableToast &&
          toast({
            title: "Success",
            description: `${entityName} recibido exitosamente`,
          });
      } catch (error) {
        toast({
          title: `Error al recibir ${entityName}`,
          description: error instanceof Error ? error.message : "error",
          variant: "destructive",
        });
        setError(error instanceof Error ? error.message : "error");
        throw error;
      } finally {
        setLoading(false);
      }
    },
  };
}
