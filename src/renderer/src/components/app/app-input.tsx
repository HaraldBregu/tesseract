import { forwardRef, memo } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

const AppInput = forwardRef<
	HTMLInputElement,
	React.ComponentPropsWithoutRef<typeof Input>
>(({ className, ...props }, ref) => {
	return (
		<Input
			ref={ref}
			className={cn(className)}
			{...props}
		/>
	)
})
AppInput.displayName = Input.displayName;

export default memo(AppInput);


