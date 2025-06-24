import Account from "@/components/icons/Account";
import Button from "../ui/button";
import Right from "@/components/icons/Right";

const ButtonStyling: React.FC = () => {
    return (
        <div className="w-full h-full p-4">
            <h1>Button Style Container</h1>
            <div className="grid grid-cols-3 gap-6 m-2">
                {/* Colonna pulsanti primari */}
                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">Primary buttons</h3>
                    <Button intent="primary" variant="filled"
                        leftIcon={<Account intent="primary" variant="filled" />}
                        rightIcon={<Right intent="primary" variant="filled" />}
                    >
                        primary filled
                    </Button>
                    <Button intent="primary" variant="outline" >
                        primary outline
                    </Button>
                    <Button disabled intent="primary" variant="tonal" >
                        primary tonale
                    </Button>
                </div>
                {/* Colonna pulsanti secondari */}
                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">Secondary buttons</h3>
                    <Button intent="secondary" variant="filled" >
                        secondary filled
                    </Button>
                    <Button disabled intent="secondary" variant="outline" >
                        secondary outline
                    </Button>
                    <Button intent="secondary" variant="tonal" >
                        secondary tonal
                    </Button>
                </div>
                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">Destructive buttons</h3>
                    <Button intent="destructive" variant="tonal" >
                        destructive tonal
                    </Button>
                </div>
                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">Primary buttons mini</h3>
                    <Button intent="primary" variant="filled" size="mini"
                        leftIcon={<Account intent="primary" variant="filled" size="small" />}
                        rightIcon={<Right intent="primary" variant="filled" size="small" />}
                    >
                        primary filled
                    </Button>
                    <Button intent="primary" variant="outline" size="mini">
                        primary outline
                    </Button>
                    <Button intent="primary" variant="tonal" size="mini">
                        primary tonale
                    </Button>
                </div>

                {/* Colonna pulsanti secondari */}
                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">Secondary buttons mini</h3>
                    <Button intent="secondary" variant="filled" size="mini">
                        secondary filled
                    </Button>
                    <Button intent="secondary" variant="outline" size="mini">
                        secondary outline
                    </Button>
                    <Button intent="secondary" variant="tonal" size="mini">
                        secondary tonal
                    </Button>
                </div>

                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">Destructive buttons mini</h3>
                    <Button intent="destructive" variant="tonal" size="mini">
                        destructive tonale
                    </Button>
                </div>
            </div>

            {/* Nuova sezione per bottoni icon */}
            <h2 className="text-xl font-bold mt-8 mb-4">Icon Buttons</h2>
            <div className="grid grid-cols-3 gap-6 m-2">
                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">Primary Icon Buttons</h3>
                    <div className="flex items-center gap-2">
                        <Button intent="primary" variant="filled" icon={<Account intent="primary" variant="filled" />} />
                        <Button intent="primary" variant="outline" icon={<Account intent="primary" variant="outline" />} />
                        <Button intent="primary" variant="tonal" icon={<Account intent="primary" variant="tonal" />} />
                    </div>
                    <h4 className="font-medium mt-2">Small</h4>
                    <div className="flex items-center gap-2">
                        <Button intent="primary" variant="filled" size="iconSm" icon={<Account intent="primary" variant="filled" size="small" />} />
                        <Button intent="primary" variant="outline" size="iconSm" icon={<Account intent="primary" variant="outline" size="small" />} />
                        <Button intent="primary" variant="tonal" size="iconSm" icon={<Account intent="primary" variant="tonal" size="small" />} />
                    </div>
                </div>

                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">Secondary Icon Buttons</h3>
                    <div className="flex items-center gap-2">
                        <Button intent="secondary" variant="filled" icon={<Right intent="secondary" variant="filled" />} />
                        <Button intent="secondary" variant="outline" icon={<Right intent="secondary" variant="outline" />} />
                        <Button intent="secondary" variant="tonal" icon={<Right intent="secondary" variant="tonal" />} />
                    </div>
                    <h4 className="font-medium mt-2">Small</h4>
                    <div className="flex items-center gap-2">
                        <Button intent="secondary" variant="filled" size="iconSm" icon={<Right intent="secondary" variant="filled" size="small" />} />
                        <Button intent="secondary" variant="outline" size="iconSm" icon={<Right intent="secondary" variant="outline" size="small" />} />
                        <Button intent="secondary" variant="tonal" size="iconSm" icon={<Right intent="secondary" variant="tonal" size="small" />} />
                    </div>
                </div>

                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">Destructive Icon Buttons</h3>
                    <div className="flex items-center gap-2">
                        <Button intent="destructive" variant="filled" icon={<Account intent="destructive" variant="filled" />} />
                        <Button intent="destructive" variant="outline" icon={<Account intent="destructive" variant="outline" />} />
                        <Button intent="destructive" variant="tonal" icon={<Account intent="destructive" variant="tonal" />} />
                    </div>
                    <h4 className="font-medium mt-2">Small</h4>
                    <div className="flex items-center gap-2">
                        <Button intent="destructive" variant="filled" size="iconSm" icon={<Account intent="destructive" variant="filled" size="small" />} />
                        <Button intent="destructive" variant="outline" size="iconSm" icon={<Account intent="destructive" variant="outline" size="small" />} />
                        <Button intent="destructive" variant="tonal" size="iconSm" icon={<Account intent="destructive" variant="tonal" size="small" />} />
                    </div>
                </div>
            </div>

            {/* Esempi di bottoni disabilitati */}
            <h2 className="text-xl font-bold mt-8 mb-4">Disabled Icon Buttons</h2>
            <div className="grid grid-cols-3 gap-6 m-2">
                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">Disabled Icons</h3>
                    <div className="flex items-center gap-2">
                        <Button disabled intent="primary" variant="filled" icon={<Account disabled intent="primary" variant="filled" />} />
                        <Button disabled intent="primary" variant="outline" icon={<Account disabled intent="primary" variant="outline" />} />
                        <Button disabled intent="primary" variant="tonal" icon={<Account disabled intent="primary" variant="tonal" />} />
                    </div>
                    <h4 className="font-medium mt-2">Small</h4>
                    <div className="flex items-center gap-2">
                        <Button disabled intent="primary" variant="filled" size="iconSm" icon={<Account disabled intent="primary" variant="filled" size="small" />} />
                        <Button disabled intent="secondary" variant="outline" size="iconSm" icon={<Right disabled intent="secondary" variant="outline" size="small" />} />
                        <Button disabled intent="destructive" variant="tonal" size="iconSm" icon={<Right disabled intent="destructive" variant="tonal" size="small" />} />
                        <Button
                            variant="border"
                            size="iconSm"
                            intent="primary"
                        >
                            A
                        </Button>
                        <Button
                            variant="border"
                            size="iconSm"
                            intent="secondary"
                            icon={<Right intent="secondary" variant="tonal" size="small" />}
                        />
                        <Button
                            variant="icon"
                            size="iconSm"
                            intent="primary"
                        >
                            A
                        </Button>
                        <Button
                            variant="icon"
                            size="iconSm"
                            intent="secondary"
                            icon={<Right intent="secondary" variant="tonal" size="small" />}
                        />
                    </div>
                </div>
            </div>
            <h2 className="text-xl font-bold mt-8 mb-4">Ghost Buttons</h2>
            <div className="grid grid-cols-3 gap-6 m-2">
                <div className="flex flex-col space-y-4">
                    <h3 className="font-medium mb-2">primary buttons</h3>
                    <Button intent="primary" variant="link" size="small"
                        leftIcon={<Account intent="primary" variant="outline" />}
                        rightIcon={<Right intent="primary" variant="outline" />}
                    >
                        primary link
                    </Button>
                    <Button intent="secondary" variant="icon" size="small"
                        leftIcon={<Account intent="secondary" variant="outline" />}
                        rightIcon={<Right intent="secondary" variant="outline" />}
                    >
                        secondary icon
                    </Button>
                    <Button intent="primary" variant="border" size="small"
                        rightIcon={<Right intent="primary" variant="outline" />}
                    >
                        primary filled
                    </Button>
                    <Button intent="secondary" variant="link" size="small"
                        rightIcon={<Right intent="secondary" variant="outline" />}
                    >
                        secondary link
                    </Button>
                    <Button intent="primary" variant="border" size="small">
                        primary border
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ButtonStyling;