import { useTransform, motion, MotionValue } from "framer-motion";
const FramerBox = motion.div

export default function Indicator({ index, progress, color, sliderWidth, size = 8 }: {
    index: number;
    progress: MotionValue<number>;
    color: string;
    sliderWidth: number;
    size?: number;
}) {
    const x = useTransform(() => (progress.get() > 0 ? 0 : -progress.get()));
    const opacity = useTransform(() => {
        return x.get() < sliderWidth * index && x.get() > (index - 2) * sliderWidth
            ? 0
            : 1;
    });
    return (
        <FramerBox style={{ opacity, width: size * 2, height: size }}>
            <div style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2, marginLeft: size / 2, marginRight: size / 2 }} />
        </FramerBox>
    );
};