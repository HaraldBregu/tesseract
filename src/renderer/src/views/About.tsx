import Button from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import appIcon from '@resources/appIcons/icon_512.png';
import { ThemeProvider } from '@/providers/theme-provider';
import { getAppInfo } from '@/utils/utils';

// TODO need to place proper links for license and acknowledgement
const filePaths = {
    license: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository',
    acknowledgement: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service'
}

const About: React.FC = () => {

    const { t } = useTranslation();

    const { name, copyright, license, version } = getAppInfo();

    const navigateTo = useCallback((path: string) => {
        return () => {
            window.electron.ipcRenderer.send('open-external-file', filePaths[path]);
        };
    }, []);

    // Notify main process when component is mounted and ready to show
    useEffect(() => {
        window.electron.ipcRenderer.send('child-window-ready');
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row gap-4 items-start p-4">
                <div className="flex items-center justify-center p-3">
                    <img className='w-[120px] rounded-3xl' src={appIcon} alt={name} />
                </div>
                <div className="flex flex-col py-3 flex-1 gap-1 text-grey-10 dark:text-grey-90">
                    <h4 className='text-[28px]/[32px] font-bold'>{name}</h4>
                    <div className="flex flex-col gap-[2px]">
                        <Label className="text-[15px]/[20px] font-normal">
                            {t('about.version')} {version}
                        </Label>
                        <Label className="text-[15px]/[20px] font-normal">
                            {t('about.license')}: {license}
                        </Label>
                        <Label className="text-[15px]/[20px] font-normal">
                            {copyright}
                        </Label>
                    </div>
                </div>
            </div>
            <div className="border-t border-grey-80 dark:border-grey-50 p-4 h-auto max-h-16 flex flex-row gap-2 justify-end">
                <Button key="cancel" className="text-secondary-30 text-[13px] font-semibold border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" size="mini" intent="secondary" variant="tonal" onClick={navigateTo('acknowledgement')}>
                    {t('buttons.acknowledgements')}
                </Button>
                <Button key="save" className="text-secondary-30 text-[13px] font-semibold border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" size="mini" intent="secondary" variant="tonal" onClick={navigateTo('license')}>
                    {t('buttons.licenseAgreement')}
                </Button>
            </div>
        </div>
    );
};

const AboutWithTheme: React.FC = () => {
    return (
        <ThemeProvider>
            <About />
        </ThemeProvider>
    )
}

export default AboutWithTheme;