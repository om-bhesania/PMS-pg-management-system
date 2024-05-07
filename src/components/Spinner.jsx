
import { Spinner } from '@chakra-ui/react';
const SpinnerComponent = ({ variant }) => {
    const customSize = {
        xs: `!w-4 !h-4`,
        sm: `!w-6 !h-6`,
        md: `!w-8 !h-8`,
        lg: `!w-10 !h-10`,
        xl: `!w-12 !h-12`,
        '2xl': `!w-16 !h-16 `,
        '3xl': `!w-20 !h-20 `,
        '4xl': `!w-24 !h-24 `,
        '5xl': `!w-28 !h-28 `,
        '6xl': `!w-32 !h-32 `,
        '7xl': `!w-36 !h-36 `,
    }
    return (
        <Spinner className={`text-primary font-bold !border-[3px] ${customSize[variant]}`} size={"xl"} />
    )
}

export default SpinnerComponent