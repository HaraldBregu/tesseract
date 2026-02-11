import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addApparatusAtIndex,
    changeApparatusTitle,
    changeApparatusType,
    removeApparatus,
    toggleExpandedApparatus,
    updateVisibleApparatuses,
} from "../store/editor/editor.slice";
import {
    selectApparatusesTypes,
    selectCriticalApparatuses,
    selectDisabledRemainingApparatusesTypes,
    selectEnabledRemainingApparatusesTypes,
    selectExpandedApparatuses,
    selectVisibleApparatuses,
} from "../store/editor/editor.selector";
import { useElectron } from "@/hooks/use-electron";

export interface UseApparatusesReturn {
    visibleApparatuses: Apparatus[]
    expandedApparatuses: Apparatus[]
    apparatusesTypes: ApparatusType[]
    activeTypes: ApparatusType[]
    disabledTypes: ApparatusType[]
    hasOneCriticalApparatus: boolean
    reorder: (newTabs: Apparatus[]) => void;
    expand: (item: Apparatus) => void;
    changeTypeToCritical: (id: string) => void;
    changeTypeToPageNotes: (id: string) => void;
    changeTypeToSectionNotes: (id: string) => void;
    changeTypeToInnerMargin: (id: string) => void;
    changeTypeToOuterMargin: (id: string) => void;
    addNewApparatus: (index: number) => (type: ApparatusType) => void;
    updateApparatus: (apparatus: Apparatus) => void;
    removeApparatus: (apparatus: Apparatus) => void;
}

export const useApparatuses = (): UseApparatusesReturn => {
    const dispatch = useDispatch();
    const electron = useElectron()
    const visibleApparatuses = useSelector(selectVisibleApparatuses)
    const expandedApparatuses = useSelector(selectExpandedApparatuses)
    const apparatusesTypes = useSelector(selectApparatusesTypes)
    const activeTypes = useSelector(selectEnabledRemainingApparatusesTypes)
    const disabledTypes = useSelector(selectDisabledRemainingApparatusesTypes)
    const criticalApparatuses = useSelector(selectCriticalApparatuses)
    const hasOneCriticalApparatus = useMemo(() => criticalApparatuses.length === 1, [criticalApparatuses])

    const reorder = useCallback(async (newTabs: Apparatus[]) => {
        await electron.doc.reorderApparatusesByIds(newTabs.map(tab => tab.id))
        dispatch(updateVisibleApparatuses(newTabs))
    }, [dispatch])

    const expand = useCallback((item: Apparatus) => {
        const id = item.id
        const expanded = !item.expanded
        dispatch(toggleExpandedApparatus({ id }))
        electron.doc.updateApparatusExpanded(id, expanded)
    }, [dispatch])

    const addNewApparatus = useCallback((index: number) => async (type: ApparatusType) => {
        const newIndex = index + 1
        const apparatus = await electron.doc.addApparatusTypeAtIndex(type, newIndex)
        if (!apparatus)
            return
        dispatch(addApparatusAtIndex({ apparatus, index: newIndex }))
    }, [dispatch])

    const changeTypeTo = useCallback((id: string, type: ApparatusType) => {
        dispatch(changeApparatusType({ id, type }))
        electron.doc.updateApparatusType(id, type)
    }, [dispatch])

    const changeTypeToCritical = useCallback((id: string) => {
        changeTypeTo(id, 'CRITICAL')
    }, [changeTypeTo]);

    const changeTypeToPageNotes = useCallback((id: string) => {
        changeTypeTo(id, 'PAGE_NOTES')
    }, [changeTypeTo]);

    const changeTypeToSectionNotes = useCallback((id: string) => {
        changeTypeTo(id, 'SECTION_NOTES')
    }, [changeTypeTo]);

    const changeTypeToInnerMargin = useCallback((id: string) => {
        changeTypeTo(id, 'INNER_MARGIN')
    }, [changeTypeTo]);

    const changeTypeToOuterMargin = useCallback((id: string) => {
        changeTypeTo(id, 'OUTER_MARGIN')
    }, [changeTypeTo]);

    const removeApparatusHandler = useCallback((apparatus: Apparatus) => {
        const id = apparatus.id
        electron.doc.removeApparatusWithId(id)
        dispatch(removeApparatus(apparatus));
    }, [dispatch])

    const updateApparatus = useCallback((apparatus: Apparatus) => {
        const id = apparatus.id
        const title = apparatus.title
        dispatch(changeApparatusTitle({ id, title }))
        electron.doc.updateApparatusTitle(id, title)
    }, [dispatch]);

    return {
        visibleApparatuses,
        expandedApparatuses,
        apparatusesTypes,
        activeTypes,
        disabledTypes,
        hasOneCriticalApparatus,
        reorder,
        expand,
        changeTypeToCritical,
        changeTypeToPageNotes,
        changeTypeToSectionNotes,
        changeTypeToInnerMargin,
        changeTypeToOuterMargin,
        addNewApparatus,
        updateApparatus,
        removeApparatus: removeApparatusHandler,
    }
}
