import AppCheckbox from "@/components/app-checkbox"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";


interface PageVisibilityElementsProps {
    data: {
        key: string,
        value: boolean,
        required: boolean,
    }[],
    onChange: (data: {
        key: string,
        value: boolean,
        required: boolean,
    }[]) => void,
    readonly: boolean,
}

const PageVisibilityElements = ({
    data,
    onChange,
    readonly,
}: PageVisibilityElementsProps) => {
    const { t } = useTranslation();

    const visibilityDataRef = useRef<{
        key: string,
        value: boolean,
        required: boolean,
    }[]>(data)

    useEffect(() => {
        visibilityDataRef.current = data
    }, [data])

    const handleChange = useCallback((v: string, e: boolean) => {
        visibilityDataRef.current = visibilityDataRef.current?.map((el) => el.key === v ? { ...el, value: e } : el)
        onChange(visibilityDataRef.current)
    }, [])

    return (
        <AccordionItem value="item-1" className={'text-[13px]'}>
            <AccordionTrigger className={'text-[13px]'}>
                {t('pageSetup.component.sectionInclude')}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2 text-[13px] font-normal">
                <AppCheckbox
                    id="toc"
                    label={t(`pageSetup.component.section.toc`)}
                    onCheckedChange={(e) => {
                        handleChange("toc", e)
                    }}
                    checked={visibilityDataRef.current?.find((el) => el.key === "toc")?.value}
                    disabled={visibilityDataRef.current?.find((el) => el.key === "toc")?.required || readonly}
                />
                <AppCheckbox
                    id="intro"
                    label={t(`pageSetup.component.section.intro`)}
                    onCheckedChange={(e) => {
                        handleChange("intro", e)
                    }}
                    checked={visibilityDataRef.current?.find((el) => el.key === "intro")?.value}
                    disabled={visibilityDataRef.current?.find((el) => el.key === "intro")?.required || readonly}
                />
                <AppCheckbox
                    id="critical"
                    label={t(`pageSetup.component.section.critical`)}
                    onCheckedChange={(e) => {
                        handleChange("critical", e)
                    }}
                    checked={visibilityDataRef.current?.find((el) => el.key === "critical")?.value}
                    disabled={data?.find((el) => el.key === "critical")?.required || readonly}
                />
                <AppCheckbox
                    id="bibliography"
                    label={t(`pageSetup.component.section.bibliography`)}
                    onCheckedChange={(e) => {
                        handleChange("bibliography", e)
                    }}
                    checked={visibilityDataRef.current?.find((el) => el.key === "bibliography")?.value}
                    disabled={visibilityDataRef.current?.find((el) => el.key === "bibliography")?.required || readonly}
                />
            </AccordionContent>
        </AccordionItem>
    )
}

export default PageVisibilityElements