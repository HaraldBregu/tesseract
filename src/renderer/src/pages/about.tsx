import Button from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Modal from '@/components/ui/modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import appIcon from '@resources/appIcons/icon_512.png'
import appInfo from '@resources/appInfo.json'

interface AboutProps {
  isOpen: boolean
  onClose: () => void
}

// TODO need to place proper links for license and acknowledgement
const filePaths = {
  license:
    'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository',
  acknowledgement: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service'
}

const About: React.FC<AboutProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()

  const { name, copyright, license, version } = appInfo

  const navigateTo = (path: string) => {
    window?.electron?.ipcRenderer?.send('open-external-file', filePaths[path])
  }

  return (
    <Modal
      key={'about-modal'}
      isOpen={isOpen}
      onOpenChange={onClose}
      title={t('about.label')}
      className="w-[440px] border-none gap-0"
      contentClassName="flex flex-col gap-8"
      footerClassName="p-4 h-auto"
      showCloseIcon={true}
      actions={[
        <Button
          key="cancel"
          className="text-secondary-30 text-[13px] font-semibold border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          size="mini"
          intent="secondary"
          variant="tonal"
          onClick={() => navigateTo('acknowledgement')}
        >
          {t('buttons.acknowledgements')}
        </Button>,
        <Button
          key="save"
          className="text-secondary-30 text-[13px] font-semibold border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          size="mini"
          intent="secondary"
          variant="tonal"
          onClick={() => navigateTo('license')}
        >
          {t('buttons.licenseAgreement')}
        </Button>
      ]}
    >
      <div className="flex flex-row gap-4 items-start">
        <div className="flex items-center justify-center p-3">
          <img className="w-[120px] rounded-3xl" src={appIcon} alt={name} />
        </div>
        <div className="flex flex-col py-3 flex-1 gap-1 text-grey-10">
          <h4 className="text-[28px]/[32px] font-bold">{name}</h4>
          <div className="flex flex-col gap-[2px]">
            <Label className="text-[15px]/[20px] font-normal">
              {t('about.version')} {version}
            </Label>
            <Label className="text-[15px]/[20px] font-normal">
              {t('about.license')}: {license}
            </Label>
            <Label className="text-[15px]/[20px] font-normal">{copyright}</Label>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default About
