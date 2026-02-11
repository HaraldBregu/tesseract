import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod"


type AnnotationCategoryInputTitleProps = {
    title: string;
    placeholder: string;
    minLength: number;
    errorMessageMinLength: string;
    maxLength: number;
    errorMessageMaxLength: string;
    onDone: (title: string) => void;
}

const AnnotationCategoryInputTitle = ({ title, placeholder, minLength, errorMessageMinLength, maxLength, errorMessageMaxLength, onDone }: AnnotationCategoryInputTitleProps) => {
    const formRef = useRef<HTMLFormElement>(null);

    const handleConfirm = useCallback((title: string) => {
        if (title.length >= minLength) {
            onDone(title)
        }
    }, [])

    const handleKeyDownTitle = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Escape") {
            e.preventDefault()
            handleConfirm(title)
            form.reset();
        }
    }, [])

    const formSchema = z.object({
        title: z.string()
            .min(minLength, {
                message: errorMessageMinLength
            })
            .max(maxLength, {
                message: errorMessageMaxLength
            }),
    })

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: title,
        },
    });

    const onSubmit = useCallback((data: any) => {
        handleConfirm(data.title)
        form.reset();
    }, [])

    useEffect(() => {
        const titleInput = formRef.current?.querySelector('input[name="title"]') as HTMLInputElement;
        if (titleInput) {
            titleInput.focus();
            titleInput.select();
        }
    }, []);

    return (
        <div className="flex justify-between items-center px-2">
            <Form {...form}>
                <form
                    ref={formRef}
                    className="w-full"
                    onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input
                                        onKeyDown={handleKeyDownTitle}
                                        className={cn(
                                            'rounded-sm w-full',
                                            form.formState.errors.title && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                        placeholder={placeholder}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    )
}

export default memo(AnnotationCategoryInputTitle)