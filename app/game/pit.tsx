import { PitProps } from "@/types/pit-type";
import { Button } from "@/components/ui/button";

const Pit = ({ stones, onClick, disabled }: PitProps) => {
    return (
        <Button
        style={{
            width: '5rem',
            height: '4rem',
            borderRadius: '50%',
            border: '2px solid',
            borderColor: disabled ? '#333' : '#2196f3'
        }}
        variant="outline"
        onClick={onClick}
        disabled={disabled}
    >
        {stones}
    </Button>
    )
};

export default Pit;